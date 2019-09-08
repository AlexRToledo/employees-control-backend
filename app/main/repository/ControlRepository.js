const BaseRepository = require('../../core/base/BaseCrudRepository')
class ControlRepository extends BaseRepository {
    constructor() {
        super('controls');
    }
}

module.exports = ControlRepository;