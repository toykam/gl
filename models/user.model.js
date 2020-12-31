const mongoose = require('mongoose');
const { UserSchema } = require('./model.schemas');

module.exports = mongoose.model("User", UserSchema);