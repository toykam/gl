const { getCurrentUser } = require('./../users');
const { getGroupDetail, updateGroupDetail } = require('./../groups');

module.exports = function initMusicSocketConnection(io, socket) {
    // Listen to music change
    socket.on('music-changed', (fileData) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            // Get Group Detail
            const group = getGroupDetail(user.room);
            
            // Set Group Music Data
            group.musicData = fileData;
            console.log(group);
            if (user.type == 'admin') {
                // Update Group Data
                updateGroupDetail(group);
                
                io.to(user.room).emit('changed-music', group);
            } else {
                io.to(user.id).emit('changed-music', group);
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
                socket.broadcast.to(user.room).emit('music-current-time-changed', {time: data.time, state: data.state})
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

    socket.on('music-source-changed', (data) => {
        var user = getCurrentUser(socket.id);
        if (user) {
            if (user.type == 'admin') {
                socket.broadcast.to(user.room).emit('music-source-changed', data)
            }
        }
    })
}