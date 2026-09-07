const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { generateToken } = require('../config/jwt');

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function createSession(user) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.create({ data: { id: sessionId, userId: user.id, expiresAt } });
    return { token: generateToken(user, sessionId), expiresAt };
}

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

    const session = await createSession(user);
    return { ...session, user: sanitizeUser(user) };
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

    const session = await createSession(user);
    return { ...session, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

async function revokeSession(sessionId) {
    if (!sessionId) return;
    await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

module.exports = { registerUser, loginUser, revokeSession };