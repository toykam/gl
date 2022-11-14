const mongoose = require('mongoose');

const MusicDataSchema = new mongoose.Schema({
    name: { type: String, required: "Required" },
    url: { type: String, required: "Required" },
    image: { type: String, default: "" },
})

const UserSchema = new mongoose.Schema({
    name: { type: String, required: "Required" },
    username: { type: String, },
    email: { type: String, required: 'Required' },
    password: { type: String, required: 'Required' },
    phoneNumber: {type: String, required: false},
    imageUrl: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Youth_Group_2005.jpg/220px-Youth_Group_2005.jpg' },
    userType: { type: String, default: 'basic' },
    playList: { type: [MusicDataSchema], default: [] },
    joinedAt: { type: Date, default: Date.now()},
    updatedAt: { type: Date, default: Date.now()}
})

const GroupMemberSchema = new mongoose.Schema({
    user: { type: UserSchema, required: true },
    canTalk: { type: Boolean, default: false },
    canSwitchMusic: { type: Boolean, default: false },
    type: { type: String, default: 'member' },
    groupId: { type: String, required: true }
})

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: "Required" },
    members: { type: [GroupMemberSchema], default: [] },
    owner_id: { type: String },
    imageUrl: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Youth_Group_2005.jpg/220px-Youth_Group_2005.jpg' },
    max_member: { type: Number, default: 5 },
    strict: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    type: {type: String, default: 'public' },
    id: {type: String, required: true },
    musics: { type: [MusicDataSchema], default: null },
    musicData: { type: MusicDataSchema, default: null },
    joinedAt: { type: Date, default: Date.now()},
    updatedAt: { type: Date, default: Date.now()}
})


const GroupMemberModel = mongoose.model("GroupMemberModel", GroupMemberSchema);
const MusicDataModel = mongoose.model("MusicDataModel", MusicDataSchema);
const GroupModel = mongoose.model("GroupModel", GroupSchema);
const UserModel = mongoose.model("UserModel", UserSchema);

module.exports = {
    GroupModel, UserModel, MusicDataModel, GroupMemberModel
}