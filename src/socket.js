// const { Server }= require('socket.io');
const onlineList = require('./util/Online')
const Conver = require('./model/Conversation')
const Message = require('./model/Message')

//save message to database 
function SaveMessage(mess) {
    Conver.findOne({ id_conversation : "123"})
    .then(conversation  => {
        if (conversation) {
            conversation.content.push( new Message({
                from: mess.from,
                to: mess.to, 
                content: mess.content, 
                time: mess.time
            }))
            conversation.save().then(res => console.log("saved message!!"))
        }
        else {
            console.log("not found conver")
        }
    })
    .catch(err => {
        console.log(err)
    }) 
}


// socket function 
function SocketHandle(io, socket) {
    console.log(`Client connect: ${socket.id}`)

    socket.on("sendMess", (mess) => {
         
        if (onlineList.isOnline(mess.to)) {
            //send message 
            io.to(onlineList.socketIdOf(mess.to)).emit("reviecedMess", mess)
        }
        //save database
        SaveMessage(mess) 
    })



    //user disconect 
    socket.on('disconnect', () => {
        console.log(`Client disconnect: ${socket.id}`)
        onlineList.MakeOfflineBySocketID(socket.id)
        console.log("online", onlineList.online)
    })
}




// socket function 
// io.on("connection", (socket) => {
//     console.log(`Client connect: ${socket.id}`)

//     socket.on("sendMess", (mess) => {
//         console.log(mess)   
//         if (onlineList.isOnline(mess.to)) {
//             // send mess
//             io.to(onlineList.socketIdOf(mess.to)).emit("reviecedMess", mess)
//         }
//         else {
//             //load database 
//         }
//     })

//     socket.on('disconnect', () => {
//         console.log(`Client disconnect: ${socket.id}`)
//         onlineList.MakeOfflineBySocketID(socket.id)
//         console.log("online", onlineList.online)
//     })
// });

module.exports = {SocketHandle}
