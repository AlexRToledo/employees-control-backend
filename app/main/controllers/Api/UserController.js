const Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    Validation = require('../../middleware/Validation'),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    UserRepository = require('../../repository/UserRepository'),
    OfficeRepository = require('../../repository/OfficeRepository'),
    PlanWrapper = require('../../helpers/wrapper/PlanWrapper');

const Repository = new UserRepository(),
    officeRepository = new OfficeRepository();

class UserController extends BaseController {
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

            let data = [],
                total = 0;
            delete req.query.page;
            const user = req.user;
            if(user.permissions.isSuper) {
                [data, total] = await Promise.all([
                    Repository.FindAll({...req.query}, limit, (limit * page) - limit),
                    Repository.Count({...req.query})
                ]);
            } else {
                [data, total] = await Promise.all([
                    Repository.FindAll({office: user.office, ...req.query}, limit, (limit * page) - limit),
                    Repository.Count({office: user.office, ...req.query})
                ]);
            }
            res.json(await jsonResponse.Json({users: data, total, page, limit}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Create(req, res) {
        try {
            const fullname = req.body.name,
                email = req.body.email,
                status = req.body.status,
                password = req.body.password;
            let permissions = {};

            switch (req.body.perm) {
                case "isAdmin":
                    permissions = { isSuper: false, isAdmin: true, isUser: false };
                    break;
                default:
                    permissions = { isSuper: false, isAdmin: false, isUser: true };
                    break;
            }


            const office = await officeRepository.Find({_id: req.user.office});
            const wrapper = new PlanWrapper(office.plan);

            if(permissions.isAdmin === true) {
                if(wrapper.checkUsersAdminValidity(await Repository.Count({office: req.user.office, 'permissions.isAdmin': true}), office.extra.admins)) {
                    const user = await Repository.Create({username: fullname, email: email, password: password, office: req.user.office, permissions: permissions, status: JSON.parse(status)});

                    res.json(await jsonResponse.Json({}, "El usuario ha sido creado con exito."))
                } else {
                    res.json(await jsonResponse.JsonError({}, "Ha alcanzado el limite de usuarios."))
                }
            } else if (permissions.isUser === true) {
                if(wrapper.checkUsersValidity(await Repository.Count({office: req.user.office, 'permissions.isUser': true}), office.extra.users)) {
                    const user = await Repository.Create({username: fullname, email: email, password: password, office: req.user.office, permissions: permissions, status: JSON.parse(status)});

                    res.json(await jsonResponse.Json({}, "El usuario ha sido creado con exito."))
                }  else {
                    res.json(await jsonResponse.JsonError({}, "Ha alcanzado el limite de usuarios."))
                }
            } else {
                const user = await Repository.Create({username: fullname, email: email, password: password, office: req.user.office, permissions: permissions, status: JSON.parse(status)});

                res.json(await jsonResponse.Json({}, "El usuario ha sido creado con exito."))
            }

        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Edit(req, res) {
        try {
            const fullname = req.body.name,
                email = req.body.email,
                status = req.body.status,
                id = req.params.id;
            let permissions = {};

            switch (req.body.perm) {
                case "isAdmin":
                    permissions = { isSuper: false, isAdmin: true, isUser: false };
                    break;
                default:
                    permissions = { isSuper: false, isAdmin: false, isUser: true };
                    break;
            }

            const user = await Repository.Update({_id: id}, {username: fullname, email: email, office: req.user.office, permissions: permissions, status: JSON.parse(status)});

            res.json(await jsonResponse.Json({}, "El usuario ha sido modificado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body._id;
            await Repository.Erase(id);
            res.json(await jsonResponse.Json({}, "El usuario ha sido eliminado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Get(req, res) {
        try {
            const id = req.params.id;
            const data = await Repository.Find({_id: id});
            res.json(await jsonResponse.Json({user: data}, ""))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }
}

module.exports = UserController;
