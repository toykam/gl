// function getRoomUser(room) {
//     return users.filter(user => user.room == room)
// }

// function userLeavesChat(id) {
//     // const index = users.findIndex(user => user.id === id);
//     users = users.filter(user => user.id !== id);
// }

var groups = [];

function createGroup(name, id, currentPosition, musicData, state) {
    const group = {
        name,
        id,
        currentPosition,
        musicData,
        state,
        musics: []
    };
    groups.push(group);
    return group;
}

function getGroupDetail(name) {
    return groups.find(group => group.name === name)
}

function updateGroupDetail(groupDetail) {
    groups.forEach(group => {
        if (groupDetail.name == group.name) {
            groups[groups.indexOf(group)] = groupDetail;
        }
    })
}

function deleteGroup(name) {
    groups = groups.filter(group => group.name !== name);
}


module.exports = {
    createGroup,
    getGroupDetail,
    updateGroupDetail,
    deleteGroup,
}