const express = require('express');
const {
    reportContent,
    blockUser,
    unblockUser,
    getBlockedUsers,
} = require('../controllers/moderationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/report', auth, reportContent);
router.post('/block/:id', auth, blockUser);
router.delete('/block/:id', auth, unblockUser);
router.get('/blocked', auth, getBlockedUsers);

module.exports = router;
