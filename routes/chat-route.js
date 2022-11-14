const express = require('express')
const { Group, User } = require('../models/connection');
const { GroupMemberModel } = require('../models/model.schemas');
const { USERDATAKEY } = require('../utils/constants');
const { joinGroup, getGroupDetail } = require('../utils/groups');
const myLocalStorage = require('../utils/localStorage');

const router = express.Router()


router.post('/join', (req, res) => {
    const { room, name } = req.body;
    res.redirect(`/chat/join/${room}/${name}`)
})

router.get('/join/:room', async(req, res) => {
    try {
        // Check if user is logged in
        var uid = req.session['userId']
        var userName = req.session['userName']
        // var uid = myLocalStorage.getItem(USERDATAKEY)
        console.log("UserToJoinId ::: ", uid)

        console.log("ResLocals ::: ", res.locals)

        // get room id from url
        const { room } = req.params;
        // get group detail from database
        // console.log("GroupId ::: ", room);
        const group = await getGroupDetail({groupId: room});
        // console.log("GroupToJoinDetail ::: ", group)
        
        // joinGroup({
        //     userData: user, 
        //     groupData: group
        // })
        
        res.render('chat/join', {
            'pageTitle': `Joined Room ${group.name}`,
            'layout': 'room',
            'group': {
                'room': room,
                'name': group.name,
                'userName': userName
            },
        }, )
    } catch (error) {
        console.log(error)
        res.redirect('/group/join')
    }
})


module.exports = router;