const onlineList = require('../util/Online')
const User = require('../model/User')
const userPoolConversation = require('../model/UserPoolConversation')
const encoder = require('../util/Encoder')
const { multipleDataToObject } = require('../util/toObject')

const LENGTHCODE = 12

class LoginController {
    LoginPage(req, res) { 
        res.render('login', {layout : 'another'})
    }

    //LOAD CURRENT ONLINE USER 
    async LoadOnlineUser(req, res, io) {
        const user = req.body.userID
        const id = req.body.socketID

        if (!user || !id) return

        //send notify new user is online to orther users 
        if (!onlineList.isEmpty()) {
            const findUser = await userPoolConversation.findOne({ pool_conversation_id : user })
            const friends = multipleDataToObject(findUser.people)
            const listfriends = friends.map(element => element.id_user)
            
            listfriends.forEach(userId => {
                if (onlineList.isOnline(userId)) {
                    io.to(onlineList.socketIdOf(userId)).emit("receiveOnline", user)
                }
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
    // async CheckLoginUser(req, res) { 
    //     try {
    //         const { account: acc, password: pwd } = req.body;

    //         // find user account in database 
    //         let user = await User.findOne({account : acc})
    //         if (user) {
    //             // let checkPassword = await encoder.verifyPassword(pwd, user.password)
    //             let checkPassword = pwd == user.account

    //             if (!checkPassword) 
    //                 res.status(200).json({status: false, message: "wrong password"})

    //             const userID = user.pool_conversation_id
    //             // response client 
    //             res.status(200).json({status : true, userID: userID, username : user.name, avatar : user.avatar})
    //         }
    //         else {
    //             res.status(500).json({status: false, message: "wrong account"})
    //         }
    //     }
    //     catch (error) {
    //         console.log(error)
    //         ///
    //     }
    // }

    // check valid account user 
    async CheckLoginUser(req, res) { 
        return res.json(req.user)  // return user information to client 
    }

    //create new account 
    async CreateNewUser(req, res) { 
        try {
            // validate whether account have existed
            let acc = req.body.account 
            let pwd = req.body.password 

            if (acc === undefined || pwd === undefined) {
                res.status(500).json({status: false, message : "Tai khoan hoac mat khau khong hop le"})
                return 
            } 
            let user = await User.findOne({account : acc})
            if (user) {
                res.status(500).json({status: false, message : "Ten dang nhap da duoc su dung"})
                return 
            }

            //create user ID = conversation pool ID
            const userID = encoder.encodeID(pwd, LENGTHCODE)  //userID = conversationID

            //hash password
            if (process.env.ENCODE_PASSWORD === 'true') {
                pwd = await encoder.hashPassword(pwd)
            }            

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
            
            const response = {
                status : true, 
                userID : userID,
                username : req.body.username,  
                avatar : req.body.avatar,
            }

            req.login(response, (err) => {
                if (err) console.log(err)
                //response client to load front end 
                res.status(200).json(response)
            })
        }
        catch (err) {
            console.log(err)
            res.status(200).json({status : false, message: "khong the tao tai khoan"})
        }
    }

}

module.exports = new LoginController