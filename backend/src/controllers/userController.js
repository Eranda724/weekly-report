const {
    listUsers, listAllUsersForAdmin, createUserByAdmin,
    updateUserRole, deactivateUser, reactivateUser,
} = require('../services/userService');

async function list(req, res) {
    try {
        const users = await listUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function listAllForAdmin(req, res) {
    try {
        const users = await listAllUsersForAdmin();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'name, email, password, and role are required' });
        }
        if (!['TEAM_MEMBER', 'MANAGER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await createUserByAdmin({ name, email, password, role });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function updateRole(req, res) {
    try {
        const { role } = req.body;
        if (!['TEAM_MEMBER', 'MANAGER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await updateUserRole(req.params.id, role);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deactivate(req, res) {
    try {
        const user = await deactivateUser(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function reactivate(req, res) {
    try {
        const user = await reactivateUser(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { list, listAllForAdmin, create, updateRole, deactivate, reactivate };