const express = require('express')
const morgan = require('morgan')
const path = require('path')
const handlebars = require('express-handlebars')
const http = require('http');
const { Server }= require('socket.io');
const onlineList = require('./util/Online')

// connect database 
const database = require('./config/database');
database.connect()

const app = express()

//create server 
const httpServer = http.createServer(app)

//create socket 
const io = new Server(httpServer, { /* options */ });

//middleware 
app.use(express.json())   // xu ly du lieu trung gian 

//set up view engine 
app.engine('handlebars', handlebars.engine()); //set up view engine for application 
app.set('view engine', 'handlebars'); //set up defaut view engine for application 
app.set('views', path.join(__dirname, '/views')); //set up folder for view 

//set up static folder (css, img, js)
app.use(express.static(path.join(__dirname, 'static')));


// socket function 
io.on("connection", (socket) => {
    console.log(`Client connect: ${socket.id}`)
    socket.on("sendMess", (mess) => {
        io.to(mess).emit("reviecedMess", mess)
        console.log(mess)
    })

    socket.on('disconnect', () => {
        console.log(`Client disconnect: ${socket.id}`)
        onlineList.MakeOfflineBySocketID(socket.id)
        console.log("online", onlineList.online)
    })
});

const route = require('./controller/route')
route(app)

const port = 3000;

//launch port 
httpServer.listen(port, ()=>{ console.log("server was launched successfully")} )




