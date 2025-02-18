const bcrypt = require("bcrypt");
const { func } = require("joi");

module.exports = {
    hashValue: async function (value) {
    const saltRounds = 10;
    return await bcrypt.hash(value, saltRounds);    
},

compareValue: async function (value, hash) {
    return await bcrypt.compare(value, hash)    
}
}