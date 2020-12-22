const formatMessage = require('./message.model');
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser, updateUserDetail } = require('./users');
const { createGroup, getGroupDetail, updateGroupDetail, deleteGroup } = require('./groups');
const initMusicSocketConnection = require('./sockets/music-socket');
const initGroupSocketConnection = require('./sockets/group-socket');
const initMessageSocketConnection = require('./sockets/message-socket');
const { botName } = require('./constants');

function initSocketConnections(io) {
    io.on('connection', (socket) => {

        socket.on("heartbeat", function (data) { console.log("socket is outside ", data, socket.id); });

        initMusicSocketConnection(io, socket);
        initMessageSocketConnection(io, socket);
        initGroupSocketConnection(io, socket);
        
        // Runs when client disconnet
        socket.on('disconnect', () => {
            try {
                // socket.connect();
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
                    io.to(user.room).emit('message', formatMessage({name: botName, id: 'bot-id'}, `${user.name} leave chat`))
                }
                console.log(socket);
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