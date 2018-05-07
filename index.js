const generator = require('./lib/generator');
const storage = require('./lib/storage');

module.exports = {
    token:generator.token,
    store:storage.init,
    STORAGE_Memory:'memory',
    STORAGE_Database:'database',
    STORAGE_File:'file'
};