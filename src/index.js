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

let manageUsers = [];

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
        console.log('Nguoi nay da ngat ket noi: ', socket.username);
        manageUsers = manageUsers.filter(item => item !== socket.username)
        console.log(manageUsers);
        socket.broadcast.emit('server-send-list-user', manageUsers);
        socket.broadcast.emit('server-send-user-stop-typing');       
    })

    socket.on('client-send-username', (data) => {
        if(manageUsers.includes(data)) {
            socket.emit('server-send-username-failed');
        }
        else {
            manageUsers.push(data);
            socket.username = data;

            socket.emit('getId', socket.id);

            socket.emit('server-send-username-success', data);
            
            io.sockets.emit('server-send-list-user', manageUsers);

            console.log('Co nguoi vua ket noi: ', socket.username);
            console.log(manageUsers);
        } 
    })

    socket.on('logout', () => {
        manageUsers = manageUsers.filter(item => item !== socket.username)
        console.log(manageUsers)

        socket.broadcast.emit('server-send-list-user', manageUsers);
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