const { response } = require('express')
const poolConversation = require('../model/UserPoolConversation');
const { multipleDataToObject } = require('../util/toObject');
const { getMinuteAndHour } = require('../util/AnalyzeTime');

class HomeController {
    HomePage(req, res, data) {
        console.log("render", data)
        res.render('home', {layout: 'main', data:data })
    }

    async LoadPoolConversation(id) {
        try {
            const res = await poolConversation.findOne({ pool_conversation_id: id });
            let list = res.people 
            return multipleDataToObject(list)
        } catch (err) {
            console.error(err);
        }
    }
    
}

module.exports = new HomeController