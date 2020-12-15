const express = require('express')

const router = express.Router();

router.get('/join', (req, res) => {
    res.render('group/join', {
        'pageTitle': 'Join a Room'
    })
})


module.exports = router;