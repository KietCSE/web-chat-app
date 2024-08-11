const onlineList = require('../util/Online')
const User = require('../model/User')
const userPoolConversation = require('../model/UserPoolConversation')
const encoder = require('../util/Encoder')

const LENGTHCODE = 12

class LoginController {
    LoginPage(req, res) { 
        res.render('login', {layout : 'another'})
    }

    //LOAD CURRENT ONLINE USER 
    LoadOnlineUser(req, res, io) {
        const user = req.body.userID
        const id = req.body.socketID

        //send notify new user is online to orther users 
        if (!onlineList.isEmpty()) {
            Object.values(onlineList.online).forEach(socketid => {
                io.to(socketid).emit("receiveOnline", user)
            })
        }

        //save new user online 
        if (user && id) {
            onlineList.MakeOnline(user, id)
        }
        console.log(onlineList.online)

        res.status(200).json({status : true, data : onlineList.online})
    }

    //check valid account user 
    async CheckLoginUser(req, res) { 
        try {
            let acc = req.body.account 
            let pwd = req.body.password 
            
            // find user account in database 
            let user = await User.findOne({account : acc, password : pwd})
            if (user) {
                // encode password to get user id 
                const userID = await encoder.encode(pwd, LENGTHCODE)
                // response client 
                res.status(200).json({status : true, userID: userID, username : user.name, avatar : user.avatar})
            }
            else {
                res.status(500).json({status: false})
            }
        }
        catch (error) {
            console.log(error)
            ///
        }
    }

    //create new account 
    async CreateNewUser(req, res) { 
        try {
            // validate 
            let acc = req.body.account 
            let pwd = req.body.password 

            if (acc === undefined || pwd === undefined) {
                res.status(500).json({status: false, message : "Tai khoan hoac mat khau khong hop le"})
                return 
            } 
            let user = await User.findOne({account : acc, password : pwd})
            if (user) {
                res.status(500).json({status: false, message : "Tai khoan hoac mat khau khong hop le"})
                return 
            }

            //create user ID = conversation pool ID
            const userID = await encoder.encode(pwd, LENGTHCODE)  //userID - conversationID

            //create new account 
            let newUser = new User({
                account : acc, 
                password : pwd, 
                pool_conversation_id : userID,
                name: req.body.username,  
                avatar : req.body.avatar,
            })

            //save account 
            await newUser.save()
                        
            //create new user-pool-conversation 
            let conversation = new userPoolConversation({
                pool_conversation_id : userID,
                pivot: 0, 
                people: [],
            })
            await conversation.save()
            

            //response client to load front end 
            res.status(200).json({
                status : true, 
                userID : userID,
                username : req.body.username,  
                avatar : req.body.avatar,
            })
        }
        catch (err) {
            console.log(err)
            res.status(200).json({status : false, message: "khong the tao tai khoan"})
        }
    }

}

module.exports = new LoginController