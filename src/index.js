const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const http = require('http');
const { Server } = require('socket.io');
// const onlineList = require('./util/Online')
const socketServer = require('./socket')
const session = require('express-session')
const route = require('./controller/route')
const database = require('./config/database');
const multer = require('multer');
const passport = require('./Authentication/local')
require('dotenv').config();

const app = express()

//create server 
const httpServer = http.createServer(app)

// connect database 
database.connect()

//create and handle socket 
const io = new Server(httpServer, { /* options */ });
io.on("connection", (socket => socketServer.SocketHandle(io, socket)))

// multer setting for uploading files 
const upload = multer({ storage: multer.memoryStorage() });


//set up view engine 
app.engine('handlebars', handlebars.engine()); //set up view engine for application 
app.set('view engine', 'handlebars'); //set up defaut view engine for application 
app.set('views', path.join(__dirname, '/views')); //set up folder for view 


//set up static folder (css, img, js)
app.use(express.static(path.join(__dirname, 'public')));


// setting express-session
app.use(session({
    secret: process.env.SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: false
}));
// init passport
app.use(passport.initialize());
app.use(passport.session());


//MIDDLEWARE
app.use(express.json())   // handle json type 
app.use(express.urlencoded({ extended: true }));  //handle formadata type 

//handle route
route(app, io, upload)


//launch port 
const port = process.env.NODE_LOCAL_PORT || 3000;
httpServer.listen(port, () => { console.log("server was launched successfully at", port) })

module.exports = { io }

