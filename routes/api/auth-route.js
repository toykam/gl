const express = require('express');
const prismaClient = require('../../prisma/prisma-client');
const { USERDATAKEY, USERLOGGEDINKEY } = require('../../utils/constants');
const { hashPassword, verifyPassword } = require('../../utils/functions');
const myLocalStorage = require('../../utils/localStorage');
const User = require('./../../models/user.model')
const router = express.Router();

router.post('/login', async(req, res) => {
    try {
        var user = await prismaClient.user.findFirst({
            where: {
                email: req.body.email
            }
        });
        // var user = await User.findOne({ 'email': req.body.email });
        if (user) {
            var verified = await verifyPassword(req.body.password, user.password);
            if (verified) {
                var session = req.session;
                // myLocalStorage.setItem(USERDATAKEY, user.get('_id'));
                // myLocalStorage.setItem(USERLOGGEDINKEY, true);
                req.session.userId = user.id;
                session['userId'] = user.id;
                session['userName'] = user.name;
                // req.session.loggedIn
                const path = session['intendingPath'] || "/"
                console.log("IntentinfPath ::: ", path)
                res.json({ 'status': true, 'message': 'User login successful', 'data': user, 'redirect': path })
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
            var user = await prismaClient.user.findFirst({
                where: {
                    email: req.body.email
                }
            });
            // var user = await User.findOne({ 'email': req.body.email });
            if (user) {
                res.json({ 'status': false, 'message': 'Email taken already, you might want to try another email...' });
            } else {
                var password = await hashPassword(req.body.password);
                const user = await prismaClient.user.create({
                    data: {
                        email: req.body.email, 
                        name: req.body.name, 
                        userName: req.body.name,
                        password: password
                    }
                })
                res.send({ 'status': true, 'message': `Hi ${user.name}, you are welcome to group listening. Your registration is successful.`, 'redirect': "/" })
            }
        }
    } catch (error) {
        res.send({ 'status': false, 'message': `${error}` });
    }
})

module.exports = router;