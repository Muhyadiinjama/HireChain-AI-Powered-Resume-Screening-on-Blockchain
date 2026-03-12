const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, registerNoAuth } = require('../controllers/authController');
router.post('/register-noauth', registerNoAuth);
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);

module.exports = router;
