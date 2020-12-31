const express = require('express');
const { Group } = require('../../models/connection');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        var groups = await Group.find({'type': 'public'})
        // console.log(groups)
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


router.get('/:id', (req, res) => {
    res.render('auth/register', {
        'pageTitle': 'Register'
    })
})

module.exports = router;