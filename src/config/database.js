const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/WebChat');
        console.log('connect database sucessfully')
    }
    catch (error) {
        console.log("Connect fail")
        next()
    }
}

module.exports = {connect}