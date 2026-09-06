const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { generateToken } = require('../config/jwt');

async function registerUser({ name, email, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: 'TEAM_MEMBER',
        },
    });

    const token = generateToken(user);
    return { token, user: sanitizeUser(user) };
}

async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    return { token, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

module.exports = { registerUser, loginUser };