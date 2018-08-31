const cookie = require('cookie');
const generator = require('./generator');
const storage = require('./storage');


function _init(options = { secret: '', headers: false, cookie: true, storage: 'file' }) {
    if (!options.secret || !options.secret.trim()) {
        options.secret = null;
    }
    if (options.storage === 'file' || options.storage === undefined) {
        options.storage = 'file';
    } else {
        options.storage = 'database';
    }
    let store = storage.init({ secret: options.secret, storage: options.storage });
    let object = {};
    object.set = (data = {}, callback = (err, status) => { }) => {
        store.set(object.token, data, callback);
    }
    object.get = (key = '', callback = (err, status) => { }) => {
        store.get(object.token, key, callback);
    }
    object.remove = (key = '', callback = (err, status) => { }) => {
        store.remove(object.token, key, callback);
    }
    return (req, res, next) => {
        var cookies = cookie.parse(req.headers.cookie || '');
        if (cookies.magicToken) {
            object.token = cookies.magicToken;
        } else if (req.headers.magicToken) {
            object.token = req.headers.magicToken;
        } else {
            object.token = generator.token();
            cookies.magicToken = object.token;
        }
        req.magicToken = object;
        if (options.headers) {
            res.set('magicToken', object.token);
        }
        if (options.cookie) {
            res.set('Set-Cookie', 'magicToken=' + object.token);
        }
        next();
    }
}

module.exports.init = _init;