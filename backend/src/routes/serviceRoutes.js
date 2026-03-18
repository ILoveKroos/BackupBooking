const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Lấy tất cả dịch vụ (public)
router.get('/', serviceController.getAllServices);

// Lấy dịch vụ theo ID (public)
router.get('/:id', serviceController.getServiceById);

// Tạo dịch vụ mới (admin)
router.post('/', verifyToken, verifyAdmin, serviceController.createService);

// Cập nhật dịch vụ (admin)
router.put('/:id', verifyToken, verifyAdmin, serviceController.updateService);

// Xóa dịch vụ (admin)
router.delete('/:id', verifyToken, verifyAdmin, serviceController.deleteService);

module.exports = router;
