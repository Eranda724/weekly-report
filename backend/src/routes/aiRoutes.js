const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { chat, summary } = require('../controllers/aiController');

router.post('/chat', requireAuth, requireRole('MANAGER', 'ADMIN'), chat);
router.get('/summary', requireAuth, requireRole('MANAGER', 'ADMIN'), summary);

module.exports = router;