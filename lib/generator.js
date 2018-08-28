const crypto = require('crypto');

function _generateToken() {
    let x = Math.random();
    let y = Date.now();
    return crypto.createHash('RSA-MD5').update(y+'$'+x).digest('hex');
}
module.exports.token = _generateToken;