const Pool = require('pg').Pool;
const config = require('../../../config/db/db.config.json');

class BaseCrudRepository {

    constructor(model) {
        this._model = model;
        this.pool = new Pool(config);
    }

    async FindAll(query, select='*', limit="NULL", skip=0, order_by="ASC") {
        try {
            this.setValuesForSelect(query);
            let data = query.values ? await this.pool.query(`SELECT ${select} FROM ${this._model} ${query.join} ${query.index} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`, query.values) : await this.pool.query(`SELECT ${select} FROM ${this._model} ${query.join} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`);
            return data.rows;
        } catch (error) {
            reject(error);
        }
    }

    async Find(query, select='*', limit="NULL", skip=0, order_by="ASC") {
        try {
            this.setValuesForSelect(query);
            let data = query.values ? await this.pool.query(`SELECT ${select} FROM ${this._model} ${query.join} ${query.index} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`, query.values) : await this.pool.query(`SELECT ${select} FROM ${this._model} ${query.join} ORDER BY id ${order_by} LIMIT ${limit} OFFSET ${skip}`);
            return data.rows.length === 1 ? data.rows[0] : data.rows;
        } catch (error) {
            reject(error);
        }
    }

    async Count(query, select='*', limit="NULL", skip=0, order_by="ASC") {
        try {
            this.setValuesForSelect(query);
            let data = query.values ? await this.pool.query(`SELECT COUNT(${select}) FROM ${this._model} ${query.index}`, query.values) : await this.pool.query(`SELECT COUNT(${select}) FROM ${this._model} ${query.index} GROUP BY id`);
            return data.rows.length === 1 ? parseInt(data.rows[0].count) : parseInt(data.rows.count);
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
            this.setValuesForUpdate(query);
            return await this.pool.query(`UPDATE ${this._model} SET ${query.index}`, query.values);
        } catch (error) {
            reject(error);
        }
    }

    async Remove(query, cascade=false) {
        try {
            this.setValuesForSelect(query);
            return await this.pool.query(`DELETE FROM ${this._model} ${query.index}`, query.values);
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
                    this.conditionalParser(query, val, count);
                } else {
                    if(count === query.names.length - 1) {
                        this.conditionalParser(query, val, count);
                        query.index += 'AND ';
                    } else {
                        this.conditionalParser(query, val, count);
                        query.index += ', ';
                    }
                }
                count++;
            }
        }       
    }

    setValuesForUpdate(query) {
        let count = 1;
        query.index = "";
        if(query.values) {            
            for (const val of query.names) {
                if(count === query.names.length) {
                    this.conditionalParser(query, val, count);
                } else {
                    this.conditionalParser(query, val, count);
                    query.index += ', ';
                }
                count++;
            }
        }

        if(query.condition) {        
            query.index += ` WHERE ` 
            for (const val of query.condition.fields) {
                if(count === (query.condition.fields.length + count - 1)) {
                    this.conditionalParser(query, val, count);
                } else {
                    this.conditionalParser(query, val, count);
                    query.index += ', ';
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

    conditionalParser(query, val, count) {
        if(val.includes('LIKE')) {
            query.index += `${val} $${count} `;
        } else if (val.includes('!')) {
            let [,aux] = val.split('!')
            query.index += `${aux} != $${count} `;
        } else {
            query.index += `${val} = $${count} `;
        }
    }


}

module.exports = BaseCrudRepository;
