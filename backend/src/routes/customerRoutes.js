const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, verifyAdminOrStaff } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdminOrStaff, customerController.getAllCustomers);
router.post('/', verifyToken, verifyAdminOrStaff, customerController.createCustomer);
router.put('/:id', verifyToken, verifyAdminOrStaff, customerController.updateCustomer);

module.exports = router;
