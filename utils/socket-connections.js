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
                socket.emit('message', formatMessage({name: botName, id: 'bot-id'}, 'Welcome to the Chat Room'));
                socket.emit('welcome', { group, user });
                console.log(user);
                // Broadcast when a user connects
                io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                socket.broadcast.to(user.room).emit('message', formatMessage({name: botName, id: 'bot-id'}, `${user.name} has join the chat`))
                console.log('new websocket connection')
            } catch (error) {
                console.log('JoinRoomError: ', error);
            }

        })

        socket.on('Admin_changed', (userToChange) => {
            var user = getCurrentUser(socket.id);
            if (user) {
                if (user.type == 'admin') {
                    updateUserDetail(user);
                    updateUserDetail(userToChange);
                    userToChange.type = 'admin';
                    user.type = 'listener';
                    io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                }
            }
        })

        // Runs when client disconnet
        socket.on('disconnect', () => {
            try {
                // socket.reconnect();
                const user = getCurrentUser(socket.id)
                userLeavesChat(socket.id);
                if (user) {
                    console.log(`${user.name} Socket Wants to Disconnect`)
                    var users = getRoomUser(user.room);
                    if (users.length > 0) {
                        users[0]['type'] = 'admin';
                    }
                    if (users.length == 0) {
                        deleteGroup(user.room);
                    }
                    io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
                    io.to(user.room).emit('message', formatMessage({name: botName, id: 'bot-id'}, `${user.name} wants to leave chat`))
                }
                // socket.connect();
                // console.log(socket);
            } catch (error) {
                console.log('Disconnect Error: ', error)
            }
        })

        // socket.on('LeaveGroup', () => {
        //     try {
        //         // socket.reconnect();
        //         const user = getCurrentUser(socket.id)
        //         userLeavesChat(socket.id);
        //         if (user) {
        //             console.log(`${user.name} Socket Wants to Disconnect`)
        //             var users = getRoomUser(user.room);
        //             if (users.length > 0) {
        //                 users[0]['type'] = 'admin';
        //             }
        //             if (users.length == 0) {
        //                 deleteGroup(user.room);
        //             }
        //             io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
        //             io.to(user.room).emit('message', formatMessage({name: botName, id: 'bot-id'}, `${user.name} wants to leave chat`))
        //         }
        //         // socket.socket.connect();
        //     } catch (error) {
        //         console.log('Disconnect Error: ', error)
        //     }
        // })

    })
}

module.exports = initSocketConnections