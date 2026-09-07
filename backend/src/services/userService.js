const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function listUsers() {
    return prisma.user.findMany({
        where: { role: 'TEAM_MEMBER', isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true },
        orderBy: { name: 'asc' },
    });
}

async function listAllUsersForAdmin() {
    return prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
}

async function createUserByAdmin({ name, email, password, role }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
}

async function updateUserRole(userId, role) {
    return prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
}

async function deactivateUser(userId) {
    return prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
}

async function reactivateUser(userId) {
    return prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
}

module.exports = {
    listUsers,
    listAllUsersForAdmin,
    createUserByAdmin,
    updateUserRole,
    deactivateUser,
    reactivateUser,
};