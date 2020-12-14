const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: "Required" },
    members: { type: Array, required: "Required" },
    users_id: { type: String },
})

module.exports = mongoose.model("Group", GroupSchema);;