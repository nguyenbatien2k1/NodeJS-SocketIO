import express from 'express';
import configViewEngine from './config/viewEngine.js';

const app = express()
const port = 3000

// config view engine
configViewEngine(app);

// socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => { 
    console.log('Co nguoi ket noi: ', socket.id);

    socket.on('disconnect', () => {
        console.log('Nguoi nay da ngat ket noi: ', socket.id)
    })
});

app.get('/', (req, res) => {
    return res.render('test')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})