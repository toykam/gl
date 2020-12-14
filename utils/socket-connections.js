const formatMessage = require('./message.model');
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser } = require('./users');
const botName = 'Chat Bot';

function initSocketConnections(io) {
    io.on('connection', (socket) => {
        // Listen to music change
        socket.on('music-changed', (fileData) => {

            const user = getCurrentUser(socket.id);
            if (user) {
                if (user.type == 'admin') {
                    console.log(`Music Changed By: ${user.name} file ${fileData.name}`);
                    io.to(user.room).emit('changed-music', fileData);
                }
            }
        })

        socket.on('JoinRoom', ({ name, room }) => {
            try {
                const users = getRoomUser(room);
                var user;
                if (users.length == 0) {
                    user = userJoin(name, room, socket.id, 'admin');
                } else {
                    user = userJoin(name, room, socket.id, 'listener');
                }
                socket.join(user.room);
                socket.emit('message', formatMessage(botName, 'Welcome to the Chat Room'))
                    // Broadcast when a user connects
                io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.name} has join the chat`))
                console.log('new websocket connection')
            } catch (error) {
                console.log('JoinRoomError: ', error);
            }

        })

        socket.on('Admin_changed', (user) => {

        })

        socket.on('typing', (message) => {
            console.log(message);
            const user = getCurrentUser(socket.id);
            if (message.length > 0) {
                socket.broadcast.to(user.room).emit('user_is_typing', `${user.name} is typing`);
            } else {
                socket.broadcast.to(user.room).emit('user_is_typing', ``);
            }
        })

        socket.on('uploading_music', (message) => {
            const user = getCurrentUser(socket.id);
            socket.broadcast.to(`${user.room}`).emit('uploading_music', message);
        })

        // Runs when client disconnet
        socket.on('disconnect', () => {
            try {
                const user = getCurrentUser(socket.id)
                userLeavesChat(socket.id);
                if (user) {
                    console.log(`${user.name} Socket Disconnected`)
                    var users = getRoomUser(user.room);
                    if (users.length > 0) {
                        users[0]['type'] = 'admin';
                    }
                    io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                    io.to(user.room).emit('message', formatMessage(botName, `${user.name} has left the chat`))
                }
            } catch (error) {
                console.log('Disconnect Error: ', error)
            }

        })

        socket.on('music_state_changed', (data) => {
            var user = getCurrentUser(socket.id);
            if (user) {
                if (user.type == 'admin') {
                    socket.broadcast.to(user.room).emit('music_state_changed', data)
                }
            }
        })

        // Listen for chat message
        socket.on('chatMessage', (message) => {
            const user = getCurrentUser(socket.id)
                // console.log(user)
            socket.broadcast.to(user.room).emit('user_is_typing', ``);
            socket.broadcast.emit('message', formatMessage(`${user.name}`, message.text))
        })
    })
}

module.exports = initSocketConnections