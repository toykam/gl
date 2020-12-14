const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: "Required" },
    username: { type: String, },
    email: { type: String, required: 'Required' },
    password: { type: String, required: 'Required' },
})



module.exports = mongoose.model("User", UserSchema);