const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, verifyAdminOrStaff } = require('../middleware/authMiddleware');
const {
  validateCreateAppointment,
  validateUpdateAppointmentStatus,
  validateAddReview,
  validateAppointmentId
} = require('../middleware/validationMiddleware');

// FIX 1: Add input validation to all appointment endpoints

// Customer
router.post('/', verifyToken, validateCreateAppointment, appointmentController.createAppointment);
router.get('/my-bookings', verifyToken, appointmentController.getMyAppointments);
router.put('/:id/cancel', verifyToken, validateAppointmentId, appointmentController.cancelAppointment);
router.put('/:id/review', verifyToken, validateAppointmentId, validateAddReview, appointmentController.addStaffReview);

// Admin + Staff
router.get('/', verifyToken, verifyAdminOrStaff, appointmentController.getAllAppointments);
router.get('/:id', verifyToken, verifyAdminOrStaff, validateAppointmentId, appointmentController.getAppointmentById);

// FIX 3: Staff can only update their own appointments (authorization check in controller)
router.put('/:id/status', verifyToken, verifyAdminOrStaff, validateAppointmentId, validateUpdateAppointmentStatus, appointmentController.updateAppointmentStatus);

module.exports = router;
