const express = require('express');
const { Group, User } = require('../../models/connection');
const groupModel = require('../../models/group.model');
const { GroupMemberSchema, GroupMemberModel } = require('../../models/model.schemas');
const { USERDATAKEY } = require('../../utils/constants');
const myLocalStorage = require('../../utils/localStorage');

const router = express.Router();

// router.post('/create', async(req, res) => {

// })

router.post('/group', async (req, res) => {
    console.log(req.body)
    try {
        // var uid = myLocalStorage.getItem(USERDATAKEY);
        var uid = req.header('user_id')
        if (uid) {
            var group = new Group();
            var groupMember = new GroupMemberModel();
            // GroupMember
            groupMember.user = await User.findOne({'_id': uid})
            groupMember.type = 'admin'

            group.name = req.body.name;
            group.owner_id = uid;
            group.members = [groupMember]
            if (group.save()) {
                res.json({status: true, msg: 'Group created successfully', redirect: '/user/groups'})
            } else {
                res.json({status: false, msg: 'Unable to create group', redirect: ''})
            }
        } else {
            res.json({status: false, msg: 'session expired', redirect: '/auth/login'})
        }
    } catch (error) {
        res.json({status: false, msg: `${error}`, redirect: '/auth/login'})
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
            msg: error
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
            msg: 'Group updated'
        })
    } catch(error) {
        res.json({
            status: false,
            msg: error
        })
    }
})

module.exports = router;