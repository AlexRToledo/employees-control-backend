//Api
const AuthController = require('../../app/main/controllers/Api/AuthController');
const CaseController = require('../../app/main/controllers/Api/CaseController');

//Web
const MainController = require('../../app/main/controllers/Web/MainController');

class Router {
    constructor(app) {
        const api = '/api/v1';

        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            next();
        });


        //Api
        new AuthController(app).Router(`${api}/auth`);
        new CaseController(app).Router(`${api}/cases`);

        //Web
        new MainController(app).Router(`/`);
    }
}

module.exports = Router;
