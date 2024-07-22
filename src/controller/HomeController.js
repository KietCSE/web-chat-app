const { response } = require('express')
const poolConversation = require('../model/UserPoolConversation');
const User = require('../model/User')
const { multipleDataToObject } = require('../util/toObject');
const { getMinuteAndHour } = require('../util/AnalyzeTime');

class HomeController {
    HomePage(req, res, data) {
        // console.log("render", data)
        res.render('home', {layout: 'main', data:data })
    }

    async CheckLoginUser(req, res) { 
        try {
            let acc = req.body.account 
            let pwd = req.body.password 
            let user = await User.findOne({account : acc, password : pwd})
            if (user) {
                res.status(200).json({status : true})
            }
            else {
                res.status(401).json({status: false})
            }
        }
        catch (error) {
            console.log(error)
            ///
        }
    }

    async LoadPoolConversation(id) {
        try {
            const res = await poolConversation.findOne({ pool_conversation_id: id });
            let list = res.people 
            return multipleDataToObject(list)
        } catch (err) {
            return 
        }
    }
    
}

module.exports = new HomeController