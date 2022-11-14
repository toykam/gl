const { getCurrentUser } = require('../users');
const formatMessage = require('../message.model');

module.exports = function initMessageSocketConnection(io, socket) {
    // socket
    // Listen to music change
    socket.on('typing', async ({groupId, name, message}) => {
        //  get user data
        // const user = await getUserDetail(socket.id);
        socket.join(groupId);
        // console.log("Is typing...");
        if (message.length > 0) {
            socket.broadcast.to(groupId).emit('user_is_typing', `${name} is typing`);
        } else {
            socket.broadcast.to(groupId).emit('user_is_typing', ``);
        }
    })

    // Listen for chat message
    socket.on('chatMessage', async (data) => {
        socket.join(data.groupId);
        // {groupId, uid, message}
        console.log('after message was sent: ', socket._events)
        // const user = getCurrentUser(socket.id)
        console.log('Receiving message id: ', data.groupId)
        socket.broadcast.to(data.groupId).emit('user_is_typing', ``);
        io.to(data.groupId).emit('message', await formatMessage(data.uid, data.text))
    })
}