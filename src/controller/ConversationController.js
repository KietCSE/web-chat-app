const { response } = require('express')
const { multipleDataToObject } = require('../util/toObject');
const Conversation = require('../model/Conversation')
const UserPoolConversation = require('../model/UserPoolConversation')
const onlineList = require('../util/Online')
const Message = require('../model/Message')
const User = require('../model/User')
const toPerson = require('../model/toPerson')


class ConversationController {

    //load conversation with someone 
    async LoadConversationById(req, res) {
        try {
            let ID = req.params.id
            const list = await Conversation.findOne({ id_conversation: ID });
            let listMessage = multipleDataToObject(list.content)
            return res.json(listMessage)
        } catch (err) {
            // EXCEPTION HANDLER
            console.error(err);
        }   
    }

    //save message, find conversation, if there is no conver yet =? create one and update poll conver 
    async SaveMessage(io, mess) {
        const conversation = await Conversation.findOne({ id_conversation : mess.conver})
        
        // if already have conversation
        if (conversation) {
            conversation.content.push( new Message({
                from: mess.from,
                to: mess.to, 
                content: mess.content, 
                time: mess.time
            }))
            conversation.save().then(res => console.log("saved message!!"))
        }
        // if there is no conversation yet 
        else {
            console.log("not found conver", mess.conver)
            // create new conversation 
            let newConver = new Conversation({
                id_conversation: mess.conver,  //can sua lai 
                content : [
                    {
                        from: mess.from,
                        to: mess.to, 
                        content: mess.content, 
                        time: mess.time
                    }
                ]
            })
            //save new conversation 
            await newConver.save()
            console.log("already created and saved conversation ", mess.conver)
    
            //get information of new friend 
            let newFriend = await User.findOne({pool_conversation_id : mess.to})
            // console.log(newFriend)
    
            //save new friend into your pool conversation 
            let youraccount = await UserPoolConversation.findOne({pool_conversation_id : mess.from})
            if (youraccount) {
                youraccount.people.push(new toPerson({
                    name: newFriend.name, 
                    avatar: newFriend.avatar, 
                    id_conversation: mess.conver, 
                    number: 0, 
                    recentMessage: mess.content, 
                    recentTime: mess.time,
                    id_user: newFriend.pool_conversation_id,
                    new : 0,
                    newfriend : false
                }))
                await youraccount.save()
                console.log("already push new friend into your pool conversation")
            }
    
            //get your information 
            let you = await User.findOne({pool_conversation_id : mess.from})
            // console.log(you)
    
            //save you into your friend's pool conversation 
            let yourfriend = await UserPoolConversation.findOne({pool_conversation_id : mess.to})
            if (yourfriend) {
                yourfriend.people.push(new toPerson({
                    name: you.name, 
                    avatar: you.avatar, 
                    id_conversation: mess.conver, 
                    number: 0, 
                    recentMessage: mess.content, 
                    recentTime: mess.time,
                    id_user: you.pool_conversation_id,
                    new : 1,
                    newfriend : true
                }))
                await yourfriend.save()
                console.log("already push you into your friend's pool conversation")
            }
    
            //load frontend to new friend interface 
            if (onlineList.isOnline(mess.to)) {
                io.to(onlineList.socketIdOf(mess.to)).emit("sendNewFriend", you, mess)
            }
        }
    }
    
    // save status of new message when user offline 
    async SaveStatusPoolConversation(mess) { 
        let pool = await UserPoolConversation.findOne({pool_conversation_id : mess.to})
        if (pool) {
            let target = pool.people.find(e => e.id_user === mess.from) 
            // console.log(target)
            if (target) {
                target.recentMessage = mess.content
                target.recentTime = mess.time 
                target.new = (target.new || 0) + 1 
                await pool.save()
                console.log("unread status mess saved into your friend's conversation")
            }
            else {
                console.log("unread status mess can be written because you are not friend")
            }
        }
    }
}

module.exports = new ConversationController