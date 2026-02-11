const express = require('express');
const {
    promoteUser,
    demoteUser,
    banUser,
    unbanUser,
    deleteUser,
    deleteImage,
    getSystemStats,
    listAllUsers,
    listReports,
    dismissReport,
} = require('../controllers/adminController');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Super Admin Only
router.post('/promote/:id', authorizeRoles('super_admin'), promoteUser);
router.post('/demote/:id', authorizeRoles('super_admin'), demoteUser);
router.delete('/users/:id', authorizeRoles('super_admin'), deleteUser);

// Admin & Super Admin
router.get('/stats', authorizeRoles('admin', 'super_admin'), getSystemStats);
router.get('/users', authorizeRoles('admin', 'super_admin'), listAllUsers);
router.post('/ban/:id', authorizeRoles('admin', 'super_admin'), banUser);
router.post('/unban/:id', authorizeRoles('admin', 'super_admin'), unbanUser);
router.delete('/photos/:id', authorizeRoles('admin', 'super_admin'), deleteImage);

// Reports
router.get('/reports', authorizeRoles('admin', 'super_admin'), listReports);
router.post('/reports/:id/dismiss', authorizeRoles('admin', 'super_admin'), dismissReport);

module.exports = router;
