const { getCurrentUser } = require('./../users');
const { getGroupDetail, updateGroupDetail } = require('./../groups');

module.exports = function initMusicSocketConnection(io, socket) {
    // Listen to music change
    socket.on('music-changed', (fileData) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            if (user.type == 'admin') {
                // Get Group Detail
                const group = getGroupDetail(user.room);
                // Set Group Music Data
                group.musicData = fileData;
                // Update Group Data
                updateGroupDetail(group);
                console.log(group);
                console.log(`Music Changed By: ${user.name} file ${fileData.name}`);
                io.to(user.room).emit('changed-music', fileData);
            }
        }
    })

    socket.on('music-current-time-changed', (data) => {
        var user = getCurrentUser(socket.id);
        if (user) {
            if (user.type == 'admin') {
                var group = getGroupDetail(user.room);
                group.currentPosition = data.time;
                group.state = data.state;
                updateGroupDetail(group);
            }
        }
    })
    socket.on('uploading_music', (message) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            socket.broadcast.to(`${user.room}`).emit('uploading_music', message);
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
}