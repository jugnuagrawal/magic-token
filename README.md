# magic-token

A library to generate unique token, that can be used as identifier.

### Features

- Generates token based on timestamp with some random characters
- Always unique with accuracy rate of 1M tokens per second
- Optimized generation with low latency
- Open source

### How to use

```javascript
npm i --save magic-token
const magicToken = require('magic-token');
const token = magicToken.token();
```