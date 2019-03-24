# magic-token

A package to generate unique token, that can be used as identifier or to store data.

## Features

- Generates 32 characters long token
- Always unique with accuracy rate of upto 1M tokens per second
- Secure data storage if secret is provided

## How to use

### Save package

```sh
npm i --save magic-token
```

### Use only token

```javascript
const magicToken = require('magic-token');
const token = magicToken.token();
```

### Use token and store data

- Default storage is file system to store data of token.

```javascript
const magicToken = require('magic-token');
const token = magicToken.token();
const store = magicToken.store({
    secret: 'your-secret', //if secret is not provided, data will be stored without encryption in JSON format.
    storage: magicToken.STORAGE_MONGO_DB //default storage is file.
    mongoURL: 'mongodb://localhost:27017/tokens' // Mongo URL is required if storage type mongodb is used.
}); 


//Set data for the token
store.set(token,{name:'John Doe',email:'john@doe.com'}).then(status=>{
    //Do your stuff
}).catch(err=>{
    //Error occured
});


//Get data for the token
store.get(token,'name').then(data=>{
    //Data found for the provided key
}).catch(err=>{
    //Error occured
});

//or

store.get(token).then(data=>{
    //Data found for the provided token
}).catch(err=>{
    //Error occured
});


//Deletes data from the token
store.delete(token,'name').then(data=>{
    //Data deleted for the provided key
}).catch(err=>{
    //Error occured
});

//or

store.delete(token).then(data=>{
    //Data deleted for the provided token
}).catch(err=>{
    //Error occured
});
```

License
----

MIT