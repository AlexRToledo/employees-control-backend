const Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    CaseRepository = require('../../repository/CaseRepository'),
    OfficeRepository = require('../../repository/OfficeRepository'),
    FoldersCaseRepository = require('../../repository/FoldersCaseRepository'),
    FilesCaseRepository = require('../../repository/FilesCaseRepository'),
    PlanWrapper = require('../../helpers/wrapper/PlanWrapper'),
    bson = require('bson'),
    fs = require('fs-extra');

const caseRepository = new CaseRepository(),
    Repository = new FoldersCaseRepository(),
    officeRepository = new OfficeRepository(),
    filesRepository = new FilesCaseRepository();

const multer  = require('multer'),
    storage = multer.memoryStorage();
    upload = multer({ storage: storage });

class FolderController extends BaseController {
    constructor(app) {
        super(app);
    }

    Router(path){
        this.app.get(`${path}`, Session.isAuth, this.List);
        this.app.post(`${path}/create`, Session.isAuth, this.Create);
        this.app.put(`${path}/edit/:id`, Session.isAuth, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, this.Remove);

        this.app.get(`${path}/:id/files`, Session.isAuth, this.GetFiles);
        //this.app.get(`${path}/file/:id`, Session.isAuth, this.GetFile);
        this.app.post(`${path}/files/create`, Session.isAuth, upload.single('file'), this.CreateFile);
        //this.app.put(`${path}/file/edit/:id`, Session.isAuth, this.EditFile);
        this.app.delete(`${path}/files/remove`, Session.isAuth, this.EraseFile);
        this.app.get(`${path}/files/download/:id`, Session.isAuth, this.DownloadFile);
    }

    async List(req, res) {
        try {
            const limit = Number(req.query.limit) > 0 ? req.query.limit : 9,
                page = req.query.page || 1;

            const user = req.user;
            const [data, total] = await Promise.all([
                Repository.FindAll({office: user.office, case_jud: req.query.id}, limit, (limit * page) - limit),
                Repository.Count({office: user.office})
            ]);
            res.json(await jsonResponse.Json({folders: data, total, page, limit}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Create(req, res) {
        try {
            const name = req.body.name,
                case_number = req.body.case_number;

            const case_jud = await caseRepository.Find({_id: case_number}, 'office');

            const folder = await Repository.Create({name: name, parent: case_jud.id, office: case_jud.office.id, case_jud: case_jud.id});

            fs.mkdirsSync(`${__dirname}/../../../files/${case_jud.office.name}/${case_jud.id}/${folder.id}`);

            res.json(await jsonResponse.Json({}, "La carpeta ha sido creada con exito."))

        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Edit(req, res) {
        try {
            const name = req.body.name,
                id = req.params.id;

            const case_jud_up = await Repository.Update({_id: id} ,{name: name});

            res.json(await jsonResponse.Json({}, "La carpeta ha sido modificada con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body._id;
            let folder = await Repository.Find({_id: id}, 'office case_jud');
            await Repository.Erase(id);
            await fs.remove(`${__dirname}/../../../files/${folder.office.name}/${folder.case_jud.id}/${folder.id}`);
            res.json(await jsonResponse.Json({}, "La carpeta ha sido eliminada con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async GetFiles(req, res) {
        try {
            const folder = req.params.id;
            const [data, total] = await Promise.all([
                    filesRepository.FindAll({parent_folder: folder, office: req.user.office.toString()}),
                    filesRepository.Count({parent_folder: folder, office: req.user.office.toString()}),
                ]);
            res.json(await jsonResponse.Json({files: data, total}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async CreateFile(req, res) {
        try {
            const folder_id = req.body.folder_id,
                originalname = req.file.originalname,
                extension = req.file.mimetype.split('/')[1],
                size = req.file.size/(1024*1024*1024),
                case_jud = req.body.case_jud,
                name = req.body.name,
                notes = req.body.note || '';

            const office = await officeRepository.Find({_id: req.user.office});
            const wrapper = new PlanWrapper(office.plan),
                path = `${__dirname}/../../../files/${office.name}/${req.body.case_jud}/${req.body.folder_id}/${originalname}`;

            await fs.writeFile(path, req.file.buffer, 'binary');

            if(wrapper.checkStorageValidity(await filesRepository.Aggregate([
                    { $match: { parent_folder: bson.ObjectId(folder_id),  case_jud: bson.ObjectId(case_jud)} },
                    { $group: { _id: null, amount: { $sum: "$size" } } }
                ]), office.extra.store, size)) {
                await filesRepository.Create({name: name, extension: extension, size: size, case_jud: case_jud, parent_folder: folder_id, path: path, office: req.user.office, originalname: originalname, note: notes});
                return res.json(await jsonResponse.Json({}, "El archivo ha sido guardado con exito."))
            }
            res.json(await jsonResponse.JsonError({}, "Ha alcanzado el limite de almacenamiento."));
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async EraseFile(req, res) {
        try {
            const id = req.body._id,
                file = await filesRepository.Find({_id: id}, 'office'),
                path = `${__dirname}/../../../files/${file.office.name}/${file.case_jud.toString()}/${file.parent_folder.toString()}/${file.originalname}`;
            await Promise.all([
                fs.removeSync(path),
                filesRepository.Erase(file.id)
            ]);
            res.json(await jsonResponse.Json({}, "El archivo ha sido eliminado con exito"));
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async DownloadFile(req, res) {
        try {
            let id = req.params.id,
            file = await filesRepository.Find({_id: id}, 'office'),
            path = `${file.office.name}/${file.case_jud.toString()}/${file.parent_folder.toString()}/${file.originalname}`;

            res.json(await jsonResponse.Json({path: path, name: `${file.name}.${file.extension}`}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }


}

module.exports = FolderController;
