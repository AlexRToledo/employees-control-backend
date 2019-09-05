const _ParseCode = Symbol('_ParseCode');
const _ParseDuplicate = Symbol('_ParseDuplicate');

class MongoErrorHelper {
    constructor() {}

    Verify(data) {
        if(data.code) {
            return this[_ParseCode](data);
        }
    }

    [_ParseCode](data) {
        switch (data.code) {
            case 11000:
                const {field, value} = this[_ParseDuplicate](data.message);
                return {error: true, message: 'Existen campos duplicados, pruebe con otros datos.', field, value};
            default:
                return {error: true, message: 'Ha ocurrido un error.'}
        }
    }

    [_ParseDuplicate](data) {
        return {field: data.split("index:").pop().split(" ")[1].split("_")[0], value: data.split("key:").pop().split(" ")[3].split('"')[1]}
    }
}

module.exports = MongoErrorHelper;