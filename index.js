const express = require('express');
const path = require('path')
const http = require('http')
const Socket = require('socket.io');
const { SIGCONT } = require('constants');
const formatMessage = require('./utils/message.model');
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser } = require('./utils/users');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)
const io = Socket(server)
const botName = 'Chat Bot'

// Set Static File to be served
app.use(express.static(path.join(__dirname, 'public')))

// Run when a client connects   
io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.on('JoinRoom', ({ name, room }) => {
        const user = userJoin(name, room, socket.id);
        socket.join(user.room);
        socket.emit('message', formatMessage(botName, 'Welcome to the Chat Room'))
            // Broadcast when a user connects
        io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.name} has join the chat`))
    })

    // Runs when client disconnet
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id)
        userLeavesChat(socket.id);
        io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
        io.to(user.room).emit('message', formatMessage(botName, `${user.name} has left the chat`))
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id)
            // console.log(user)
        socket.broadcast.emit('message', formatMessage(`${user.name}`, message.text))
    })
})

server.listen(port, () => {
    console.log(`Server running on port : ${port}`)
})