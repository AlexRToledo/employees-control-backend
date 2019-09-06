const Pool = require('pg').Pool,
    db_config = require('../db.config.json');

class Seeds {
    constructor() {
        this.pool = new Pool(db_config)
        this.Initialize();
    }

    async Initialize() {
        try {
            await this.createUsers();
            console.log('Table users created');            
            console.log('End seeds succefully');
            process.exit();    
        } catch (error) {
            console.log(error);
        }
    }

    async createUsers(name="users") {
        //Password for admin -> root
        await this.pool.query(`
            INSERT INTO ${name} (username, email, password_digest, isAdmin) VALUES ($1, $2, $3, $4);
        `, ['admin', 'admin@control.com', '$2b$04$nQrLccdPbcQNN3pP0D95Z.250VFZTg.vblHLLrqBB6nmQct6vDeiW', true]);
    }
}

new Seeds();