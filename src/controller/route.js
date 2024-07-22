const ConversationController = require('./ConversationController')
const homeController = require('./HomeController')
const loginController = require('./LoginController')

function Route(app) {
    app.get('/login',  (req, res) => loginController.LoginPage(req, res))
    app.post('/load-online', (req, res) => loginController.LoadData(req, res))
    
    app.get('/',  async (req, res) => {
        try {
            let listFriend = await homeController.LoadPoolConversation("123")
            homeController.HomePage(req, res, listFriend) 
        }
        catch(err) {}
        
    })

    app.get('/chat/:id', async (req, res) => {
        await ConversationController.LoadConversationById(req, res)      
    })
}


module.exports = Route