const {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../services/categoryService');

async function list(req, res) {
    try {
        res.json(await listCategories());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const name = req.body.name?.trim();
        if (!name) return res.status(400).json({ error: 'name is required' });
        res.status(201).json(await createCategory(name));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const name = req.body.name?.trim();
        if (!name) return res.status(400).json({ error: 'name is required' });
        res.json(await updateCategory(req.params.id, name));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function remove(req, res) {
    try {
        await deleteCategory(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { list, create, update, remove };