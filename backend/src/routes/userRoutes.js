const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
    list, listAllForAdmin, create, updateRole, deactivate, reactivate,
} = require('../controllers/userController');

router.get('/', requireAuth, requireRole('MANAGER', 'ADMIN'), list);
router.get('/admin/all', requireAuth, requireRole('ADMIN'), listAllForAdmin);
router.post('/admin/create', requireAuth, requireRole('ADMIN'), create);
router.put('/admin/:id/role', requireAuth, requireRole('ADMIN'), updateRole);
router.put('/admin/:id/deactivate', requireAuth, requireRole('ADMIN'), deactivate);
router.put('/admin/:id/reactivate', requireAuth, requireRole('ADMIN'), reactivate);

module.exports = router;