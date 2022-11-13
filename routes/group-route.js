const express = require('express')
const { Group } = require('../models/connection');
const { getGroupDetail, getPublishedGroups } = require('../utils/groups');

const router = express.Router();

router.get('/join', async(req, res) => {
    var groups = await getPublishedGroups()
    res.render('group/join', {
        'pageTitle': 'Join a Room',
        groups: groups.map(group => group)
    })
})


module.exports = router;