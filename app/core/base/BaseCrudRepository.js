const Pool = require('pg').Pool;
const config = require('../../../config/db/db.config.json');

class BaseCrudRepository {

    constructor(model) {
        this._model = model;
        this.pool = new Pool(config);
    }

    async Find(query, select='*', limit="NULL", skip=0, order_by="ASC") {
        try {
            this.setValuesForSelect(query);
            let data = query.values ? await this.pool.query(`SELECT ${select} FROM ${this._model} ${query.index} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`, query.values) : await this.pool.query(`SELECT ${select} FROM ${this._model} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`);
            return query.values ? data.rows[0] : data.rows;
        } catch (error) {
            reject(error);
        }
    }

    async Create(query) {
        try {
            this.setValuesForCreate(query);
            return await this.pool.query(`INSERT INTO ${this._model} (${query.names}) VALUES (${query.index})`, query.values);
        } catch (error) {
            reject(error);
        }
    }

    async Update(query) {
        try {
            this.setValuesForUpdateOrRemove(query);
            return await this.pool.query(`UPDATE ${this._model} SET ${query.index} WHERE ${query.condition}`, query.values);
        } catch (error) {
            reject(error);
        }
    }

    async Remove(query) {
        try {
            this.setValuesForUpdateOrRemove(query);
            return await this.pool.query(`'DELETE FROM ${this._model} WHERE ${query.condition}`, query.values);
        } catch (error) {
            reject(error);
        }
    }

    setValuesForSelect(query) {
        let count = 1;
        query.index = "";
        if(query.values) {
            query.index = `WHERE `
            for (const val of query.names) {
                if(count === query.names.length) {
                    query.index += `${val} = $${count}`;
                } else {
                    query.index += `${val} = $${count}, `;
                }
                count++;
            }
        }
    }

    setValuesForCreate(query) {
        let count = 1;
        query.index = "";
        if(query.values) {
            for (const val of query.values) {
                if(count === query.values.length) {
                    query.index += `$${count}`;
                } else {
                    query.index += `$${count}, `;
                }
                count++;
            }
        }
    }

    setValuesForUpdateOrRemove(query) {
        let count = 1;
        if(query.names) {
            query.index = "";
            for (const val of query.names) {
                if(count === query.names.length) {
                    query.index += `${val} = $${count}`;
                } else {
                    query.index += `${val} = $${count}, `;
                }
                count++;
            }
        }
        if(query.condition) {
            query.condition += ` = $${query.values}`;
        }
    }


}

module.exports = BaseCrudRepository;
