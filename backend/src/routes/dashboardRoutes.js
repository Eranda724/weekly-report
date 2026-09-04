const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { metrics } = require('../controllers/dashboardController');

router.get('/metrics', requireAuth, requireRole('MANAGER', 'ADMIN'), metrics);

module.exports = router;