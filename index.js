const crypto = require('crypto');

function _generateToken() {
    let x = Math.random();
    let y = (Number)(new Date());
    return crypto.createHash('RSA-SHA256').update(y+'$'+x).digest('base64');
}

module.exports.token = _generateToken;