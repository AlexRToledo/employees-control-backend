const Pool = require('pg').Pool,
    db_config = require('../db.config.json');

class Migration {
    constructor() {
        this.pool = new Pool(db_config)
        this.Initialize();
        return;
    }

    async Initialize() {
        try {
            await this.createUsers();
            console.log('Table users created');
            await this.createControlDay();
            console.log('Table users created');    
            console.log('End migration succefully');  
            process.exit()          
        } catch (error) {
            console.log(error);
        }
    }

    async createUsers(name="users") {
        await this.DropTable(name, 'CASCADE');
        await this.pool.query(`
            CREATE TABLE ${name} (
                id SERIAL PRIMARY KEY NOT NULL,
                username VARCHAR(30) NOT NULL,
                email VARCHAR(30) UNIQUE NOT NULL,
                password_digest TEXT,
                isAdmin BOOLEAN NOT NULL DEFAULT FALSE
            );
        `);
    }

    async createControlDay(name="controls") {
        await this.DropTable(name);
        await this.pool.query(`
            CREATE TABLE ${name} (
                id SERIAL NOT NULL PRIMARY KEY,
                FOREIGN KEY (id) REFERENCES users (id),
                arrivals TEXT [],
                departures TEXT [],
                day DATE NOT NULL DEFAULT CURRENT_DATE            
            );
        `);
    }

    async DropTable(name, type="") {
        try {
            await this.pool.query(`DROP TABLE IF EXISTS ${name} ${type};`);
        } catch (error) {
            console.log(error)
        }
    }
}

new Migration();