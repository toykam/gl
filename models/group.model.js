const mongoose = require('mongoose');
const { GroupSchema } = require('./model.schemas');

module.exports = mongoose.model("Group", GroupSchema);