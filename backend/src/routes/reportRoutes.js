const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { create, getOne, update, submit, listMine } = require('../controllers/reportController');

router.post('/', requireAuth, create);
router.get('/:id', requireAuth, getOne);
router.put('/:id', requireAuth, update);
router.post('/:id/submit', requireAuth, submit);
router.get('/', requireAuth, listMine); // note: manager version comes in Phase 6

module.exports = router;