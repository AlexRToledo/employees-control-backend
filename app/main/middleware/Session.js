const jwt = require('jsonwebtoken');
const UserRepository = require('../repository/UserRepository');
const repository = new UserRepository();
class Session {

    static async isAuth(req, res, next) {
        try {
            const [,token] = req.headers.authorization.split(' ');
            const decoded = jwt.verify(token, global.config.sessionSecret);
            req.user = await repository.Find({_id: decoded.id, status: true});
            if(!req.user) {
                return res.status(403).json({ error: true, msg: 'Invalid user.' });
            }
            next();
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }

}

module.exports = Session;