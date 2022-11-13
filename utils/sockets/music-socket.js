const { getCurrentUser, getUserDetail } = require('./../users');
const { getGroupDetail, updateGroupDetail, checkIfIsGroupAdmin } = require('./../groups');
const prismaClient = require('../../prisma/prisma-client');

module.exports = function initMusicSocketConnection(io, socket) {
    // Listen to music change
    socket.on('music-changed', async (fileData) => {

        console.log("MusicChanges ::: ", fileData)
        const group = await getGroupDetail(fileData.room);
        const isAdmin = await checkIfIsGroupAdmin({
            groupId: fileData.room, userId: fileData.userId
        })

        const musicdata = await prismaClient.musicData.create({
            data: {
                name: fileData.name, 
                size: fileData.size,
                type: fileData.type
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
            
            io.to(fileData.room).emit('changed-music', fileData);
        } else {
            io.to(fileData.userId).emit('changed-music', fileData);
        }
    })

    socket.on('music-current-time-changed', async (data) => {
        const user = await getUserDetail({uid: data.userId});
        if (user) {
            if (checkIfIsGroupAdmin({groupId: data.groupId, userId: user.id})) {
                const group = await getGroupDetail(data.groupId);
                await prismaClient.groupPlayState.update({
                    where: {
                        id: group.playState.id,
                    }, 
                    data: {
                        musicState: data.state,
                        currentPosition: data.time
                    }
                })
                // updateGroupDetail(group);
                socket.broadcast.to(data.groupId).emit('music-current-time-changed', {time: data.time, state: data.state})
            }
        }
    })
    socket.on('uploading_music', ({gid, message}) => {
        socket.broadcast.to(gid).emit('uploading_music', message);
    })

    socket.on('music_state_changed', (data) => {
        socket.broadcast.to(data.room).emit('music_state_changed', data)
    })

    socket.on('music-source-changed', (data) => {
        
        socket.broadcast.to(data.room).emit('music-source-changed', data)
    })
}