const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let cipher;
let decipher;

function _readData(filePath, secret, callback) {
    fs.stat(filePath, (fileErr, status) => {
        let data;
        if (!fileErr) {
            fs.readFile(filePath, 'utf8', (readErr, oldData) => {
                if (!readErr) {
                    if (secret && oldData) {
                        decipher = crypto.createDecipher('aes192', secret);
                        data = decipher.update(oldData, 'hex', 'utf8') + decipher.final('utf8');
                    } else {
                        data = oldData;
                    }
                    callback(readErr, JSON.parse(data));
                } else {
                    callback(readErr, data);
                }
            });
        } else {
            callback(fileErr, data);
        }
    });
}

function _setData(options) {
    return (token, data = {}, callback = (err) => { }) => {
        let filePath = path.join(options.path, token);
        _readData(filePath, options.secret, (readErr, oldData) => {
            if (oldData) {
                data = Object.assign(data, oldData);
            }
            data = JSON.stringify(data);
            if (options.secret) {
                cipher = crypto.createCipher('aes192', options.secret);
                data = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
            }
            fs.writeFile(filePath, data,'utf8', (writeErr) => {
                callback(!Boolean(writeErr));
            });
        })
    }
}

function _getData(options) {
    return (token, key = '', callback = (err, data) => { }) => {
        let filePath = path.join(options.path, token);
        _readData(filePath, options.secret, (readErr, data) => {
            if (typeof key == 'function') {
                callback = key;
            }
            if (data && key && typeof key == 'string') {
                callback(data[key]);
            } else {
                callback(data);
            }
        })
    }
}

function _removeData(options) {
    return (token, key = '', callback = (err, data) => { }) => {
        let filePath = path.join(options.path, token);
        _readData(filePath, options.secret, (readErr, data) => {
            if (typeof key == 'function') {
                callback = key;
            }
            if (data && key && typeof key == 'string') {
                delete data[key];
            } else {
                data = {}
            }
            data = JSON.stringify(data);
            if (options.secret) {
                cipher = crypto.createCipher('aes192', options.secret);
                data = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
            }
            fs.writeFile(filePath, data,'utf8', (writeErr) => {
                callback(!Boolean(writeErr));
            });
        })
    }
}

function _init(options = { secret: '' }) {
    if (!options.secret && !options.secret.trim()) {
        options.secret = null;
    }
    if (!options.path) {
        options.path = path.join(process.cwd(), '/magicTokens');
    }
    try {
        fs.mkdirSync(options.path);
    } catch (e) {

    }
    return {
        set: _setData(options),
        get: _getData(options),
        remove: _removeData(options),
    }
}

module.exports.init = _init;