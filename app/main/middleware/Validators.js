const { check, param, oneOf, validationResult } = require('express-validator');

class Validators {
    //Auth
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

    // Generic        
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
    
    // Users
    static EditUsers() {
        return [
            check('id').exists().withMessage(' Must provide an id field.').isInt(),
            check('username').optional().isString(),
            check('email').optional().isEmail()
        ]
    }

    //Controls
    static CreateControls() {
        return [            
            check('users_id').exists().withMessage(' Must provide an users_id field.').isInt(),
            check('day').exists().withMessage(' Must provide a day field.').isString(),
            check('arrivals').exists().withMessage(' Must provide an arrivals field.'),
            check('departures').exists().withMessage(' Must provide a departures field.')
        ]
    }
    static EditControls() {
        return [
            check('id').exists().withMessage(' Must provide an id field.').isInt(),
            check('arrivals').exists().withMessage(' Must provide an arrivals field.'),
            check('departures').exists().withMessage(' Must provide a departures field.')
        ]
    }

    static Validate(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(422).json({ error: true, msg: errors.array() });
        else next();
    }
}

module.exports = Validators;
