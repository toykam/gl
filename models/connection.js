const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://hacktor-chat-admin:hacktor-chat-admin-12345@hactor-chat-app.vzhwk.mongodb.net/hacktor-chat-app?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (error) => {
    if (!error) {
        console.log('Database is running');
    } else {
        console.log('Database is not running')
    }
})

const User = require('./user.model')
const Group = require('./group.model')

module.exports = {
    mongoose,
    User,
    Group
}