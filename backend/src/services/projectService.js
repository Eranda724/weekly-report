const prisma = require('../config/prisma');

async function getAllProjects(user) {
    const where = { isActive: true };
    if (user && user.role !== 'ADMIN') {
        where.projectMembers = {
            some: {
                userId: user.id
            }
        };
    }

    return prisma.project.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
            projectMembers: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true, isActive: true }
                    }
                }
            }
        }
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

async function addProjectMember(projectId, userId) {
    return prisma.projectMember.create({
        data: { projectId, userId }
    });
}

async function removeProjectMember(projectId, userId) {
    return prisma.projectMember.delete({
        where: {
            projectId_userId: { projectId, userId }
        }
    });
}

module.exports = { 
    getAllProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    addProjectMember,
    removeProjectMember
};