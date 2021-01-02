const express = require('express');
const { Group, User } = require('../../models/connection');
const groupModel = require('../../models/group.model');
const { GroupMemberSchema, GroupMemberModel } = require('../../models/model.schemas');
const { USERDATAKEY } = require('../../utils/constants');
const myLocalStorage = require('../../utils/localStorage');

const router = express.Router();


router.post('/group', async (req, res) => {
    console.log(req.body)
    try {
        // var uid = myLocalStorage.getItem(USERDATAKEY);
        var uid = req.header('user_id')
        if (uid) {
            var user = await User.findOne({'_id': uid})
            if (user) {

                var group = new Group();
                var groupMember = new GroupMemberModel();
                // GroupMember
                groupMember.user = user
                groupMember.type = 'admin'
                // if (req.body.name)
    
                group.name = req.body.name;
                group.owner_id = uid;
                group.members = [groupMember]
                if (group.save()) {
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
        var uid = req.header('user_id')
        var groups = await Group.find({'owner_id': uid})
        console.log(groups)
        res.json({
            status: true,
            data: {groups}
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
        var uid = req.header('user_id')
        
        var groupMember = new GroupMemberModel();
        // GroupMember
        groupMember.user = await User.findOne({'_id': uid}, 'name username _id imageUrl userType').exec();
        groupMember.type = 'admin'

        Group.findOneAndUpdate({'_id': req.params.id, 'owner_id': uid}, {'published': true, members: [groupMember]}, {upsert: true}, () => {
            res.json({
                status: true,
                message: 'Group published'
            })
        })
    } catch(error) {
        res.json({
            status: false,
            message: error
        })
    }
})

router.post('/group/unpublish/:id', async(req, res) => {
    try {
        // console.log(req.params.id);
        var uid = req.header('user_id')
        Group.findOneAndUpdate({'_id': req.params.id, 'owner_id': uid}, {'published': false, members: []}, {upsert: true}, () => {
            res.json({
                status: true,
                message: 'Group unpublished'
            })
        })
    } catch(error) {
        res.json({
            status: false,
            message: error
        })
    }
})

module.exports = router;