const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  listUsers,
} = require('../controllers/authController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getProfile);
router.patch('/me', auth, updateProfile);
router.get('/users', auth, authorizeRoles('admin', 'user', 'super_admin'), listUsers);

module.exports = router;
