const express = require('express');
const { hashPassword, verifyPassword } = require('../../utils/functions');
const User = require('./../../models/user.model')
const router = express.Router();

router.post('/login', async(req, res) => {
    try {
        var user = await User.findOne({ 'email': req.body.email });
        if (user) {
            var verified = await verifyPassword(req.body.password, user.password);
            if (verified) {
                res.json({ 'status': true, 'message': 'User login successful', 'data': user })
            } else {
                res.json({ 'status': false, 'message': 'Login detail not correct' })
            }
        } else {
            res.json({ 'status': false, 'message': 'Login failed' })
        }
    } catch (error) {
        res.json({ 'status': false, 'message': `Login error: ${error}` })
    }
})

router.post('/register', async(req, res) => {
    try {
        if (req.body.name == '' || req.body.email == '' || req.body.password == '') {
            res.send({ 'status': false, 'message': `All fields are required` });
        } else {
            var user = await User.findOne({ 'email': req.body.email });
            if (user) {
                res.json({ 'status': false, 'message': 'Email taken already, you might want to try another email...' });
            } else {
                var password = await hashPassword(req.body.password);
                var user = await User();
                user.email = req.body.email;
                user.name = req.body.name;
                user.username = req.body.username == null ? req.body.username : '';
                user.password = password;
                user.save();
                res.send({ 'status': true, 'message': `Hi ${req.body.name}, you are welcome to group listening. Your registration is successful.` })
            }
        }
    } catch (error) {
        res.send({ 'status': false, 'message': `${error}` });
    }
})

module.exports = router;