# magic-token

A library to generate unique token, that can be used as identifier or to store session data.

## Features

- Generates token based on timestamp with some random characters
- Always unique with accuracy rate of upto 1M tokens per second
- Optimized generation with low latency
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

- We are using file system to store data of token.

```javascript
const magicToken = require('magic-token');
const token = magicToken.token();
const store = magicToken.store({secret:'your-secret'}); //if secret is not provided, data will be stored without encryption in JSON format.


//Set data for the token
store.set(token,{name:'John Doe',email:'john@doe.com'},(status)=>{
    if(status){
        //Data stored for the provided token
    }else{
        //Data not stored for the provided token
    }
});


//Get data for the token
store.get(token,'name',(data)=>{
    if(data){
        //Data found for the provided key
    }else{
        //Data not found for the provided key
    }
});

//or

store.get(token,(data)=>{
    if(data){
        //Data found for the provided token
    }else{
        //Data not found for the provided token
    }
});


//Remove data from the token
store.remove(token,'name',(status)=>{
    if(status){
        //Data removed for the provided key
    }else{
        //Data not removed for the provided key
    }
});

//or

store.remove(token,(status)=>{
    if(status){
        //Data removed for the provided token
    }else{
        //Data not removed for the provided token
    }
});
```

License
----

MIT