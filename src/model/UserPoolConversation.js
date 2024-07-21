const mongoose = require('mongoose')
const person = require('./toPerson')
const Schema = mongoose.Schema

const UserPoolConversation = new Schema({
    pool_conversation_id: {type: String}, 
    pivot: {type: Number}, 
    people: [person.schema]
})

module.exports = mongoose.model('UserPoolConversation', UserPoolConversation)