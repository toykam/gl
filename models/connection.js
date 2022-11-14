const mongoose = require('mongoose')

const connection = mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (error) => {
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