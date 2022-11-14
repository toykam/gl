const mongoose = require('mongoose')

const connection = mongoose.connect('mongodb+srv://locals-admin:NEpL8mYY3A9akrSn@cluster.ofd6c.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (error) => {
    if (!error) {
        console.log('Database is running');
    } else {
        console.log('Database is not running')
    }
})

const User = require('./user.model')
const Group = require('./group.model')

module.exports = {
    connection,
    User,
    Group
}