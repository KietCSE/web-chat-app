const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/User')
const encoder = require('../util/Encoder')


passport.use(new LocalStrategy(
     async function(username, password, done) {
        try {
                console.log("inside strategy")

                // find user account in database 
                let user = await User.findOne({account : username})

                if (!user) return done(null, false, {message: "Wrong username"})

                let checkPassword
                if (process.env.ENCODE_PASSWORD === 'true') {
                    checkPassword = await encoder.verifyPassword(password, user.password)
                } 
                else checkPassword = password == user.password

                if (!checkPassword) 
                    return done(null, false, {message: "wrong password"})

                const userID = user.pool_conversation_id
                
                return done(null, {status : true, userID: userID, username : user.name, avatar : user.avatar})
        
        } catch (err) { 
            done(err)
        }
    }
))

// catch authenticated object and store in session 
passport.serializeUser((id, done) => {
    console.log("inside serualizeuser")
    done(null, id)  // store in session 
})

// attach user infor from sesssion to req
passport.deserializeUser((user, done) => {
    try {
        console.log("inside deserualizeuser")
        if (user) done(null, user.userID)
        else throw Error("UserID is not define in cookie")
    }
    catch (err) {
        done(err)
    }
})

module.exports = passport