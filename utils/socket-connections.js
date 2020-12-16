const formatMessage = require('./message.model');
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser } = require('./users');
const { createGroup, getGroupDetail, updateGroupDetail, deleteGroup } = require('./groups');
const initMusicSocketConnection = require('./sockets/music-socket');
const initGroupSocketConnection = require('./sockets/group-socket');
const initMessageSocketConnection = require('./sockets/message-socket');
const botName = 'Chat Bot';

function initSocketConnections(io) {
    io.on('connection', (socket) => {
        initMusicSocketConnection(io, socket);
        initMessageSocketConnection(io, socket);
        socket.on('JoinRoom', ({ name, room }) => {
            try {
                const users = getRoomUser(room);
                var user;
                var group;
                if (users.length == 0) {
                    group = createGroup(room, `${room}-${socket.id}`, 0, null, 'NONE');
                    user = userJoin(name, room, socket.id, 'admin');
                } else {
                    group = getGroupDetail(room);
                    user = userJoin(name, room, socket.id, 'listener');
                }
                socket.join(group.name);
                socket.emit('message', formatMessage(botName, 'Welcome to the Chat Room'));
                socket.emit('welcome', { group });
                console.log(group);
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
                    if (users.length == 0) {
                        deleteGroup(user.room);
                    }
                    io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                    io.to(user.room).emit('message', formatMessage(botName, `${user.name} has left the chat`))
                }
            } catch (error) {
                console.log('Disconnect Error: ', error)
            }

        })

    })
}

module.exports = initSocketConnections