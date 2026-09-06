const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { list, create, update, remove, addMember, removeMember } = require('../controllers/projectController');

// Any logged-in user can view projects (needed for the report form dropdown)
router.get('/', requireAuth, list);

// Managers and Admins can modify projects
router.post('/', requireAuth, requireRole('MANAGER', 'ADMIN'), create);
router.put('/:id', requireAuth, requireRole('MANAGER', 'ADMIN'), update);
router.delete('/:id', requireAuth, requireRole('MANAGER', 'ADMIN'), remove);

// Team members endpoints
router.post('/:id/members', requireAuth, requireRole('MANAGER', 'ADMIN'), addMember);
router.delete('/:id/members/:userId', requireAuth, requireRole('MANAGER', 'ADMIN'), removeMember);

module.exports = router;