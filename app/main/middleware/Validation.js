class Validation {

    static async ValidateSearch(req, res, next) {
        try {
            for(let param in req.query) {
                if(req.query[param] === "") {
                    delete req.query[param];
                }
            }
            next();
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }

}

module.exports = Validation;