const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { create, getOne, update, submit, listMine, review, listAll } = require('../controllers/reportController');

// Only team members create/edit/submit their own reports
router.post('/', requireAuth, requireRole('TEAM_MEMBER'), create);
router.put('/:id', requireAuth, requireRole('TEAM_MEMBER'), update);
router.post('/:id/submit', requireAuth, requireRole('TEAM_MEMBER'), submit);

// Viewing stays open to any authenticated user — role-aware filtering happens inside the service
router.get('/:id', requireAuth, getOne);
router.get('/', requireAuth, listMine);

// review and correction workflow
router.post('/:id/review', requireAuth, requireRole('MANAGER', 'ADMIN'), review);
router.get('/team/all', requireAuth, requireRole('MANAGER', 'ADMIN'), listAll);

module.exports = router;