const ConversationController = require('./ConversationController')
const homeController = require('./HomeController')
const loginController = require('./LoginController')

function Route(app) {
    // view home and load user first view 

    // view login page
    app.get('/login',  (req, res) => loginController.LoginPage(req, res))

    // load online user 
    app.post('/load-online', (req, res) => loginController.LoadData(req, res))
    
    //check user account for login
    app.post('/checklogin', async (req, res) => {
        await loginController.CheckLoginUser(req, res)
    })

    //create user account 
    app.post('/create-new-user', async (req, res) => {
        await loginController.CreateNewUser(req, res)
    })

    app.get('/user/:id',  async (req, res) => {
        try {
            let listFriend = await homeController.LoadPoolConversation(req.params.id)
            homeController.HomePage(req, res, listFriend) 
        }
        catch(err) {} 
    })

    // Load friend conversation pool 
    app.get('/chat/:id', async (req, res) => {
        await ConversationController.LoadConversationById(req, res)      
    })
}


module.exports = Route