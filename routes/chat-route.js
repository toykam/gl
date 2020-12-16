const express = require('express')
const fs = require('fs');
const path = require('path')

const router = express.Router()


router.post('/join', (req, res) => {
    // var room = req.query
    const room = req.body.room;
    const name = req.body.name;
    // console.log(req.body.room);
    // res.send('I am here');
    res.render('chat/join', {
        'pageTitle': `Joined Room ${room}`,
        'layout': 'room',
        'group': {
            'room': room,
            'name': name,
        },
    }, )
})

// router.get('/join', (req, res) => {
//     // var room = req.query
//     const room = req.room.name;
//     const name = req.user.name;
//     // console.log(req.body.room);
//     // res.send('I am here');
//     res.render('chat/join', {
//         'pageTitle': `Joined Room ${room}`,
//         'layout': 'user_layout',
//         'group': {
//             'room': room,
//             'name': name,
//         },
//         helpers: {
//             json: (context) => {
//                 return JSON.stringify(context);
//             }
//         }
//     }, )
// })


module.exports = router;