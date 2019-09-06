class Errors{

    constructor(app){
        this.app = app;
        this.initialize();
    }

    initialize(){
        this.app.use((req, res, next) => {
            const err = Error('Not Found');
            if (err) {
                err.status = 404;
                return res.status(err.status || 404).json({
                    success: false,
                    message: 'Not route found',
                    result: null
                });
            }
            next();
        });


        this.app.use((err, req, res, next) => {
            if (err) {
                return res.status(err.status || 500).render({
                    success: false,
                    message: 'Internal Server Error',
                    result: null
                });
            }
            next();
        });
    }
}

module.exports = Errors;
