const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const deepmerge = require('deepmerge');
const utils = require('./utils');

/**
 * @typedef {function} MethodOne
 * @param {string} token
 * @param {any} data
 * @returns {Promise<any>}
 */
/**
 * @typedef {Object}  FileUtils
 * @property {MethodOne}  readData
 * @property {MethodOne}  setData
 * @property {MethodOne}  getData
 * @property {MethodOne}  deleteData
 */

/**
* @typedef {Object}  DBUtils
* @property {MethodOne}  readData
* @property {MethodOne}  setData
* @property {MethodOne}  getData
* @property {MethodOne}  deleteData
* @property {MethodOne}  updateData
*/


const fileUtils = {};

/**
 * @param {Options} options 
 */
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
        /**
         * @function get
         * @param {string} token
         * @param {string} [key]
         */
        get: fileUtils.getData(options),
        delete: fileUtils.deleteData(options)
    }
};

/**
 * @function readData
 * @param {string} filePath
 * @param {string} [secret]
 * @returns {Promise<any>}
 */
fileUtils.readData = (filePath, secret) => {
    return new Promise((resolve, reject) => {
        try {
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
                            resolve(data ? JSON.parse(data) : null);
                        } else {
                            reject(readErr);
                        }
                    });
                } else {
                    if (fileErr.code === 'ENOENT') {
                        fs.writeFileSync(filePath, '', 'utf8');
                        resolve(data);
                    } else {
                        reject(fileErr);
                    }
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * @param {Options} options
 */
fileUtils.setData = (options) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {any} data
     */
    return (token, data) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(options.path, token);
            fileUtils.readData(filePath, options.secret).then((oldData) => {
                if (oldData) {
                    data = deepmerge(oldData, data);
                }
                data = JSON.stringify(data);
                if (options.secret) {
                    data = utils.encrypt(data, options.secret);
                }
                fs.writeFile(filePath, data, 'utf8', (writeErr) => {
                    if (writeErr) {
                        reject(writeErr);
                    } else {
                        resolve(true);
                    }
                });
            }).catch(err => {
                reject(err);
            });
        });
    };
};

/**
 * @param {Options} options 
 */
fileUtils.getData = (options) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {string} [key]
     */
    return (token, key) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(options.path, token);
            fileUtils.readData(filePath, options.secret).then(data => {
                if (typeof key == 'function') {
                    callback = key;
                    key == null;
                }
                if (key && key.trim()) {
                    resolve(utils.getValue(key, data));
                } else {
                    resolve(data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    };
};

/**
 * @param {Options} options
 */
fileUtils.deleteData = (options) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {string} [key]
     */
    return (token, key) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(options.path, token);
            fileUtils.readData(filePath, options.secret).then(data => {
                let deletedValue;
                if (key && key.trim()) {
                    deletedValue = utils.getValue(key, data);
                    utils.deleteValue(key, data);
                } else {
                    deletedValue = JSON.parse(JSON.stringify(data));
                    data = {};
                }
                data = JSON.stringify(data);
                if (options.secret) {
                    data = utils.encrypt(data, options.secret);
                }
                fs.writeFile(filePath, data, 'utf8', (writeErr) => {
                    if (writeErr) {
                        reject(writeErr);
                    } else {
                        resolve(deletedValue);
                    }
                });
            }).catch(err => {
                reject(err);
            });
        });
    };
};


const dbUtils = {};

/**
 * @param {Options} options 
 */
dbUtils.init = (options) => {
    mongoose.connect(options.mongoURL, { useNewUrlParser: true });
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
        delete: dbUtils.deleteData(options, model)
    };
};

/**
 * @param {Options} options
 * @param {module:mongoose.Model} model
 */
dbUtils.setData = (options, model) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {any} data
     */
    return (token, data) => {
        return new Promise((resolve, reject) => {
            if (!data || typeof data !== 'object') {
                reject({ message: 'data should be an object' })
                return;
            }
            model.findById(token, 'data').then(res => {
                if (res && res.data) {
                    model.update({ _id: token }, { data: dbUtils.updateData(options, res.data, data) })
                        .then(_d => {
                            resolve(true);
                        }).catch(err => {
                            reject(err);
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
                        resolve(true);
                    }).catch(err => {
                        reject(err);
                    });
                }
            }).catch(err => {
                reject(err);
            });
        });
    };
};

/**
 * @param {Options} options
 * @param {module:mongoose.Model} model
 */
dbUtils.getData = (options, model) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {string} [key]
     */
    return (token, key) => {
        return new Promise((resolve, reject) => {
            model.findById(token, 'data').then(data => {
                let tempData;
                if (data && data.data) {
                    if (options.secret) {
                        tempData = JSON.parse(utils.decrypt(data.data, options.secret));
                    } else {
                        tempData = JSON.parse(data.data);
                    }
                }
                if (key && key.trim()) {
                    resolve(tempData ? utils.getValue(key, tempData) : null);
                } else {
                    resolve(tempData);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
};

/**
 * @param {Options} options
 * @param {module:mongoose.Model} model
 */
dbUtils.deleteData = (options, model = mongoose.Model) => {
    /**
     * @type {function}
     * @param {string} token
     * @param {string} [key]
     */
    return (token, key) => {
        return new Promise((resolve, reject) => {
            if (key && key.trim()) {
                model.findById(token, 'data').then(data => {
                    if (!data) {
                        resolve(data);
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
                    model.update({ _id: token }, data).then(_d => {
                        resolve(returnData);
                    }).catch(err2 => {
                        reject(err2);
                    });
                }).catch(err => {
                    reject(err);
                });
            } else {
                model.findByIdAndRemove(token).then(_d => {
                    resolve(returnData);
                }).catch(err2 => {
                    reject(err2);
                });
            }
        });
    }
};

/**
 * @param {Options} options
 * @param {Object} oldData
 * @param {Object} newData
 * @returns {string}
 */
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

/**
 * 
 * @typedef {Object} Options
 * @property {string} [secret]
 * @property {string} [storage]
 * @property {string} [mongoURL]
 * @property {string} [path]
 */

/**
 * @function _init
 * @param {Options} options
 */
function _init(options) {
    if (!options) {
        options = {};
    }
    if (!options.path) {
        options.path = path.join(process.cwd(), '/magicTokens');
    }
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