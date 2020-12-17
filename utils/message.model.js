const moment = require("moment");
const uuid = require('uuid')

function formatMessage(username, message) {
    return {
        username,
        message,
        time: moment().format('h:mm a'),
        sender: username,
        _id: uuid.v4()
    };
}

module.exports = formatMessage