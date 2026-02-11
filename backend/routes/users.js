const express = require('express');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFeed,
    getUser,
    listUsers,
    listCollaborators,
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/follow', auth, followUser);
router.delete('/:id/follow', auth, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/feed', auth, getFeed);
router.get('/collaborators', auth, listCollaborators);
router.get('/', listUsers);
router.get('/:id', auth, getUser);

module.exports = router;
