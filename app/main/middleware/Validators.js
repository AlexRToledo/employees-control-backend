const { check, param, oneOf, validationResult } = require('express-validator');

class Validators {
    static Login() {
        return [
            check('email').exists().withMessage(' Must provide at a email field.').isEmail(),
            check('password').exists().withMessage(' Must provide at a password field.').isString()
        ];
    }

    static Register() {
        return [
            check('username').exists().withMessage(' Must provide an username field.').isString(),
            check('email').exists().withMessage(' Must provide an email field.').isEmail(),
            check('password').exists().withMessage(' Must provide a password field.').isString(),
            check('passwordConfirm').exists().withMessage(' Must provide a passwordConfirm field.').isString()
        ];
    }

    static List() {
        return [
            check('limit').exists().withMessage(' Must provide an limit field.').isInt(),
            check('skip').exists().withMessage(' Must provide an skip field.').isInt()
        ]
    }
    
    static Get() {
        return [
            check('id').exists().withMessage(' Must provide an id field for get.').isInt()
        ]
    }
    
    static Remove() {
        return [
            check('id').exists().withMessage(' Must provide an id field for remove.').isInt()
        ]
    }
    
    static EditUsers() {
        return [
            check('id').exists().withMessage(' Must provide an id field.').isInt(),
            check('username').optional().isString(),
            check('email').optional().isEmail()
        ]
    }

    static Validate(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(422).json({ error: true, msg: errors.array() });
        else next();
    }
}

module.exports = Validators;
