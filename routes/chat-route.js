const express = require('express')
const fs = require('fs');
const path = require('path')

const router = express.Router()


router.post('/join', (req, res) => {
    const { room, name } = req.body;
    res.redirect(`/chat/join/${room}/${name}`)
})

router.get('/join/:room/:name', (req, res) => {
    const { room, name } = req.params;
    res.render('chat/join', {
        'pageTitle': `Joined Room ${room}`,
        'layout': 'room',
        'group': {
            'room': room,
            'name': name,
        },
    }, )
})


module.exports = router;