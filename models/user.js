// for app.js
// const mongoose = require('mongoose');
// let Schema = mongoose.Schema;

// module.exports = mongoose.model('User', new Schema({
//     name: String,
//     password: String,
//     admin: Boolean
// }));



// for server.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
    local: {
        email: String,
        password: String
    }
});


userSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = (password) => {
    return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);