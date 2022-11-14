const moment = require("moment");
const uuid = require('uuid');
const { User } = require("../models/connection");
const { botName } = require("./constants");
const { getUserDetail } = require("./users");

async function formatMessage(uid, message) {
    var user;
    if (uid === 'bot-id') {
        user = {name: botName, id: 'bot-id'}
    } else {
        user = await getUserDetail({'uid': uid})
    }
    return {
        text: message,
        createdAt: moment().format('h:mm a'),
        sender: user.name,
        _id: uuid.v4(),
        user
    };
}

module.exports = formatMessage