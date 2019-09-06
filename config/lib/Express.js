const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    cors = require('cors'),
    helmet = require('helmet'),
    logger = require('morgan');

class Express {
    constructor(app) {
        this.app = app;
        this.initialize();
    }

    initialize() {
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));

        this.app.use(express.static(path.join(__dirname, './../public')));

        this.app.use(cors());
        
        this.app.use(helmet());

        this.app.enable('trust proxy');

        this.app.use((req, res, next) => {
            res.jsonify = function(error, message, data, status_code = 200){
                this.status(status_code).json(
                    {
                        "error": error,
                        "message": message,
                        "data": data
                    });
            };
            next();
        });

    }
}

module.exports = Express;
