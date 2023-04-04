import express from 'express';
import configViewEngine from './config/viewEngine.js';
import cors from 'cors';
import initWebRoutes from './route/web.js';
import database from './config/database/index.js';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import User from './models/User.js';

const app = express()
const port = 8080

// Connect DB
database.connect();

// config view engine
configViewEngine(app);

// JWT


// cookieParser
app.use(cookieParser());


// cors
app.use(cors())

// bodyParser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});


let manageUsers = [
    {
        username: 'admin',
        password: 'admin'
    }
];

let usersOnline = [
    {
        username: 'admin'
    }
]

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
        usersOnline = usersOnline.filter(item => item.username !== socket.username)
        socket.broadcast.emit('server-send-list-user', usersOnline);
        socket.broadcast.emit('server-send-user-stop-typing');       
    })

    socket.on('client-send-register', async (data) => {

        manageUsers = await User.find({});

        let checkUser = await User.findOne({username: data.username});
        
        if(checkUser) {
            socket.emit('server-send-register-failed');
        }
        else {
            await User.create(data);

            usersOnline.push({
                username: data.username
            })

            socket.username = data.username;

            socket.emit('getId', socket.id);

            let token = jwt.sign({username: data.username}, 'tienbasic')
            data.token = token;
            delete data.password;

            socket.emit('server-send-register-success', data);
            
            io.sockets.emit('server-send-list-user', usersOnline);

        } 
    })

    socket.on('client-send-login', async (data) => {
        manageUsers = await User.find({});
        let checkUser = await User.findOne({username: data.username, password: data.password});

        if(manageUsers.length === 0) {
            socket.emit('server-send-login-failed');
            return;
        }

        
        if(!checkUser) {
            socket.emit('server-send-login-failed');
        }
        else {
            data = {username: data.username, token: jwt.sign({username: data.username}, 'tienbasic')};

            usersOnline = usersOnline.filter(item => item.username !== data.username);

            usersOnline.push(data);

            socket.username = data.username;

            socket.emit('getId', socket.id);

            socket.emit('server-send-login-success', data);
            
            io.sockets.emit('server-send-list-user', usersOnline);

        } 
    })

    socket.on('logout', () => {
        usersOnline = usersOnline.filter(item => item.username !== socket.username);
        socket.broadcast.emit('server-send-list-user', usersOnline);
    })

    socket.on('user-send-value', data => {
        io.sockets.emit('server-send-value', {
            username: socket.username,
            content: data,
            id: socket.id
        })
    })

    socket.on('user-typing', data => {
        socket.broadcast.emit('server-send-user-typing', data + ' đang soạn tin nhắn')
    })

    socket.on('user-stop-typing', () => {
        socket.broadcast.emit('server-send-user-stop-typing')
    })

});

initWebRoutes(app);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})