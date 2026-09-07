const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { list, create, update, remove } = require('../controllers/categoryController');

router.get('/', requireAuth, list);
router.post('/', requireAuth, requireRole('MANAGER', 'ADMIN'), create);
router.put('/:id', requireAuth, requireRole('MANAGER', 'ADMIN'), update);
router.delete('/:id', requireAuth, requireRole('MANAGER', 'ADMIN'), remove);

module.exports = router;