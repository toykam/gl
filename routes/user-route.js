const express = require('express')

const router = express.Router();

router.get('/', (req, res) => {
    // req.session = 'hell'
    res.send(req.session)
})

module.exports = router;