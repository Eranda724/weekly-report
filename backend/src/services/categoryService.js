const prisma = require('../config/prisma');

async function listCategories() {
    return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });
}

async function createCategory(name) {
    return prisma.category.create({ data: { name: name.trim() } });
}

async function updateCategory(id, name) {
    return prisma.category.update({ where: { id }, data: { name: name.trim() } });
}

async function deleteCategory(id) {
    return prisma.category.update({ where: { id }, data: { isActive: false } });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };