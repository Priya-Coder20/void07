const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');

router.post('/login', loginUser);
router.get('/me', require('../middleware/authMiddleware').protect, require('../controllers/authController').getMe);

module.exports = router;
