const generator = require('./lib/generator');
const storage = require('./lib/storage');


module.exports = {
    token: generator.token,
    store: storage.init,
    STORAGE_MONGO_DB: 'database',
    STORAGE_FILE: 'file'
};