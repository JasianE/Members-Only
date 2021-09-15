const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    userName: {type: String},
    email: {type: String, required: true},
    password: {type: String, required: true, minlength: 4},
    status: {type: String, required: true}
})

module.exports = mongoose.model('User', UserSchema)