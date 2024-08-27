const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const http = require('http');
const { Server }= require('socket.io');
// const onlineList = require('./util/Online')
const socketServer = require('./socket')
// const session = require('express-session')
const route = require('./controller/route')
const database = require('./config/database');
const multer = require('multer');
require('dotenv').config();

// connect database 
database.connect()

const app = express()

//create server 
const httpServer = http.createServer(app)

// //create socket 
const io = new Server(httpServer, { /* options */ });
//handle socket 
io.on("connection", (socket => socketServer.SocketHandle(io, socket)))

// multer setting 
const upload = multer({ storage: multer.memoryStorage() });

//set up view engine 
app.engine('handlebars', handlebars.engine()); //set up view engine for application 
app.set('view engine', 'handlebars'); //set up defaut view engine for application 
app.set('views', path.join(__dirname, '/views')); //set up folder for view 

//set up static folder (css, img, js)
app.use(express.static(path.join(__dirname, 'public')));

//MIDDLEWARE
app.use(express.json())   // handle json type 
app.use(express.urlencoded({ extended: true }));  //handle formadata type 

//handle route
route(app, io, upload)

const port = process.env.NODE_LOCAL_PORT || 3000;

//launch port 
httpServer.listen(port, ()=>{ console.log("server was launched successfully at",port)} )

module.exports = { io }

