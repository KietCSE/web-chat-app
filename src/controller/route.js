const ConversationController = require('./ConversationController')
const homeController = require('./HomeController')
const loginController = require('./LoginController')

function Route(app) {
    // view home and load user first view 

    // view login page
    app.get('/login',  (req, res) => loginController.LoginPage(req, res))

    // load online user 
    app.post('/load-online', (req, res) => loginController.LoadOnlineUser(req, res))
    
    //check user account for login
    app.post('/checklogin', async (req, res) => {
        await loginController.CheckLoginUser(req, res)
    })

    //create user account 
    app.post('/create-new-user', async (req, res) => {
        await loginController.CreateNewUser(req, res)
    })

    // home page for each user 
    app.get('/user/:id',  async (req, res) => {
        try {
            let listFriend = await homeController.LoadPoolConversation(req.params.id)
            let ListUser = await homeController.LoadNewFriend()

            console.log(listFriend)

            let listId = [] 
            listFriend.forEach(e => {
                listId.push(e.id_user)
            })

            console.log(listId)
            console.log(ListUser)

            let listnewFriend = [] 
            ListUser.forEach(element => {
                if (listId.includes(element.pool_conversation_id)) {
                    listnewFriend.push({ name : element.name, isFriend : false, key : element.pool_conversation_id})
                }
                else {
                    listnewFriend.push({ name : element.name, isFriend : true, key : element.pool_conversation_id})
                }
            });

            console.log(listnewFriend)

            homeController.HomePage(req, res, listFriend, listnewFriend) 
        }
        catch(err) {} 
    })

    // Load friend conversation pool 
    app.get('/chat/:id', async (req, res) => {
        await ConversationController.LoadConversationById(req, res)      
    })

    //test
    app.get('/test', async (req, res) => {
        await homeController.LoadNewFriend(1)
    })
}


module.exports = Route