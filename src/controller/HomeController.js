const { response } = require('express')
const poolConversation = require('../model/UserPoolConversation');
const User = require('../model/User')
const { multipleDataToObject } = require('../util/toObject');
// const { getMinuteAndHour } = require('../util/BufferMessage');

class HomeController {
    HomePage(req, res, data, friend) {
        res.render('home', {layout: 'main', data:data, friend: friend })
    }

    // load list conversation of specific user by ID
    async LoadPoolConversation(id) {
        try {
            const res = await poolConversation.findOne({ pool_conversation_id: id });
            // console.log(res)
            let list = res.people 
            // console.log("list:", list)
            return multipleDataToObject(list)
        } catch (err) {
            return 
        }
    }

    //load all user from database 
    async LoadNewFriend() {
        try {
            const res = await User.find(); 
            return multipleDataToObject(res)
        } catch (err) {
            return
        }
    }
    
}

module.exports = new HomeController