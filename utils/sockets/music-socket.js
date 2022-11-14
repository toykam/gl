const { getCurrentUser, getUserDetail } = require('./../users');
const { getGroupDetail, updateGroupDetail, checkIfIsGroupAdmin } = require('./../groups');
const prismaClient = require('../../prisma/prisma-client');
const { groupPlayState } = require('../../prisma/prisma-client');

module.exports = function initMusicSocketConnection(io, socket) {
    // Listen to music change
    socket.on('music-changed', async (fileData) => {

        console.log("MusicChanges ::: ", fileData)
        const group = await getGroupDetail(fileData.groupId);
        const isAdmin = await checkIfIsGroupAdmin({
            groupId: fileData.groupId, userId: fileData.userId
        })


        const musicdata = await prismaClient.musicData.create({
            data: {
                name: fileData.name, 
                size: fileData.size,
                type: fileData.mimetype,
                userId: fileData.userId
            }
        })

            
        // Set Group Music Data
        // group.musicData = fileData;
        // console.log(group);
        if (isAdmin) {
            // Update Group Data
            // updateGroupDetail(group);

            await prismaClient.groupPlayState.update({
                where: {
                    id: group.playState.id,
                }, 
                data: {
                    musicDataId: musicdata.id
                }
            })
            
            io.to(fileData.groupId).emit('changed-music', fileData);
        } else {
            io.to(fileData.userId).emit('changed-music', fileData);
        }
    })


    socket.on('music-current-time-changed', async (data) => {
        console.log("MusicTimeChanged ::: ",data)
        const user = await getUserDetail({uid: data.userId});
        if (user) {
            if (checkIfIsGroupAdmin({groupId: data.groupId, userId: user.id})) {
                const group = await getGroupDetail(data.groupId);
                
                groupPlayState[group.id] = {
                    ...groupPlayState[group.id],
                    musicState: data.state,
                    currentPosition: data.time
                }
                socket.broadcast.to(data.groupId).emit('music-current-time-changed', {time: data.time, state: data.state})
            }
        }
    })
    socket.on('uploading_music', ({gid, message}) => {
        socket.broadcast.to(gid).emit('uploading_music', message);
    })

    socket.on('music_state_changed', (data) => {
        console.log("MusicStateChanged ::: ", data)

        if (checkIfIsGroupAdmin({groupId: data.groupId, userId: data.userId})) {
            socket.broadcast.to(data.groupId).emit('music_state_changed', data)
        } else {
            socket.broadcast.to(data.userId).emit('music_state_changed', data)
        }


        socket.broadcast.to(data.groupId).emit('music_state_changed', data)
    })

    socket.on('music-source-changed', (data) => {

        if (checkIfIsGroupAdmin({groupId: data.groupId, userId: data.id})) {
            socket.broadcast.to(data.groupId).emit('music-source-changed', data)
        } else {
            socket.broadcast.to(data.userId).emit('music-source-changed', data)
        }
        
    })
}