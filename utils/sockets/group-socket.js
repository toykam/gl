const { getGroupDetail, updateGroupDetail } = require("../groups");
const { getCurrentUser } = require("../users")

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
}