var users = [];

const { User } = require("../models/connection");
const prismaClient = require("../prisma/prisma-client");

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
    users = users.filter(user => user.id !== id);
}

function updateUserDetail(userDetail) {
    users.forEach(user => {
        if (userDetail.name == user.name) {
            users[users.indexOf(user)] = userDetail;
        }
    })
}

// function to get user detail
async function getUserDetail({uid}) {
    var user = await prismaClient.user.findFirst({
        where: {
            id: uid
        }
    });
    return user == null ? null : user;
}

async function getUserDetailByEmail(email) {
    var user = await prismaClient.user.findFirst({
        where: {
            email: email
        }
    });
    return user == null ? null : user;
}
// function to update user detail
async function updateUserDetail({uid, update}) {
    var user = await prismaClient.user.update({
        where: {
            id: uid
        }, data: {
            ...update
        }
    });
    return user == null ? null : user;
}

module.exports = {
    getUserDetail, updateUserDetail, getCurrentUser, userJoin, userLeavesChat, getRoomUser
}