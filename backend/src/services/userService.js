const prisma = require('../config/prisma');

async function listUsers() {
    return prisma.user.findMany({
        where: { role: 'TEAM_MEMBER', isActive: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
    });
}

module.exports = { listUsers };