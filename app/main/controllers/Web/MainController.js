const BaseController = require('../../../core/base/BaseController');
// const _18n = require('i18n');

class MainController extends BaseController {

    constructor(app) {
        super(app);
    }

    Router(path) {
        super.Router(path);       
    }

    async Index(req, res, next) {
       
    }

    async Register(req, res, next) {
        
    }

    async Contact(req, res) {
        
    }

    async Lang(req, res, next) {
       

    }

    async Alarms(req, res, next) {
        
    }

    async Surveillance(req, res) {
    }

}

module.exports = MainController;