const Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    NotesRepository = require('../../repository/NotesRepository'),
    moment = require('moment');

const Repository = new NotesRepository();

class NotesController extends BaseController {
    constructor(app) {
        super(app);
    }

    Router(path){
        this.app.get(`${path}/count`, Session.isAuth, this.CountAll);
        this.app.get(`${path}`, Session.isAuth, this.GetAll);
        this.app.post(`${path}/create`, Session.isAuth, this.Create);
        this.app.put(`${path}/edit/:id`, Session.isAuth, this.Edit);
        this.app.delete(`${path}/remove`, Session.isAuth, this.Remove);
    }

    async CountAll(req, res) {
        try {
            let date = req.query.date.split(' '),
                year = date[3],
                month = moment().month(date[1]).format("M"),
                startDate = moment([year, month - 1]).format();

            const query = {
                date: {
                    '$gte': startDate,
                    '$lt': moment(startDate).endOf('month').format()
                },
                office: req.user.office
            };

            const data = await Repository.FindAll(query);
            res.json(await jsonResponse.Json({notes: data}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async GetAll(req, res) {
        try {
            const query = {
                date: {
                    '$gte': new Date(req.query.date).toISOString(),
                    '$lte': new Date(req.query.date).toISOString(),
                },
                office: req.user.office
            };

            const data = await Repository.FindAll(query);
            res.json(await jsonResponse.Json({notes: data}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Create(req, res) {
        try {;
            let day = moment(req.body.timer);
            let record = {
                text: req.body.text,
                date: new Date(req.body.date).toISOString(),
                timer: day.subtract({ hours: 5}).toISOString(),
                color: req.body.color,
                office: req.user.office,
                user: req.user.id
            };

            await Repository.Create(record);

            res.json(await jsonResponse.Json({}, "La nota ha sido creada con exito."))

        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Edit(req, res) {
        try {
            const id = req.params.id,
            record = {
                text: req.body.text,
                color: req.body.color,
            };

            if(req.body.timer && req.body.timer !== null) {
                let day = moment(req.body.timer);
                record.timer =  day.subtract({ hours: 5}).toISOString();
            }

            await Repository.Update( id, record);
            res.json(await jsonResponse.Json({}, "La nota ha sido modificada con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async Remove(req, res) {
        try {
            const id = req.body._id;
            await Repository.Erase(id);
            res.json(await jsonResponse.Json({}, "La nota ha sido eliminada con exito."))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

}

module.exports = NotesController;
