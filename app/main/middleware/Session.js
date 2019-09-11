const jwt = require('jsonwebtoken');
const UserRepository = require('../repository/UserRepository'),
    repository = new UserRepository();
class Session {
    static async isAuth(req, res, next) {
        try {
            const [,token] = req.headers.authorization.split(' ');
            const decoded = jwt.verify(token, global.config.sessionSecret);
            req.user = await repository.Find({names: ['id'], values: [decoded.id]}, 'id, email, username, isadmin');
            if(!req.user) {
                return res.status(403).json({ error: true, msg: 'Invalid user.' });
            }
            next();
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }

    static async isAdmin(req, res, next) {
        try {
            if(req.user) {
                const isAdmin = req.user.isadmin;
                return isAdmin === true ? next() : res.status(403).json({ error: true, msg: 'Not Access.' });
            }

            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }

    static async isUser(req, res, next) {
        try {
            if(req.user) {
                const isAdmin = req.user.isadmin;
                return isAdmin === false ? next() : res.status(403).json({ error: true, msg: 'Not Access.' });
            }

            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }

    static async hasPermissions(req, res, next) {
        try {
            if(req.user) {                
                return next();
            }

            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        } catch (err) {
            return res.status(403).json({ error: true, msg: 'Invalid user.' });
        }
    }
}

module.exports = Session;