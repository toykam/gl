const { getCurrentUser } = require('../users');
const formatMessage = require('../message.model');

module.exports = function initMessageSocketConnection(io, socket) {

    // Listen to music change
    socket.on('typing', (message) => {
        // console.log(message);
        const user = getCurrentUser(socket.id);
        if (user) {
            if (message.length > 0) {
                socket.broadcast.to(user.room).emit('user_is_typing', `${user.name} is typing`);
            } else {
                socket.broadcast.to(user.room).emit('user_is_typing', ``);
            }
        }
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id)
            // console.log(user)
        if (user) {
            socket.broadcast.to(user.room).emit('user_is_typing', ``);
            io.to(user.room).emit('message', formatMessage(user, message.text))
        }
    })
}