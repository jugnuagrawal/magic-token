const fs = require('fs');
const path = require('path');
function _init(options = null) {
    var dataStorage;
    var fileStorage;
    if (!options) {
        options = {};
    }
    if (options.engine == 'database') {
        if (!options.url.trim()) {
            options.url = 'mongodb://localhost:27017/magicTokens';
        }
    } else if (options.engine == 'file') {
        if (!options.path.trim()) {
            options.path = path.join(__dirname, '/magicTokens');
        }

    } else {
        options.engine = 'memory';
        dataStorage = {};
    }
    return {
        save: (token, value) => {
            if (options.engine == 'database') {

            } else if (options.engine == 'file') {
                var filePath = path.join(options.path, token);
                var data = value;
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, JSON.stringify(data));
                } else {
                    data = JSON.parse(fs.readFileSync(filePath));
                    data = Object.assign(data, value);
                    fs.writeFileSync(filePath, JSON.stringify(data));
                }
                return data;
            } else {
                if(!dataStorage[token]){
                    dataStorage[token] = {};
                }
                dataStorage[token] = Object.assign(dataStorage[token], value);
                return dataStorage[token];
            }
        },
        get: (token, key = null) => {
            if (options.engine == 'database') {

            } else if (options.engine == 'file') {
                var filePath = path.join(options.path, token);
                var data;
                if (fs.existsSync(filePath)) {
                    data = JSON.parse(fs.readFileSync(filePath));
                }
                return data;
            } else {
                if(!dataStorage[token]){
                    dataStorage[token]={};
                }
                return key ? dataStorage[token][key] : dataStorage[token];
            }
        }
    }
}

module.exports.init = _init;