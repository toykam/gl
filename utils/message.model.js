const moment = require("moment");
const uuid = require('uuid')

function formatMessage(user, message) {
    return {
        text: message,
        createdAt: moment().format('h:mm a'),
        sender: user.name,
        _id: uuid.v4(),
        user: {
            _id: user.id, name: user.name
        }
    };
}

module.exports = formatMessage