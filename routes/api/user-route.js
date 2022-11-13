const express = require('express');
const { Group, User } = require('../../models/connection');
const { GroupMemberModel } = require('../../models/model.schemas');
const { v4 } = require("uuid");
const { getUserDetail } = require('../../utils/users');
const prismaClient = require('../../prisma/prisma-client');

const router = express.Router();


router.post('/group', async (req, res) => {
    console.log(req.body)
    try {
        // var uid = myLocalStorage.getItem(USERDATAKEY);
        const session = req.session;
        var uid = session.userId;
        
        if (uid) {
            var user = await getUserDetail({'uid': uid})
            if (user) {
                const groupId = v4()
                const group = await prismaClient.$transaction(async (tx) => {
                    const group = await tx.group.create({
                        data: {
                            ownerId: uid,
                            name: req.body.name
                        }
                    })
                    const membership = await tx.groupMembership.create({
                        data: {
                            userId: uid,
                            groupId: group.id,
                            isAdmin: true,
                            canSwitchSong: true, 
                        }
                    })

                    const playstate = await tx.groupPlayState.create({
                        data: {
                            groupId: group.id,
                        }
                    })

                    return group;
                })
                if (group) {
                    res.json({status: true, message: 'Group created successfully', redirect: '/user/groups'})
                } else {
                    res.json({status: false, message: 'Unable to create group', redirect: ''})
                }
            } else {
                res.json({status: false, message: 'Access denied, login required', redirect: ''})
            }
        } else {
            res.json({status: false, message: 'session expired', redirect: '/auth/login'})
        }
    } catch (error) {
        res.json({status: false, message: `${error}`, redirect: '/auth/login'})
    }
})

router.get('/group', async (req, res) => {
    try {
        var uid = req.session['userId'];
        var user = await prismaClient.user.findFirst({
            where: {
                id: uid
            }, include: {
                groups: true
            }
        })
        // console.log(groups)
        res.json({
            status: true,
            data: {"groups": user.groups}
        })
    } catch(error) {
        res.json({
            status: false,
            message: error
        })
    }
})

router.post('/group/:id', async(req, res) => {
    try {
        // console.log(req.params.id);
        var uid = req.header('user_id')
        var group = await Group.findOneAndUpdate({'_id': req.params.id, 'owner_id': uid}, req.body, {upsert: true})
        
        res.json({
            status: true,
            data: {group},
            message: 'Group updated'
        })
    } catch(error) {
        res.json({
            status: false,
            message: error
        })
    }
})

router.post('/group/publish/:id', async(req, res) => {
    try {
        // console.log(req.params.id);
        var uid = req.session['userId']
        if (uid) {

            await prismaClient.group.updateMany({
                where: {
                    id: req.params.id,
                    ownerId: uid
                },
                data: {
                    published: true
                }
            })
            res.json({
                status: true,
                message: 'Group published'
            })
        } else {
            res.json({
                status: false,
                message: 'Access denied, login and try again'
            })
        }
    } catch(error) {
        console.log("Error :: ", error)
        res.json({
            status: false,
            message: error
        })
    }
})

router.post('/group/unpublish/:id', async(req, res) => {
    try {
        // console.log(req.params.id);
        var uid = req.session['userId']
        if (uid) {
            await prismaClient.group.updateMany({
                where: {
                    id: req.params.id,
                    ownerId: uid
                },
                data: {
                    published: false
                }
            })
            res.json({
                status: true,
                message: 'Group unpublished'
            })
        } else {
            res.json({
                status: false,
                message: 'Access denied, login and try again'
            })
        }
    } catch(error) {
        res.json({
            status: false,
            message: error
        })
    }
})

router.get('/api/logout', async (req, res) => {
    
})

module.exports = router;