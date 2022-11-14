const express = require('express');
const { Group, User } = require('../models/connection');
const { USERDATAKEY, SES_NAME } = require('../utils/constants');
const { getPublishedGroups, getUsersGroups } = require('../utils/groups');
const myLocalStorage = require('../utils/localStorage');
const router = express.Router();

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.clearCookie(SES_NAME)
        req.session.userId = null;
        console.log(req.session)
        res.redirect('/')
    })
})


router.get('/', async(req, res) => {

    res.render('user/dashboard', {
        layout: 'user_layout',
        user: req.user, pageTitle: 'Dashboard'
    })

})

router.get('/groups', async (req, res) => {
    // var uid = myLocalStorage.getItem(USERDATAKEY)
    // var { user } = res.locals;
    // console.log("UserId ::: ", user)
    // console.log(user)
    var groups = await getUsersGroups(req.session['userId'])
    // console.log(groups)
    res.render('user/groups', {
        layout: 'user_layout',
        user: req.user, pageTitle: 'My Groups',
        groups: groups, groupLength: groups.length
    })
})

module.exports = router;