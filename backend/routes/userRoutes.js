const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole('Admin'), userController.createUser);
router.get('/', verifyToken, requireRole('Admin'), userController.getUsers);
router.put('/:id', verifyToken, requireRole('Admin'), userController.updateUser);
router.patch('/:id/deactivate', verifyToken, requireRole('Admin'), userController.deactivateUser);

module.exports = router;