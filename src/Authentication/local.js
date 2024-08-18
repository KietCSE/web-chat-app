const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/User')

passport.use(new LocalStrategy(
     async function(account, password, done) {
        try {
            console.log("inside strategy")
            console.log(account)
            console.log(password)
            let findUser = await User.findOne({account : account, password : password})
            if (!findUser) throw Error("User not found")
            done(null, findUser.pool_conversation_id)
        } catch (err) { 
            done(err, null)
        }
    }
))

// catch authenticated object and store in session 
passport.serializeUser((id, done) => {
    done(null, id)  // store in session 
})

// attach user infor from sesssion to req
passport.deserializeUser((id, done) => {
    try {
      if (id) done(null, id)
      else throw Error("UserID is not define in cookie")
    }
    catch (err) {
      done(err)
    }
})

module.exports = passport