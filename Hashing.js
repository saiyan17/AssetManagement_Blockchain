const SHA256 = require("crypto-js/sha256");
const {DES} = require('./des');

module.exports = (input) => {
    var hash = SHA256(input).toString();
    return DES(hash,"KEYFORDES");
}
