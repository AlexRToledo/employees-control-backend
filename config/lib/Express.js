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

        this.app.use(cors());
        
        this.app.use(helmet());
    }
}

module.exports = Express;
