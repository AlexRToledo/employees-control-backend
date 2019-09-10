const BaseController = require('../../../core/base/BaseController'),
    Session = require('../../middleware/Session'),
    SesionValidators = require('../../middleware/Validators'),    
    ControlRepository = require('../../repository/ControlRepository'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse();
class ControlController extends BaseController {
    constructor(app) {
        super(app);
        this.repository = new ControlRepository();

        this.List = this.List.bind(this);        
        this.Get = this.Get.bind(this);
        this.Create = this.Create.bind(this);
        this.Remove = this.Remove.bind(this);
        this.Edit = this.Edit.bind(this);
    }

    Router(path) {
        this.app.get(`${path}`, Session.isAuth, Session.hasPermissions, this.List);
        this.app.get(`${path}/:id`, Session.isAuth, Session.isAdmin, SesionValidators.Get(), SesionValidators.Validate, this.Get);
        this.app.post(`${path}/create`, Session.isAuth, Session.isAdmin, SesionValidators.CreateControls(), SesionValidators.Validate, this.Create);
        this.app.put(`${path}/edit/:id`, Session.isAuth, Session.hasPermissions, SesionValidators.EditControls(), SesionValidators.Validate, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, Session.isAdmin, SesionValidators.Remove(), SesionValidators.Validate, this.Remove);
    }

    async List(req, res) {
          try {
            const limit = Number(req.query.limit) > 0 ? req.query.limit : 9,
            page = req.query.skip || 0;

            const [controls, total] = await Promise.all([
                this.repository.FindAll({}, '*', limit, page),
                this.repository.Count({}),
            ]);
            
            res.json(await jsonResponse.Json({controls, total, page, limit}))
          } catch (error) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
          }  
    }

    async Get(req, res) {
        try {
            const id = req.params.id;
            const control = await this.repository.Find({names: [`id`], values: [parseInt(id)]});
            res.json(await jsonResponse.Json({control}, ""))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }  
    }

    async Create(req, res) {
        try {
            const users_id = req.body.users_id,
                arrivals = req.body.arrivals,
                day = req.body.day,                
                departures = req.body.departures;
            const control = await this.repository.Create({names: 'users_id, arrivals, departures, day', values: [users_id, arrivals, departures, day]});

            res.json(await jsonResponse.Json({}, "The record was created succesful."))    
        } catch (error) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }  
    }

    async Edit(req, res) {
        try {
            const id = req.params.id,
                arrivals = req.body.arrivals,                            
                departures = req.body.departures;
            const control = await this.repository.Update({names: ['arrivals', 'departures'], values: [arrivals, departures, parseInt(id)], condition: {fields: ['id']}});

            res.json(await jsonResponse.Json({}, "The record was updated succesful."));
        } catch (error) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }  
    }

    async Remove(req, res) {
        try {
            const id = req.body.id;

            const control = await this.repository.Remove({names: [`id`], values: [parseInt(id)]});
            
            res.json(await jsonResponse.Json({}, "The record was removed succesful."))
        } catch (err) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        } 
    }
    
}

module.exports = ControlController;