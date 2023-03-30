import express from 'express';
import configViewEngine from './config/viewEngine.js';
import cors from 'cors';

const app = express()
const port = 8080

// config view engine
configViewEngine(app);

// cors
app.use(cors())

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

    socket.on('client-send-register', (data) => {
        let checkUser = false;
        
        for (let i = 0; i < manageUsers.length; i++) {
            if(manageUsers[i].username === data.username) {
                checkUser = true;
                break;
            }
        }
        if(checkUser) {
            socket.emit('server-send-register-failed');
        }
        else {
            manageUsers.push(data);

            usersOnline.push({
                username: data.username
            })

            socket.username = data.username;

            socket.emit('getId', socket.id);

            socket.emit('server-send-register-success', data.username);
            
            io.sockets.emit('server-send-list-user', usersOnline);

        } 
    })

    socket.on('client-send-login', (data) => {
        let checkUser = false;
        if(manageUsers.length === 0) {
            socket.emit('server-send-login-failed');
            return;
        }
        for (let i = 0; i < manageUsers.length; i++) {
            if(manageUsers[i].username === data.username && manageUsers[i].password === data.password) {
                checkUser = true;
                break;
            }
        }
        if(!checkUser) {
            socket.emit('server-send-login-failed');
        }
        else {
            data = {username: data.username};

            usersOnline = usersOnline.filter(item => item.username !== data.username);

            usersOnline.push(data);

            socket.username = data.username;

            socket.emit('getId', socket.id);

            socket.emit('server-send-login-success', data.username);
            
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

app.get('/', (req, res) => {
    return res.render('home')
})

app.get('/test', (req, res) => {
    return res.send('Hello Tien nha!')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})