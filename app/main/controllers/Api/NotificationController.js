const Session = require('../../middleware/Session'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    RepositotyErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    HelperError = new RepositotyErrorHelper(),
    NotificationRepository = require('../../repository/NotificationRepository'),
    moment = require('moment');

const Repository = new NotificationRepository();

class NotificationController extends BaseController {
    constructor(app) {
        super(app);
    }

    Router(path){
        this.app.get(`${path}/count`, Session.isAuth, this.CountAll);
        this.app.get(`${path}`, Session.isAuth, this.GetAll);
    }

    async CountAll(req, res) {
        try {
            const user = req.user;
            const count = await Repository.Count({office: user.office.toString(), closed: false});
            res.json(await jsonResponse.Json({total: count}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

    async GetAll(req, res) {
        try {
            let date = req.query.date.split(' '),
                year = date[3],
                month = moment().month(date[1]).format("M"),
                startDate = moment([year, month - 1]).format();

            const query = {
                createdAt: {
                    '$gte': startDate,
                    '$lt': moment(startDate).endOf('month').format()
                }
            };

            const data = await Repository.FindAll(query);
            res.json(await jsonResponse.Json({notifications: data}))
        } catch (err) {
            res.json(await jsonResponse.JsonCustom(HelperError.Verify(err)));
        }
    }

}

module.exports = NotificationController;
