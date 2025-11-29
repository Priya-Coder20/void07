const express = require('express');
const router = express.Router();
const { createContent, getContent, updateContent, deleteContent } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'staff'), createContent)
    .get(protect, getContent);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateContent)
    .delete(protect, authorize('admin', 'staff'), deleteContent);

module.exports = router;
