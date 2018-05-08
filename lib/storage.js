const fs = require('fs');
const path = require('path');

/**
 * Store constructor returns a store object to save and retrive data.
 * 
 * @param {Object} option Options to configure store
 * @param {String} option.engine Storage engine to store data  
 */
function _init(options = null) {
    var dataStorage;
    var fileStorage;
    if (!options) {
        options = {};
    }
    if (options.engine == 'file') {
        if (!options.path || !options.path.trim()) {
            options.path = path.join(__dirname, '/magicTokens');
        }
        fs.mkdirSync(options.path);
    } else {
        options.engine = 'memory';
        dataStorage = {};
    }
    return {
        save: (token, value) => {
            if (options.engine == 'file') {
                var filePath = path.join(options.path, token);
                var data = value;
                if (!fs.statSync(filePath)) {
                    fs.writeFileSync(filePath, JSON.stringify(data));
                } else {
                    data = JSON.parse(fs.readFileSync(filePath));
                    data = Object.assign(data, value);
                    fs.writeFileSync(filePath, JSON.stringify(data));
                }
                return data;
            } else {
                if (!dataStorage[token]) {
                    dataStorage[token] = {};
                }
                dataStorage[token] = Object.assign(dataStorage[token], value);
                return dataStorage[token];
            }
        },
        get: (token, key = null) => {
            if (options.engine == 'file') {
                var filePath = path.join(options.path, token);
                var data;
                if (fs.existsSync(filePath)) {
                    data = JSON.parse(fs.readFileSync(filePath));
                }
                return data;
            } else {
                if (!dataStorage[token]) {
                    dataStorage[token] = {};
                }
                return key ? dataStorage[token][key] : dataStorage[token];
            }
        }
    }
}

module.exports.init = _init;