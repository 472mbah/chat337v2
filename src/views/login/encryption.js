
// https://www.w3schools.com/nodejs/ref_crypto.asp
// Nodejs encryption with CTR
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encrypt = text => {
    var mykey = crypto.createCipher('aes-128-cbc', 'chat3372.0_password');
    var mystr = mykey.update(text, 'utf8', 'hex')
    mystr += mykey.final('hex');
    return mystr;
}

module.exports = { encrypt }