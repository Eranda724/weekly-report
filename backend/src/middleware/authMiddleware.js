const { verifyToken } = require('../config/jwt');
const prisma = require('../config/prisma');

function getCookieToken(cookieHeader) {
    const cookie = cookieHeader?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('weekly_report_session='));
    return cookie?.slice('weekly_report_session='.length);
}

async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = getCookieToken(req.headers.cookie)
        || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = verifyToken(token);
        const session = await prisma.session.findUnique({ where: { id: decoded.jti } });
        if (!session || session.revokedAt || session.expiresAt <= new Date() || session.userId !== decoded.id) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = decoded; // { id, role, email }
        req.sessionId = decoded.jti;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { requireAuth };