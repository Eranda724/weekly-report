const {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember
} = require('../services/projectService');

async function list(req, res) {
    try {
        const projects = await getAllProjects(req.user);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const project = await createProject({ name });
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const project = await updateProject(req.params.id, { name });
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function remove(req, res) {
    try {
        await deleteProject(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function addMember(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        const member = await addProjectMember(req.params.id, userId);
        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function removeMember(req, res) {
    try {
        const { userId } = req.params;
        await removeProjectMember(req.params.id, userId);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { list, create, update, remove, addMember, removeMember };