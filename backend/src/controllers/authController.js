const { registerUser, loginUser, revokeSession } = require('../services/authService');

const COOKIE_NAME = 'weekly_report_session';
const COOKIE_OPTIONS = [
    'HttpOnly',
    'Path=/',
    `SameSite=${process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
].join('; ');

function setSessionCookie(res, token, expiresAt) {
    const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Max-Age=${maxAge}; ${COOKIE_OPTIONS}`);
}

function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; ${COOKIE_OPTIONS}`);
}

async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email, and password are required' });
        }
        const result = await registerUser({ name, email, password });
        setSessionCookie(res, result.token, result.expiresAt);
        res.status(201).json({ user: result.user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }
        const result = await loginUser({ email, password });
        setSessionCookie(res, result.token, result.expiresAt);
        res.json({ user: result.user });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

async function logout(req, res) {
    await revokeSession(req.sessionId);
    clearSessionCookie(res);
    res.status(204).send();
}

module.exports = { register, login, logout };