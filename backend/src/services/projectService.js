const prisma = require('../config/prisma');

async function getAllProjects() {
    return prisma.project.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });
}

async function createProject({ name }) {
    return prisma.project.create({ data: { name } });
}

async function updateProject(id, { name }) {
    return prisma.project.update({
        where: { id },
        data: { name },
    });
}

async function deleteProject(id) {
    // Soft delete — keeps history intact for reports that reference it
    return prisma.project.update({
        where: { id },
        data: { isActive: false },
    });
}

module.exports = { getAllProjects, createProject, updateProject, deleteProject };