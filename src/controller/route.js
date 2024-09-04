const ConversationController = require('./ConversationController')
const homeController = require('./HomeController')
const loginController = require('./LoginController')
const passport = require('passport')
const  { isAuthenticated } = require('../middleware/checkAuthenticate')

function Route(app, io, upload) {
    // view home and load user first view 
    app.get('/', (req, res) => res.redirect(`/login`))

    // view login page
    app.get('/login',(req, res) => {
        // if (req.isAuthenticated()) res.redirect('/checklogin')
        loginController.LoginPage(req, res)
    })

    /* load online user and update online list */
    app.post('/load-online', async (req, res) => await loginController.LoadOnlineUser(req, res, io))
    
    //check user account for login
    app.post('/checklogin', passport.authenticate('local'), (req, res) => {
        loginController.CheckLoginUser(req, res)
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
    app.get('/user/:id', isAuthenticated, async (req, res) => {
        try {
            // get list friend and newfriend to load into frontend 
            const {listFriend, listnewFriend} = await homeController.GetDataForHomePage(req.params.id)
            homeController.HomePage(req, res, listFriend, listnewFriend) 
        }
        catch(err) {
            console.log(err)
        } 
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

    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) return res.sendStatus(400)
            console.log(req.session)
            res.json("Log out successfully!")
        })
    })

    app.get('/more-friend/:id/:slice', async (req, res) => {
        const listFriend = await homeController.LoadMoreFriend(req.params.slice, req.params.id)
        res.status(200).json(listFriend)
    })

    app.post('/user/:userid/search-friend', async (req, res) => {
        const matchString = req.body.text.split(/[;,\s]+/)
        console.log(matchString)
        const list = await homeController.SearchFriend(matchString, req.params.userid)
        res.status(200).json(list)
    })
}


module.exports = Route