const express = require('express');
const router = express.Router();
const { createContent, getContent } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'staff'), createContent)
    .get(protect, getContent);

module.exports = router;
