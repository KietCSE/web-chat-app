const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Message = new Schema({
    from: {type: String}, 
    to: {type: String}, 
    content: {type: String},
    time: {type: String}, 
    image: {type: String},
    file: {type: String},
}, {
    timestamps : true
})

module.exports = mongoose.model('Message', Message)