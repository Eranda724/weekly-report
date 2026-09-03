const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/me', requireAuth, (req, res) => {
    res.json(req.user);
});
router.get('/admin/users', requireAuth, requireRole('ADMIN'), (req, res) => {
    res.json({ message: 'Admin route accessed' });
});

router.get('/manager-only-test', requireAuth, requireRole('MANAGER'), (req, res) => {
    res.json({ message: 'You are a manager, access granted' });
});

module.exports = router;