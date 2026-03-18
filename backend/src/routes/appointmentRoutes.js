const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Tạo lịch hẹn mới (customer)
router.post('/', verifyToken, appointmentController.createAppointment);

// Lấy lịch hẹn của user (customer)
router.get('/my-bookings', verifyToken, appointmentController.getMyAppointments);

// Hủy lịch hẹn (customer)
router.put('/:id/cancel', verifyToken, appointmentController.cancelAppointment);

// Lấy tất cả lịch hẹn (admin)
router.get('/', verifyToken, verifyAdmin, appointmentController.getAllAppointments);

// Lấy lịch hẹn theo ID (admin)
router.get('/:id', verifyToken, appointmentController.getAppointmentById);

// Cập nhật trạng thái lịch hẹn (admin)
router.put('/:id/status', verifyToken, verifyAdmin, appointmentController.updateAppointmentStatus);

module.exports = router;
