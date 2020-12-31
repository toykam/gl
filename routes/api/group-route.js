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


router.get('/:id', async(req, res) => {
    try {
        // console.log(req.params.id);
        var group = await Group.find({'_id': req.params.id})
        // console.log(groups)
        res.json({
            status: true,
            data: {group}
        })
    } catch(error) {
        res.json({
            status: false,
            msg: error
        })
    }
})

module.exports = router;