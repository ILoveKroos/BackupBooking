const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy profile (yêu cầu xác thực)
router.get('/profile', verifyToken, authController.getProfile);

// Cập nhật profile (yêu cầu xác thực)
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
