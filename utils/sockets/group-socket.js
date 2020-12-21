// const { getGroupDetail, updateGroupDetail } = require("../groups");
// const { getCurrentUser } = require("../users")
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser, updateUserDetail } = require('../users');
const { createGroup, getGroupDetail, updateGroupDetail, deleteGroup } = require('../groups');
const formatMessage = require('../message.model');
const { botName } = require('../constants');

module.exports = function initGroupSocketConnection(io, socket) {
    socket.on('add-music-to-group', (musicData) => {
        console.log('Wants to add to group data by adding to the music')
        var user = getCurrentUser(socket.id);
        console.log(user)
        if (user) {
            if (user.type === 'admin') {
                var group = getGroupDetail(user.room);
                console.log(group)
                group.musics.push(musicData);
                updateGroupDetail(group);
                console.log(group)
                io.to(user.room).emit('group-data-changed', group)
            }
        }
    })

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
                io.to(user.room).emit('message', formatMessage(botName, `Admin have been switched to ${userToChange.name}`))
            }
        }
    })
}