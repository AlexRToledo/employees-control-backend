const express = require('express'),
    Express = require('./config/lib/Express'),
    Router = require('./config/routes/Router'),
    app = express();

class App {
    constructor() {
        new Express(app);
        new Router(app);    

        app.use(function (req, res, next) {
            res.render('error/404');
        });

        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                console.log(err.message);
                res.render('error/500', {
                    message: err.message,
                    error: err,
                    title: 'Page 500'
                });
            });
        }

        return app;
    }
}

module.exports = App;





