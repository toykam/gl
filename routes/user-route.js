const express = require('express');
const { Group, User } = require('../models/connection');
const { USERDATAKEY } = require('../utils/constants');
const myLocalStorage = require('../utils/localStorage');
const router = express.Router();


router.get('/', async(req, res) => {
    res.render('user/dashboard', {
        layout: 'user_layout',
        user: req.user, pageTitle: 'Dashboard'
    })
})

router.get('/groups', async (req, res) => {
    var uid = myLocalStorage.getItem(USERDATAKEY)
    // console.log(user)
    var groups = await Group.find({'owner_id': uid})
    // console.log(groups)
    res.render('user/groups', {
        layout: 'user_layout',
        user: req.user, pageTitle: 'My Groups',
        groups: groups.map(group => group.toJSON()), groupLength: groups.length
    })
})

module.exports = router;