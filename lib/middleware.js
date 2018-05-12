const generator = require('./generator');
const storage = require('./storage');


function _init(options = { secret: '', headers: false, cookie: true }) {
    if (options && !options.secret && !options.secret.trim()) {
        options.secret = null;
    }
    let store = storage.init({secret:options.secret});
    let object = {};
    Object.defineProperty(object, 'token', {
        value: generator.token()
    });
    object.set = (key, val, callback = null) => {
        let data = {};
        data[key] = val;
        store.set(object.token,data,callback);
    }
    object.get = (key = null, callback = null) => {
        store.get(object.token,key,callback);
    }
    object.remove = (key = null, callback = null) => {
        store.remove(object.token,key,callback);
    }
    return (req, res, next) => {
        req.magicToken = object;
        if (options.headers) {
            res.set('magicToken', object.token);
        }
        if (options.cookie) {

        }
        next();
    }
}

module.exports.init = _init;