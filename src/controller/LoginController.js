const onlineList = require('../util/Online')

class LoginController {
    LoginPage(req, res) { 
        res.render('login', {layout : 'main'})
    }

    LoadData(req, res) {
        const user = req.body.user
        const id = req.body.socketID

        if (user && id && !onlineList.isOnline(user)) {
            onlineList.MakeOnline(user, id)
        }
        
        console.log(onlineList.online)
        res.sendStatus(200);
    }
}

module.exports = new LoginController