const prisma = require('../config/prisma');

async function getAllProjects(user) {
    const where = { isActive: true };
    if (user && user.role === 'TEAM_MEMBER') {
        where.projectMembers = {
            some: {
                userId: user.id
            }
        };
    }

    const includeMembers = user && ['MANAGER', 'ADMIN'].includes(user.role);

    return prisma.project.findMany({
        where,
        orderBy: { name: 'asc' },
        ...(includeMembers && {
            include: {
                projectMembers: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true, isActive: true }
                        }
                    }
                }
            }
        })
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
    // Remove all project members first, then hard-delete the project
    await prisma.projectMember.deleteMany({ where: { projectId: id } });
    return prisma.project.delete({ where: { id } });
}

async function addProjectMember(projectId, userId, requestingUser) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');
    if (requestingUser.role === 'MANAGER' && ['MANAGER', 'ADMIN'].includes(targetUser.role)) {
        throw new Error('Forbidden: Managers cannot add Managers or Admins to projects');
    }
    return prisma.projectMember.create({
        data: { projectId, userId }
    });
}

async function removeProjectMember(projectId, userId, requestingUser) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');
    if (requestingUser.role === 'MANAGER' && ['MANAGER', 'ADMIN'].includes(targetUser.role)) {
        throw new Error('Forbidden: Managers cannot remove Managers or Admins from projects');
    }
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