const cookie = require('cookie');
const generator = require('./generator');
const storage = require('./storage');


function _init(options = { secret: '', headers: false, cookie: true }) {
    if (!options.secret || !options.secret.trim()) {
        options.secret = null;
    }
    let store = storage.init({secret:options.secret});
    let object = {};
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
        var cookies = cookie.parse(req.headers.cookie || '');
        if(cookies.magicToken){
            object.token = cookies.magicToken;
        }else if(req.headers.magicToken){
            object.token = req.headers.magicToken;
        }else{
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