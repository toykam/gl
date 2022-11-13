const express = require('express')

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth/login', {
        'pageTitle': 'Login'
    })
})
router.get('/register', (req, res) => {
    res.render('auth/register', {
        'pageTitle': 'Register'
    })
})

module.exports = router;