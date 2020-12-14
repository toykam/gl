const bcrypt = require('bcrypt')

async function hashPassword(password) {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)

    return hash;
}

async function verifyPassword(password, hash) {
    // const salt = await bcrypt.genSalt()
    // const hash = await bcrypt.hash(password, salt)
    const verified = await bcrypt.compare(password, hash);

    return verified;
}

module.exports = {
    hashPassword,
    verifyPassword
}