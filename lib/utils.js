const crypto = require('crypto');

const e = {};

/**
 * @function encrypt
 * @param {string} data The data to encrypt
 * @param {string} secret Secret to encrypt data
 * @returns {string} Encrypted data
 */
e.encrypt = (data, secret) => {
    const cipher = crypto.createCipher('aes192', secret);
    return (cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
};

/**
 * @function decrypt
 * @param {string} data The data to decrypt
 * @param {string} secret Secret to decrypt data
 * @returns {string} Decrypted data
 */
e.decrypt = (data, secret) => {
    const decipher = crypto.createDecipher('aes192', secret);
    return (decipher.update(data, 'hex', 'utf8') + decipher.final('utf8'));
};

/**
 * @function getValue
 * @param {string} key The full key of an object to get a value
 * @param {string} obj Object from which value will be fetched
 * @returns {any} value from the object
 */
e.getValue = (key, obj) => {
    if (obj[key]) {
        return obj[key];
    }
    return key.split('.').reduce(function (p, c) {
        return p ? p[c] : null;
    }, obj);
};

/**
 * @function getValue
 * @param {string} key The full key of an object to delete
 * @param {string} obj Object from which key will be deleted
 * @returns {void}
 */
e.deleteValue = (key, obj) => {
    if (obj[key]) {
        delete obj[key];
    }
    const len = key.split('.').length;
    key.split('.').reduce((p, c, ci) => {
        if (ci === len - 1) {
            if (p) {
                delete p[c];
            }
        } else {
            if (p) {
                return p[c];
            }
        }
    }, obj);
};

module.exports = e;