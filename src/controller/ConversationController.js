const { response } = require('express')
const { multipleDataToObject } = require('../util/toObject');
const Conversation = require('../model/Conversation')

class ConversationController {

    async LoadConversationById(req, res) {
        try {
            let ID = req.params.id
            console.log(ID)
            const list = await Conversation.findOne({ id_conversation: ID });
            let listMessage = multipleDataToObject(list.content)
            return res.json(listMessage)
        } catch (err) {
            // EXCEPTION HANDLER
            console.error(err);
        }
    }
    
}

module.exports = new ConversationController