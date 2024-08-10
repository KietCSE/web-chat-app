const mongoose = require('mongoose')

const Schema = mongoose.Schema

const toPerson = new Schema({
    name: {type: String}, 
    avatar: {type: String}, 
    id_conversation: {type: String}, 
    number: {type: Number}, 
    recentMessage: {type:String}, 
    recentTime: {type: String},
    id_user: {type: String}
})

module.exports = mongoose.model('toPerson', toPerson)