var users = [];

function userJoin(name, room, id, type) {
    const user = { name, room, id, type };
    users.push(user);
    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

function getRoomUser(room) {
    return users.filter(user => user.room == room)
}

function userLeavesChat(id) {
    // const index = users.findIndex(user => user.id === id);
    users = users.filter(user => user.id !== id);
}

module.exports = {
    userJoin,
    getCurrentUser,
    getRoomUser,
    userLeavesChat
}