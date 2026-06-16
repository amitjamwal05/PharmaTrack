const express = require('express');
const router = express.Router();
const {
  getActiveAnnouncements,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

// Publicly available to all logged in users
router.get('/active', protect, getActiveAnnouncements);

// Super admin only routes
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getAnnouncements)
  .post(createAnnouncement);

router.route('/:id')
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

module.exports = router;
