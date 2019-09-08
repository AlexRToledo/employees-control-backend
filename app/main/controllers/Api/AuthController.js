const jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    UserRepository = require('../../repository/UserRepository'),
    SesionValidators = require('../../middleware/Validators');

class AuthController extends BaseController {
    constructor(app) {
        super(app);
        this.repository = new UserRepository();

        this.Login = this.Login.bind(this);
        this.Register = this.Register.bind(this);
    }

    Router(path){
        this.app.post(`${path}/login`, SesionValidators.Login(), SesionValidators.Validate, this.Login);
        this.app.post(`${path}/register`, SesionValidators.Register(), SesionValidators.Validate, this.Register);
    }

    async Login(req, res) {
        try {        
            const user = await this.repository.Find({names: ['email'], values: [req.body.email]});

            if (!user) return res.json(await jsonResponse.JsonError({}, "Usuario Invalido."));

            const { valid } = await this.repository.validPassword(req.body.password, user.password_digest);
            let perm = 'isuser';

            if (valid) {
                const data = { id: user.id, email: user.email };
                const sign = jwt.sign(data, global.config.sessionSecret, { expiresIn: '1d' });
            
                if(user.isadmin === true) {
                    perm = 'isadmin';
                }

                return res.json(await jsonResponse.Json({token: sign, user: {email: user.email, perm: perm}}, "Welcome"))
            } 
            
            return res.json(await jsonResponse.JsonError({}, "Invalid user."))

        } catch (error) {
            res.json(await jsonResponse.JsonError({}, "There was an error."));
        }
    }

    async Register(req, res) {
        try {
            let username = req.body.username || "",
                email = req.body.email || "",
                password = req.body.password || "",
                passwordConfirm = req.body.passwordConfirm || "",
                isAdmin = false;

            if(password !== passwordConfirm) {
                return res.json(await jsonResponse.JsonError({}, "Incorrect email or password, please verify."));
            } else {
                password = bcrypt.hashSync(password, bcrypt.genSaltSync(2))
            }

            const user = await this.repository.Create({names: 'username, email, password_digest, isadmin', values: [username, email, password, isAdmin]});

            res.json(await jsonResponse.Json({}, "Your account has been created successfully."))
        } catch(error) {        
            res.json(await jsonResponse.JsonError({}, "There was an error."))
        }
    }    
}

module.exports = AuthController;
