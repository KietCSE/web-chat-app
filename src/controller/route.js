const ConversationController = require('./ConversationController')
const homeController = require('./HomeController')
const loginController = require('./LoginController')
const passport = require('passport')

function Route(app, io, upload) {
    // view home and load user first view 

    // view login page
    app.get('/login',(req, res) => loginController.LoginPage(req, res))

    /* load online user and update online list */
    app.post('/load-online', (req, res) => loginController.LoadOnlineUser(req, res, io))
    
    //check user account for login
    app.post('/checklogin', async (req, res) => {
        await loginController.CheckLoginUser(req, res)
    })

    //create user account 
    app.post('/create-new-user',  async (req, res) => {
        await loginController.CreateNewUser(req, res)
    })

    // // home page for each user 
    // app.get('/user/:id',  async (req, res) => {
    //     try {
    //         // load list of friend 
    //         let listFriend = await homeController.LoadPoolConversation(req.params.id)
    //         // load all user from database 
    //         let ListUser = await homeController.LoadNewFriend()

    //         let listId = [] 
    //         listFriend.forEach(e => {
    //             listId.push(e.id_user)
    //         })
                
    //         let listnewFriend = [] 
    //         ListUser.forEach(element => {
    //             if (element.pool_conversation_id != req.params.id) {
    //                 if (listId.includes(element.pool_conversation_id)) {
    //                     listnewFriend.push({ 
    //                         name : element.name, 
    //                         isFriend : false, 
    //                         key : element.pool_conversation_id,
    //                         avatar: element.avatar
    //                     })
    //                 }
    //                 else {
    //                     listnewFriend.push({ 
    //                         name : element.name, 
    //                         isFriend : true, 
    //                         key : element.pool_conversation_id,
    //                         avatar: element.avatar,
    //                     })
    //                 }
    //             }
    //         });

    //         homeController.HomePage(req, res, listFriend, listnewFriend) 
    //     }
    //     catch(err) {} 
    // })

    // home page for each user 
    app.get('/user/:id',  async (req, res) => {
        try {
            // get list friend and newfriend to load into frontend 
            const {listFriend, listnewFriend} = await homeController.GetDataForHomePage(req.params.id)
            homeController.HomePage(req, res, listFriend, listnewFriend) 
        }
        catch(err) {} 
    })

    // Load friend conversation content 
    app.get('/chat/:id', async (req, res) => {
        await ConversationController.LoadConversationById(req, res)      
    })

    app.get('/chat/:id/:slice', async (req, res) => {
        await ConversationController.LoadSlideConversationById(req, res)      
    })

    app.post('/uploadFile', upload.single('uploadFile') , async (req, res) => {
        const data = await homeController.UpLoadFileToFirebase(req.file)
        return res.json({"downloadURL" : data })
    })
}


module.exports = Route