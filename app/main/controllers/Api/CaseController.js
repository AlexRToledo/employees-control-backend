const Session = require('../../middleware/Session'),
    Validation = require('../../middleware/Validation'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    CaseRepository = require('../../repository/CaseRepository'),
    OfficeRepository = require('../../repository/OfficeRepository'),
    PlanWrapper = require('../../helpers/wrapper/PlanWrapper'),
    fs = require('fs-extra');

const Repository = new CaseRepository(),
    officeRepository = new OfficeRepository();

class CaseController extends BaseController {
    constructor(app) {
        super(app);
    }

    Router(path){
        this.app.get(`${path}`, Session.isAuth, Validation.ValidateSearch, this.List);
        this.app.get(`${path}/:id`, Session.isAuth, this.Get);
        this.app.post(`${path}/create`, Session.isAuth, this.Create);
        this.app.put(`${path}/edit/:id`, Session.isAuth, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, this.Remove);
    }

    async List(req, res) {
        try {
            const limit = Number(req.query.limit) > 0 ? req.query.limit : 9,
                page = req.query.page || 1;
            const user = req.user;
            let data = [],
                total = 0;
            delete req.query.page;
            if(user.permissions.isUser) {
                [data, total] = await Promise.all([
                    Repository.FindAll({office: user.office, users_follow: { $elemMatch: {$gte: user.id}}, ...req.query}, limit, (limit * page) - limit),
                    Repository.Count({office: user.office, users_follow: { $elemMatch: {$gte: user.id}}, ...req.query})
                ]);
            } else {
                [data, total] = await Promise.all([
                    Repository.FindAll({office: user.office, ...req.query}, limit, (limit * page) - limit),
                    Repository.Count({office: user.office, ...req.query})
                ]);
            }

            res.json(await jsonResponse.Json({cases: data, total, page, limit}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Create(req, res) {
        try {
            const name = req.body.name,
                case_number = req.body.case_number,
                involved = req.body.involved,
                year = req.body.year,
                court = req.body.court,
                users_follow = req.body.users_follow;

            const office = await officeRepository.Find({_id: req.user.office});
            const wrapper = new PlanWrapper(office.plan);

            if(wrapper.checkCasesValidity(await Repository.Count({office: req.user.office}), office.extra.cases)) {
                const case_jud = await Repository.Create({name: name, case_number: case_number, involved: involved, year: year, court: court, office: req.user.office, users_follow: users_follow  });
                fs.mkdirsSync(`${__dirname}/../../../files/${office.name}/${case_jud.id}`);

                res.json(await jsonResponse.Json({}, "El expediente ha sido creado con exito."))
            }  else {
                res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
            }

        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Edit(req, res) {
        try {
            const name = req.body.name,
                case_number = req.body.case_number,
                involved = req.body.involved,
                year = req.body.year,
                court = req.body.court,
                status = JSON.parse(req.body.status),
                id = req.params.id,
                users_follow = req.body.users_follow;

            const case_jud = await Repository.Update({_id: id} ,{name: name, case_number: case_number, involved: involved, year: year, court: court, status: status, users_follow: users_follow });

            res.json(await jsonResponse.Json({}, "El expediente ha sido modificado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body._id;
            await Repository.Erase(id);
            res.json(await jsonResponse.Json({}, "El expediente ha sido eliminado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Get(req, res) {
        try {
            const id = req.params.id;
            const data = await Repository.Find({_id: id}, 'users_follow');
            res.json(await jsonResponse.Json({case: data}, ""))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

}

module.exports = CaseController;
