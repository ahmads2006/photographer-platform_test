const express = require('express');
const {
    likePhoto,
    unlikePhoto,
    commentOnPhoto,
    favoritePhoto,
    unfavoritePhoto,
} = require('../controllers/interactionController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Merged into /api/photos/:id/... or similar?
// Usually endpoints are /api/photos/:id/like
// But I can define them here and mount at /api/interactions or extend photos route.
// Let's use /api/interactions for now, passing photoId in body or param?
// Better: Mount this router at /api/photos and use :id/like

router.post('/:id/like', auth, likePhoto);
router.delete('/:id/like', auth, unlikePhoto);
router.post('/:id/comments', auth, commentOnPhoto);
router.post('/:id/favorite', auth, favoritePhoto);
router.delete('/:id/favorite', auth, unfavoritePhoto);

module.exports = router;
