// const { Server }= require('socket.io');
const onlineList = require('./util/Online')
const Conver = require('./model/Conversation')
const Message = require('./model/Message')
const UserPoolConversation = require('./model/UserPoolConversation')
const User = require('./model/User')
const toPerson = require('./model/toPerson')
const conversationController = require('./controller/ConversationController')


// //save message to database 
// async function SaveMessage(io, mess) {
    
//     const conversation = await  Conver.findOne({ id_conversation : mess.conver})
    
//     // if already have conversation
//     if (conversation) {
//         conversation.content.push( new Message({
//             from: mess.from,
//             to: mess.to, 
//             content: mess.content, 
//             time: mess.time
//         }))
//         conversation.save().then(res => console.log("saved message!!"))
//     }
//     // if there is no conversation yet 
//     else {
//         console.log("not found conver", mess.conver)
//         // create new conversation 
//         let newConver = new Conver({
//             id_conversation: mess.conver,  //can sua lai 
//             content : [
//                 {
//                     from: mess.from,
//                     to: mess.to, 
//                     content: mess.content, 
//                     time: mess.time
//                 }
//             ]
//         })
//         //save new conversation 
//         await newConver.save()
//         console.log("already created and saved")

//         //get information of new friend 
//         let newFriend = await User.findOne({pool_conversation_id : mess.to})
//         // console.log(newFriend)

//         //save new friend into your pool conversation 
//         let youraccount = await UserPoolConversation.findOne({pool_conversation_id : mess.from})
//         if (youraccount) {
//             youraccount.people.push(new toPerson({
//                 name: newFriend.name, 
//                 avatar: newFriend.avatar, 
//                 id_conversation: mess.conver, 
//                 number: 0, 
//                 recentMessage: mess.content, 
//                 recentTime: mess.time,
//                 id_user: newFriend.pool_conversation_id,
//                 new : 0
//             }))
//             await youraccount.save()
//             console.log("already push new friend into pool conversation")
//         }

//         //get your information 
//         let you = await User.findOne({pool_conversation_id : mess.from})
//         // console.log(you)

//         //save you into your friend's pool conversation 
//         let yourfriend = await UserPoolConversation.findOne({pool_conversation_id : mess.to})
//         if (yourfriend) {
//             yourfriend.people.push(new toPerson({
//                 name: you.name, 
//                 avatar: you.avatar, 
//                 id_conversation: mess.conver, 
//                 number: 0, 
//                 recentMessage: mess.content, 
//                 recentTime: mess.time,
//                 id_user: you.pool_conversation_id,
//                 new : 1,
//             }))
//             await yourfriend.save()
//             console.log("already push new friend into pool conversation")
//         }

//         //load frontend to new friend interface 
//         if (onlineList.isOnline(mess.to)) {
//             io.to(onlineList.socketIdOf(mess.to)).emit("sendNewFriend", you, mess)
//         }
//     }
// }

// // save status of new message when user offline 
// async function SaveStatusPoolConversation(mess) { 
//         let pool = await UserPoolConversation.findOne({pool_conversation_id : mess.to})
//         if (pool) {
//             let target = pool.people.find(e => e.id_user === mess.from) 
//             // console.log(target)
//             if (target) {
//                 target.recentMessage = mess.content
//                 target.recentTime = mess.time 
//                 target.new = (target.new || 0) + 1 
//             }
//             await pool.save()
//             console.log("unread status mess saved!")
//         }
// }

// socket function 
function SocketHandle(io, socket) {
    console.log(`Client connect: ${socket.id}`)

    // send mess to client 
    socket.on("sendMess", async (mess) => {
        console.log(mess)
        //if user is online 
        if (onlineList.isOnline(mess.to)) {
            conversationController.SaveMessage(io, mess) 
            //send message 
            io.to(onlineList.socketIdOf(mess.to)).emit("reviecedMess", mess)
        }
        else { 
            // change status of pool conversation of offline user 
            conversationController.SaveStatusPoolConversation(mess)
            conversationController.SaveMessage(io, mess) 
        }
        //save mess to database, if there are no conversation yet => create new one 
    })

    
    //update pool conversation when user offline 
    socket.on('updatePoolConver', async (list, userID) => {
        try {
            updatedDoc = await UserPoolConversation.findOneAndUpdate(
                        {pool_conversation_id: userID}, 
                        { $set : {people : list}}, 
                        { new : true}, )
            
            console.log("updated pool conversation of user!")
        } catch (err) {
            console.log(err)
        }   
    })


    //user disconect 
    socket.on('disconnect', () => {
        console.log(`Client disconnect: ${socket.id}`)
        let userid = onlineList.MakeOfflineBySocketID(socket.id)
        
        for (let key in onlineList.online) {
            io.to(onlineList.online[key]).emit("receiveOffline", userid)
        }

        console.log("online = ", onlineList.online)
    })
}

module.exports = {SocketHandle}
