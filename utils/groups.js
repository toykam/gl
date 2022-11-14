
const { Group } = require("../models/connection");
const { GroupMemberModel } = require("../models/model.schemas");
const prismaClient = require("../prisma/prisma-client");
const redisClient = require("./redis-client");
var groupPlayState = [];
// function to joinGroup
async function joinGroup({uid, gid}) {
    // get group members
    console.log("UID ", uid, " GroupId ", gid);
    var membership = await prismaClient.groupMembership.findFirst({
        where: {
            groupId: gid, userId: uid
        }
    })
    console.log("CheckingForMenbership ::: ", membership);
    if (membership == null) {
        console.log("Not a member");
        await prismaClient.groupMembership.create({
            data: {
                userId: uid, groupId: gid,
                isAdmin: false, canSwitchSong: false
            }
        })
    }
    return await getGroupDetail({groupId: gid});
}
// function to leaveGroup
async function leaveGroup ({membershipId}) {
    
    const memberShip = await prismaClient.groupMembership.delete({
        where: {
            id: membershipId
        }
    })

    return await getGroupDetail({groupId: memberShip.groupId});
}
// function to changeGroupAdmin
// async function swapGroupAdmin({group, user}) {
//     await prismaClient.groupMembership.update({
//         where: {
//             id: 
//         },
//         data: {
//             isAdmin: true
//         }
//     })
//     return await getGroupDetail({groupId: group._id})
// }
async function swapGroupAdmin2({membershipId}) {
    const memberShip = await prismaClient.groupMembership.update({
        where: {
            id: membershipId
        },
        data: {
            isAdmin: true
        }
    })
    return await getGroupDetail({groupId: memberShip.groupId})
}
// function to get group detail
async function getGroupDetail({groupId}) {

    // redisClient.get(`group_detail_${groupId}`, )
    const group = await prismaClient.group.findFirst({
        where: { id: groupId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            name: true, imageUrl: true, id: true
                        }
                    }
                }
            },
            owner: {
                select: {
                    name: true, imageUrl: true
                }
            },
            playState: {
                include: {
                    musicData: true
                }
            }
        }
    });
    // console.log("GroupDetail ::: ", group);
    return group;
}
// function to return group admins
async function getGroupAdmin({groupId}) {
    const admin = await prismaClient.groupMembership.findFirst({
        where: {
            groupId: groupId, 
            isAdmin: true
        }
    })
    return admin;
}
// function to return group members
async function getGroupMembers({groupId}) {
    const members = await prismaClient.groupMembership.findMany({
        where: {
            groupId: groupId, 
            isAdmin: false
        }
    })
    return members;
}
// function to check if user is an admin
// function to return group members
async function checkIfIsGroupAdmin({groupId, userId}) {
    const members = await prismaClient.groupMembership.findFirst({
        where: {
            groupId: groupId, 
            userId: userId,
            isAdmin: true
        }
    })
    return members != null ? true : false;
}

async function getPublishedGroups() {
    return await prismaClient.group.findMany({
        where: {
            published: true
        },
        include: {
            members: true
        }
    })
}

async function getUsersGroups(uid) {
    return await prismaClient.group.findMany({
        where: {
            ownerId: uid
        },
        include: {
            members: true
        }
    })
}

// async getUserMembership(uid, gid) {

// }

module.exports = {
    joinGroup, getGroupDetail, swapGroupAdmin2, leaveGroup, checkIfIsGroupAdmin, getGroupAdmin, getGroupMembers,
    getPublishedGroups, getUsersGroups,
    groupPlayState
}