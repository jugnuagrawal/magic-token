const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const deepmerge = require('deepmerge');
const utils = require('./utils');

const fileUtils = {};

fileUtils.init = (options) => {
    if (!options.secret || !options.secret.trim()) {
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
        set: fileUtils.setData(options),
        get: fileUtils.getData(options),
        delete: fileUtils.deleteData(options),
        /**
         * @deprecated Please use delete method
         */
        remove: fileUtils.deleteData(options)
    }
};

fileUtils.readData = (filePath, secret, callback) => {
    fs.stat(filePath, (fileErr, status) => {
        let data;
        if (!fileErr) {
            fs.readFile(filePath, 'utf8', (readErr, oldData) => {
                if (!readErr) {
                    if (secret && oldData) {
                        data = utils.decrypt(oldData, secret);
                    } else {
                        data = oldData;
                    }
                    callback(readErr, data ? JSON.parse(data) : null);
                } else {
                    callback(readErr, data);
                }
            });
        } else {
            if (fileErr.code === 'ENOENT') {
                fs.writeFileSync(filePath, '', 'utf8');
                callback(null, data);
            } else {
                callback(fileErr, data);
            }
        }
    });
};

fileUtils.setData = (options) => {
    return (token, data = {}, callback = (err, status) => { }) => {
        const filePath = path.join(options.path, token);
        fileUtils.readData(filePath, options.secret, (readErr, oldData) => {
            if (readErr) {
                callback(readErr, false);
                return;
            }
            if (oldData) {
                data = deepmerge(oldData, data);
            }
            data = JSON.stringify(data);
            if (options.secret) {
                data = utils.encrypt(data, options.secret);
            }
            fs.writeFile(filePath, data, 'utf8', (writeErr) => {
                callback(writeErr, !Boolean(writeErr));
            });
        });
    };
};

fileUtils.getData = (options) => {
    return (token, key = '', callback = (err, data) => { }) => {
        const filePath = path.join(options.path, token);
        fileUtils.readData(filePath, options.secret, (readErr, data) => {
            if (readErr) {
                callback(readErr, null);
                return;
            }
            if (typeof key == 'function') {
                callback = key;
                key == null;
            }
            if (key && key.trim()) {
                callback(null, utils.getValue(key, data));
            } else {
                callback(null, data);
            }
        });
    };
};

fileUtils.deleteData = (options) => {
    return (token, key = '', callback = (err, data) => { }) => {
        const filePath = path.join(options.path, token);
        fileUtils.readData(filePath, options.secret, (readErr, data) => {
            if (readErr) {
                callback(readErr, null);
                return;
            }
            if (typeof key == 'function') {
                callback = key;
                key = null;
            }
            let deletedValue;
            if (key && key.trim()) {
                deletedValue = utils.getValue(key, data);
                utils.deleteValue(key, data);
            } else {
                deletedValue = JSON.parse(JSON.stringify(data));
                data = {}
            }
            data = JSON.stringify(data);
            if (options.secret) {
                data = utils.encrypt(data, options.secret);
            }
            fs.writeFile(filePath, data, 'utf8', (writeErr) => {
                callback(writeErr, deletedValue);
            });
        });
    };
};

const dbUtils = {};

dbUtils.init = (options) => {
    mongoose.connect(options.mongoURL, {
        useNewUrlParser: true
    }, (err) => {
        if (err) {
            throw err;
        }
    });
    const schema = new mongoose.Schema({
        _id: {
            type: String,
            required: true
        },
        data: {
            type: String
        },
        createdOn: {
            type: Date,
            default: Date.now()
        }
    });

    schema.pre('update', function (next) {
        this.update({}, { $inc: { __v: 1 } });
        next();
    });
    const model = mongoose.model('magicToken', schema, 'magicToken');
    return {
        set: dbUtils.setData(options, model),
        get: dbUtils.getData(options, model),
        delete: dbUtils.deleteData(options, model),
        /**
         * @deprecated Please use delete method
         */
        removed: dbUtils.deleteData(options, model)
    };
};

dbUtils.setData = (options, model = mongoose.Model) => {
    return (token, data, callback = (err, status = true) => { }) => {
        if (!data || typeof data !== 'object') {
            callback({ message: 'data should be an object' }, null);
            return;
        }
        model.findById(token, 'data', (err, res) => {
            if (err) {
                callback(err, null);
                return;
            }
            if (res && res.data) {
                model.update({ _id: token }, { data: dbUtils.updateData(options, res.data, data) }).then(_d => {
                    callback(null, true);
                }).catch(_err => {
                    callback(_err, null);
                });
            } else {
                let body;
                if (options.secret) {
                    body = {
                        _id: token,
                        data: utils.encrypt(JSON.stringify(data), options.secret)
                    };
                } else {
                    body = {
                        _id: token,
                        data: JSON.stringify(data)
                    };
                }
                model.create(body).then(_d => {
                    callback(null, true);
                }).catch(_err => {
                    callback(_err, false);
                });
            }
        });
    };
};

dbUtils.getData = (options, model = mongoose.Model) => {
    return (token, key = '', callback = (err, data) => { }) => {
        if (typeof key === 'function') {
            callback = key;
            key = null;
        }
        model.findById(token, 'data', (err, data) => {
            if (err) {
                callback(err, data);
                return;
            }
            let tempData;
            if (data && data.data) {
                if (options.secret) {
                    tempData = JSON.parse(utils.decrypt(data.data, options.secret));
                } else {
                    tempData = JSON.parse(data.data);
                }
            }
            if (key && key.trim()) {
                callback(err, tempData ? utils.getValue(key, tempData) : null);
            } else {
                callback(err, tempData);
            }
        });
    }
};

dbUtils.deleteData = (options, model = mongoose.Model) => {
    return (token, key = '', callback = (err, data) => { }) => {
        if (typeof key === 'function') {
            callback = key;
            key = null;
        }
        if (key && key.trim()) {
            model.findById(token, 'data', (err, data) => {
                if (err || !data) {
                    callback(err, data);
                    return;
                }
                if (options.secret) {
                    data.data = utils.decrypt(data.data, options.secret);
                }
                const tempData = JSON.parse(data.data);
                let returnData;
                if (tempData) {
                    if (utils.getValue(key, tempData)) {
                        returnData = JSON.parse(JSON.stringify(utils.getValue(key, tempData)));
                    }
                    utils.deleteValue(key, tempData);
                } else {
                    tempData = {}
                }
                data.data = JSON.stringify(tempData);
                if (options.secret) {
                    data.data = utils.encrypt(data.data, options.secret);
                }
                model.update({ _id: token }, data, (err2, data2) => {
                    callback(err2, returnData);
                });
            });
        } else {
            model.findByIdAndRemove(token, (err2, data2) => {
                callback(err2, returnData);
            });
        }
    }
};

dbUtils.updateData = (options, oldData, newData) => {
    if (oldData) {
        if (options.secret) {
            oldData = JSON.parse(utils.decrypt(oldData, options.secret));
        } else {
            oldData = JSON.parse(oldData);
        }
    } else {
        oldData = {};
    }
    if (options.secret) {
        return utils.encrypt(JSON.stringify(deepmerge(oldData, newData)), options.secret);
    } else {
        return JSON.stringify(deepmerge(oldData, newData));
    }
};

function _init(options = { secret: '', storage: 'file', mongoURL: 'mongodb://localhost:27017/tokens' }) {
    if (options.storage === 'file' || options.storage === undefined) {
        return fileUtils.init(options);
    } else {
        if (!options.mongoURL) {
            options.mongoURL = 'mongodb://localhost:27017/tokens'
        }
        return dbUtils.init(options);
    }
}

module.exports.init = _init;