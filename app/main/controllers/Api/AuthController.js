const jwt = require('jsonwebtoken'),
    BaseController = require('../../../core/base/BaseController'),
    JsonResponse = require('../../../main/utils/JsonResponse'),
    jsonResponse = new JsonResponse(),
    UserRepository = require('../../repository/UserRepository'),
    OfficeRepository = require('../../repository/OfficeRepository'),
    RepositoryErrorHelper = require('../../helpers/errors/RepositoryErrorHelper'),
    RepositoryHelper = new RepositoryErrorHelper(),
    fs = require('fs-extra');

class AuthController extends BaseController {
    constructor(app) {
        super(app);
    }

    Router(path){
        this.app.post(`${path}/login`, this.Login);
        this.app.post(`${path}/logout`, this.Logout);
        this.app.post(`${path}/register`, this.Register);
        this.app.post(`${path}/change/password`, this.ChangePassword);
    }

    async Login(req, res) {
        try {
            const userRepository = new UserRepository();
            const user = await userRepository.Find({ email: req.body.email, status: true });
            if (!user) return res.json(await jsonResponse.JsonError({}, "Usuario Invalido."));
            const { valid } = await user.validPassword(req.body.password);
            if (valid) {
                const data = { id: user._id, email: user.email, office: user.office._id.toString() };
                const sign = jwt.sign(data, global.config.sessionSecret, { expiresIn: '1d' });
                let perm = 'isUser';
                if(user.permissions.isAdmin === true) {
                    perm = 'isAdmin';
                } else if(user.permissions.isSuper === true) {
                    perm = 'isSuper';
                }
                return res.json(await jsonResponse.Json({token: sign, user: {email: user.email, perm: perm}}, "Bienvenido"))
            } return res.json(await jsonResponse.JsonError({}, "Usuario Invalido."))
        } catch (error) {
            res.json(await jsonResponse.JsonError({}, "Usuario Invalido."));
        }
    }


    async Logout() {

    }

    async Register(req, res) {
        try {
            const name = req.body.name,
                email = req.body.email,
                address = req.body.address,
                phone = req.body.phone,
                officeRepository = new OfficeRepository(),
                plan = req.body.plan;

            const office = await officeRepository.Create({name: name, email: email, address: address, phone: phone, plan: plan});

            fs.mkdirsSync(`${__dirname}/../../../files/${name}`);

            const userName = req.body.username,
                userEmail = req.body.userEmail,
                password = req.body.password,
                passwordConfirm = req.body.passwordConfirm,
                permissions = {
                    isSuper: false,
                    isAdmin: true,
                    isUser: false
                },
                userRepository = new UserRepository();

            if(password !== passwordConfirm) {
                const json = jsonResponse.JsonError({}, "Correo o password incorrectos.");
                res.json(json)
            }
            const user = await userRepository.Create({username: userName, email: userEmail, password: password, office: office.id, permissions: permissions});

            res.json(await jsonResponse.Json({}, "Su cuenta ha sido creada con exito."))
        } catch(err) {
            let errorHelper = null;
            if(err.code) {
                errorHelper = await RepositoryHelper.Verify(err);
            }
            let json = await jsonResponse.JsonError({}, "Hubo un error creando los datos. intente luego.");

            if(errorHelper !== undefined && errorHelper.error) {
                json = await jsonResponse.JsonError({}, errorHelper.message);
            }
            res.json(json)
        }
    }

    async ChangePassword() {

    }

}

module.exports = AuthController;
