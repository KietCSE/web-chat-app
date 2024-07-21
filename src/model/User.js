const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema({
    account: {type: String}, 
    password: {type: String}, 
    avatar: {type: String}, 
    name: {type: String}, 
    pool_conversation_id: {type: String}
})

module.exports = mongoose.model('User', User)