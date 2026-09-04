const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { list } = require('../controllers/userController');

router.get('/', requireAuth, requireRole('MANAGER', 'ADMIN'), list);

module.exports = router;