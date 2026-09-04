const { listUsers } = require('../services/userService');

async function list(req, res) {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { list };