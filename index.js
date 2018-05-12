const generator = require('./lib/generator');
const storage = require('./lib/storage');
const middleware = require('./lib/middleware');


module.exports = {
    token:generator.token,
    store:storage.init,
    middleware:middleware.init,
    STORAGE_MONGO_DB:'database',
    STORAGE_FILE:'file'
};