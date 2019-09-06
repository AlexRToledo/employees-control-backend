const { check, param, oneOf, validationResult } = require('express-validator/check');

class Validators {
    static Login() {
        return [
            check('email').exists().withMessage(' Must provide at a email field.'),
            check('password').exists().withMessage(' Must provide at a password field.')
        ];
    }

    static Register() {
        return [
            check('username').exists().withMessage(' Must provide an username id field.'),
            check('email').exists().withMessage(' Must provide an email field.'),
            check('password').exists().withMessage(' Must provide a password field.'),
            check('passwordConfirm').exists().withMessage(' Must provide a passwordConfirm field.')
        ];
    }

    static Validate(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(422).json({ error: true, msg: errors.array() });
        else next();
    }
}

module.exports = Validators;
