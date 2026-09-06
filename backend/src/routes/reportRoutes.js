const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { create, getOne, update, submit, listMine, review, listAll } = require('../controllers/reportController');

// Only team members create/edit/submit their own reports
router.post('/', requireAuth, requireRole('TEAM_MEMBER'), create);
router.put('/:id', requireAuth, requireRole('TEAM_MEMBER'), update);
router.post('/:id/submit', requireAuth, requireRole('TEAM_MEMBER'), submit);

// Static routes 
router.get('/team/all', requireAuth, requireRole('MANAGER', 'ADMIN'), listAll);
router.get('/', requireAuth, listMine);

// Dynamic param routes below all static paths
router.get('/:id', requireAuth, getOne);

// review and correction workflow
router.post('/:id/review', requireAuth, requireRole('MANAGER', 'ADMIN'), review);

module.exports = router;