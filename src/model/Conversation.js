const mongoose = require('mongoose')
const Message = require('./Message')

const Schema = mongoose.Schema

const Conversation = new Schema({
    id_conversation: {type: String},
    content : [Message.schema]
})

module.exports = mongoose.model('Conversation', Conversation)