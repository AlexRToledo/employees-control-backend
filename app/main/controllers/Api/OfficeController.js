const Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    OfficeRepository = require('../../repository/OfficeRepository'),
    UserRepository = require('../../repository/UserRepository'),
    CaseRepository = require('../../repository/CaseRepository'),
    FilesCaseRepository = require('../../repository/FilesCaseRepository'),
    Plans = require('../../utils/Plans');

const Repository = new OfficeRepository();
const URepository = new UserRepository();
const CRepository = new CaseRepository();
const FRepository = new FilesCaseRepository();

class OfficeController extends BaseController {
    constructor(app) {
        super(app);
        this.FRepository = new FilesCaseRepository();
    }

    Router(path){
        this.app.get(`${path}`, Session.isAuth, this.List);
        this.app.get(`${path}/info`, Session.isAuth, this.Get);
        this.app.put(`${path}/edit/:id`, Session.isAuth, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, this.Remove);
    }

    async List(req, res) {
        try {
            const limit = Number(req.query.limit) > 0 ? req.query.limit : 9,
                page = req.query.page || 1;

            const [data, total] = await Promise.all([
                Repository.FindAll({}, limit, (limit * page) - limit),
                Repository.Count({})
            ]);
            res.json(await jsonResponse.Json({users: data, total, page, limit}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Get(req, res) {
        try {
            const id = req.user.office;
            const [data, total_cases, total_users, total_admins, total_size] = await Promise.all([
                Repository.Find({_id: id}),
                CRepository.Count({office: id}),
                URepository.Count({office: id, 'permissions.isUser': true}),
                URepository.Count({office: id, 'permissions.isAdmin': true}),
                FRepository.Aggregate([
                    { $match: { office: id} },
                    { $group: { _id: null, amount: { $sum: "$size" } } }
                ])
            ]);
            res.json(await jsonResponse.Json({office: data, total_cases: total_cases, total_users: total_users, total_admins: total_admins, total_size: total_size ,plan: Plans[data.plan]}, ""))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Edit(req, res) {
        try {
            const id = req.params.id;
            const config = {};

            if(req.body.plan) {
                config.plan = req.body.plan
            }

            if(req.body.users) {
                config.users = req.body.users
            }

            if(req.body.cases) {
                config.cases = req.body.cases
            }

            if(req.body.admins) {
                config.admins = req.body.admins
            }

            if(req.body.status) {
                config.status = JSON.parse(req.body.status)
            }

            const office_jud = await Repository.Update({_id: id} , config);

            res.json(await jsonResponse.Json({}, "El despacho ha sido modificado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body._id;
            await Repository.Erase(id);
            res.json(await jsonResponse.Json({}, "El despacho ha sido eliminado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

}

module.exports = OfficeController;
