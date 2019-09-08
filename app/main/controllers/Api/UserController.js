const bcrypt = require('bcrypt'),
    Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    SesionValidators = require('../../middleware/Validators'),    
    UserRepository = require('../../repository/UserRepository');

class UserController extends BaseController {
    constructor(app) {
        super(app);
        this.repository = new UserRepository();

        this.List = this.List.bind(this);
        this.Create = this.Create.bind(this);
        this.Get = this.Get.bind(this);
        this.Remove = this.Remove.bind(this);
        this.Edit = this.Edit.bind(this);
    }

    Router(path){
        this.app.get(`${path}`, Session.isAuth, Session.isAdmin, this.List);
        this.app.get(`${path}/:id`, Session.isAuth, Session.isAdmin, SesionValidators.Get(), SesionValidators.Validate, this.Get);
        this.app.post(`${path}/create`, Session.isAuth, Session.isAdmin, SesionValidators.Register(), SesionValidators.Validate, this.Create);
        this.app.put(`${path}/edit/:id`, Session.isAuth, Session.isAdmin, SesionValidators.EditUsers(), SesionValidators.Validate, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, Session.isAdmin, SesionValidators.Remove(), SesionValidators.Validate, this.Remove);
    }

    async List(req, res) {
        try {
            const limit = Number(req.query.limit) > 0 ? req.query.limit : 9,
                page = req.query.skip || 1;

            const [users, total] = await Promise.all([
                this.repository.Find({names: [`!id`], values: [parseInt(req.user.id)]}, '*', limit, page),
                this.repository.Count({names: [`!id`], values: [parseInt(req.user.id)]}),
            ]);
            
            res.json(await jsonResponse.Json({users: users, total, page, limit}))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }

    async Create(req, res) {
        try {
            let username = req.body.username || "",
                email = req.body.email || "",
                password = req.body.password || "",
                passwordConfirm = req.body.passwordConfirm || "",
                isAdmin = false;
            if(req.body.isAdmin) {
                isAdmin = true
            }
                
            if(password !== passwordConfirm) {
                return res.json(await jsonResponse.JsonError({}, "Incorrect email or password, please verify."));
            } else {
                password = bcrypt.hashSync(password, bcrypt.genSaltSync(2))
            }    

            const user = await this.repository.Create({names: 'username, email, password_digest, isadmin', values: [username, email, password, isAdmin]});

            res.json(await jsonResponse.Json({}, "El usuario ha sido creado con exito."))

        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }

    async Edit(req, res) {
        try {
            const username = req.body.username,
                email = req.body.email,                
                id = req.params.id;
            let isAdmin = false;

            if(req.body.isAdmin) {
                isAdmin = true
            }

            const user = await this.repository.Update({names: ['username', 'email', 'isadmin'], values: [username, email, isAdmin, parseInt(id)], condition: {fields: ['id']}});

            res.json(await jsonResponse.Json({}, "El usuario ha sido modificado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body.id;

            const user = await this.repository.Remove({names: [`id`], values: [parseInt(id)]});
            
            res.json(await jsonResponse.Json({}, "El usuario ha sido eliminado con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }

    async Get(req, res) {
        try {
            const id = req.params.id;
            const user = await this.repository.Find({names: [`id`], values: [parseInt(id)]});
            res.json(await jsonResponse.Json({user: user}, ""))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }
}

module.exports = UserController;
