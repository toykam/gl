// const { getGroupDetail, updateGroupDetail } = require("../groups");
// const { getCurrentUser } = require("../users")
const { userJoin, getCurrentUser, userLeavesChat, getRoomUser, updateUserDetail, getUserDetail } = require('../users');
const { createGroup, getGroupDetail, updateGroupDetail, deleteGroup, leaveGroup, swapGroupAdmin, joinGroup } = require('../groups');
const formatMessage = require('../message.model');
const { botName } = require('../constants');
const { Group, User } = require('../../models/connection');
const { groupPlayState } = require('../../prisma/prisma-client');

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

    socket.on('JoinRoom', async({ uid, gid }) => {
        try {
            // Get Group Detail
            
            var Grp = await getGroupDetail({"groupId": gid})
            var usr = await getUserDetail({"uid": uid});
            // console.log(Grp);
            // console.log(usr);

            if (!Grp) {
                socket.emit('ErrorOccurred', {'message': 'The group you want to join do not exists'})
            }
            

            joinGroup({"uid": uid, "gid": Grp.id}).then(async _=> {
                console.log("AfterJoiningGroup ::: ", _)
                // JoinRoom
                socket.join(_.id);
                // Emit message to the other users of new connection
                // Bot will welcome user to the room
                const membership = _.members.filter((e) => e.user.id == uid)[0]
                // console.log("JoinGroup ::: ", membership);
                socket.emit('message', await formatMessage('bot-id', 'Welcome to the Chat Room'));
                socket.emit('welcome', { group: _, user: usr, 'playState': groupPlayState[_.id], 'membership': membership });
                // socket.emit('welcome_music', { group: _, user:usr });
                // console.log(user);
                // Broadcast when a user connects
                // console.log('Joined room with ID: ', Grp.id)
                // notify members of new members list
                io.to(_.id).emit('UserListChanged', _.members)
                socket.broadcast.to(Grp.id).emit('message', await formatMessage('bot-id', `${usr.name} has join the chat`))
                // console.log('new websocket connection')
                // console.log('after socket connected: ',socket)
            })

        } catch (error) {
            console.log('JoinRoomError: ', error);
            socket.emit('ErrorOccurred', {'message': 'Unable to join room at the moment, please try again later'})
        }
    })

    socket.on('SilentJoinRoom', async ({ gid, uid }) => {
        try {
            // Get Group Detail
            var Grp = await getGroupDetail({groupId: gid})
            var usr = await getUserDetail({uid: uid});
            // console.log(Grp);

            if (!Grp) {
                socket.emit('ErrorOccurred', {'message': 'The group you want to join do not exists'})
            }
            if (!usr) {
                socket.emit('ErrorOccurred', {'message': 'Access denied, you need to login before you can join a group'})
            }

            const members = Grp.members;

            socket.join(Grp.id);
            // socket.emit('message', await formatMessage('bot-id', 'Welcome to the Chat Room'));
            socket.emit('welcome', { group:Grp, user: usr });
            socket.emit('welcome_music', { group:Grp, user:usr });
            // console.log(user);
            // Broadcast when a user connects
            io.to(Grp.id).emit('UserListChanged', members)
            // socket.broadcast.to(Grp.id).emit('message', await formatMessage('bot-id', `${usr.name} has join the chat`))
            // console.log('new websocket connection')
        } catch (error) {
            console.log('SilentJoinRoomError: ', error);
        }
    })

    socket.on('Admin_changed', async(uid, gid) => {
        var user = await getUserDetail({uid: uid});
        var group = await getGroupDetail({groupId: gid});
        
        if (!group) {
            socket.emit('ErrorOccurred', {'message': 'The group you want to join do not exists'})
        }
        if (!user) {
            socket.emit('ErrorOccurred', {'message': 'Access denied, you need to login before you can join a group'})
        }

        // var members = group.members.map(member => member.toJSON())

        await swapGroupAdmin({user, group}).then(async _ => {
            io.to(_.id).emit('UserListChanged', _.members)
            io.to(_.id).emit('message', await formatMessage('bot-id', `Admin have been switched to ${user.name}`))
        })

        // if (user) {
        //     if (user.type == 'admin') {
        //         updateUserDetail(user);
        //         updateUserDetail(userToChange);
        //         userToChange.type = 'admin';
        //         user.type = 'listener';
        //         io.to(user.room).emit('UserListChanged', getRoomUser(user.room))
        //         io.to(user.room).emit('message', await formatMessage('bot-id', `Admin have been switched to ${userToChange.name}`))
        //     }
        // }
    })

    socket.on('PublishGroup', ({name}) => {
        io.emit('PublishGroup', {name})
    })

    socket.on('LeaveGroup', async({mid}) => {
        try {
        
            leaveGroup({"membershipId": mid}).then(_ => {
                socket.to(_.id).emit('UserListChanged', _.members)
                socket.emit('LeaveGroup', {})
            })
        } catch (error) {
            console.log('Disconnect Error: ', error)
            socket.emit('ErrorOccurred', {message: 'An error occurred, Please try again later'})
        }
    })
}