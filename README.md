# magic-token

A package to generate unique token, that can be used as identifier or to store data.

## Features

- Generates 32 characters long token
- Always unique with accuracy rate of upto 1M tokens per second
- Secure data storage if secret is provided
- Open source

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
store.set(token,{name:'John Doe',email:'john@doe.com'},(err,status)=>{
    if(!err){
        //Data stored for the provided token
    }else{
        //Data not stored for the provided token
    }
});


//Get data for the token
store.get(token,'name',(err,data)=>{
    if(!err){
        //Data found for the provided key
    }else{
        //Data not found for the provided key
    }
});

//or

store.get(token,(err,data)=>{
    if(!err){
        //Data found for the provided token
    }else{
        //Data not found for the provided token
    }
});


//Deletes data from the token
store.delete(token,'name',(err,data)=>{
    if(!err){
        //Data deleted for the provided key
    }else{
        //Data not deleted for the provided key
    }
});

//or

store.delete(token,(err,data)=>{
    if(!err){
        //Data deleted for the provided token
    }else{
        //Data not deleted for the provided token
    }
});
```

### Use with express.js

```javascript
const express = require('express');
const magicToken = require('magic-token');

const app = express();

const magicTokenOptions = {
    secret:'your-secret', //if secret is not provided, data will be stored without encryption in JSON format.
    headers:true, //if true token will be send in headers
    cookie:true //if true token will be send in cookie
    storage:magicToken.STORAGE_MONGO_DB //default storage is file.
    mongoURL: 'mongodb://localhost:27017/tokens' // Mongo URL is required if storage type mongodb is used.
}

app.use(magicToken.middleware(magicTokenOptions));

app.post('/tokenData',(req,res)=>{
    req.magicToken.set(req.body,(err,status)=>{
        if(status){
            res.status(200).end('Data Saved');
        }else{
            res.status(500).end(err.message);
        }
    });
});

app.get('/tokenData',(req,res)=>{
    req.magicToken.get((err,data)=>{
        if(err){
            res.status(500).end(err.message);
        }else{
            res.status(200).json(data);
        }
    });
});

app.get('/tokenData/:key',(req,res)=>{
    req.magicToken.get(req.params.key,(err,data)=>{
        if(err){
            res.status(500).end(err.message);
        }else{
            res.status(200).json(data);
        }
    }) 
});

app.delete('/tokenData',(req,res)=>{
    req.magicToken.delete((err,data)=>{
        if(err){
            res.status(500).end(err.message);
        }else{
            res.status(200).json(data);
        }
    }) 
});

app.delete('/tokenData/:key',(req,res)=>{
    req.magicToken.delete(req.params.key,(err,data)=>{
        if(err){
            res.status(500).end(err.message);
        }else{
            res.status(200).json(data);
        }
    }) 
});

app.listen(3000,()=>{
    console.log('server is listening on port 3000');
})
```

License
----

MIT