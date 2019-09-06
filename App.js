const express = require('express'),
    Express = require('./config/lib/Express'),
    Errors = require('./config/lib/Errors'),
    Router = require('./config/routes/Router'),
    app = express();

class App {
    constructor() {
        new Express(app);    
        new Router(app); 
        new Errors(app);   

        app.use(function (req, res, next) {
            res.render('error/404');
        });        

        return app;
    }
}

module.exports = App;





