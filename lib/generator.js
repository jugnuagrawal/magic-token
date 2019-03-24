const crypto = require('crypto');

/**
 * @module generator
 */
module.exports = {
    /**
     * Generate token
     * @function token
     * @return {string} token
     */
    token: function () {
        let x = Math.random();
        let y = Date.now();
        return crypto.createHash('RSA-MD5').update(y + '$' + x).digest('hex');
    }
};