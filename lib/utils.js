const crypto = require('crypto');

const e = {};

e.encrypt = (data, secret) => {
    const cipher = crypto.createCipher('aes192', secret);
    return (cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
};

e.decrypt = (data, secret) => {
    const decipher = crypto.createDecipher('aes192', secret);
    return (decipher.update(data, 'hex', 'utf8') + decipher.final('utf8'));
};

e.getValue = (key, obj) => {
    if (obj[key]) {
        return obj[key];
    }
    return key.split('.').reduce(function (p, c) {
        return p ? p[c] : null;
    }, obj);
};

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