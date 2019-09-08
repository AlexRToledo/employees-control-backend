const bcrypt = require('bcrypt'), 
    BaseCrudRepository = require('../../core/base/BaseCrudRepository');

class UserRepository extends BaseCrudRepository {
    constructor(){
        super('users');
    }

    validPassword (password, password_digest) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, password_digest, (err, valid) => {
                resolve({ valid, data: err });
            });
        });
    };

}

module.exports = UserRepository;