const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema({
    date: {type: String, required: true},
    title: {type: String, required: true},
    text: {type: String, required: true},
    sender: {type: String, required: true}
})

module.exports = mongoose.model('Message', Message)