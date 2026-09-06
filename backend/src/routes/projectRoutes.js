const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { list, create, update, remove, addMember, removeMember } = require('../controllers/projectController');

// Any logged-in user can view projects (needed for the report form dropdown)
router.get('/', requireAuth, list);

// Only admins can modify projects
router.post('/', requireAuth, requireRole('ADMIN'), create);
router.put('/:id', requireAuth, requireRole('ADMIN'), update);
router.delete('/:id', requireAuth, requireRole('ADMIN'), remove);

// Team members endpoints (Admin only manages members)
router.post('/:id/members', requireAuth, requireRole('ADMIN'), addMember);
router.delete('/:id/members/:userId', requireAuth, requireRole('ADMIN'), removeMember);

module.exports = router;