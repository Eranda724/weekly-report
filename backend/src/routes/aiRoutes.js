const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { chat, summary } = require('../controllers/aiController');

// All authenticated users can access AI (role-based context logic is in the service)
router.post('/chat', requireAuth, chat);
router.get('/summary', requireAuth, summary);

module.exports = router;