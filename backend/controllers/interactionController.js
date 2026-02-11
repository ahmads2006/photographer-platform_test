const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Photo, Like, Comment, Favorite, Notification } = require('../models');

const likePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const photoId = Number(id);

    const photo = await Photo.findByPk(photoId);
    if (!photo) throw new ApiError(404, 'Photo not found.');

    const [like, created] = await Like.findOrCreate({
        where: { userId, photoId },
    });

    if (created && photo.ownerId !== userId) {
        await Notification.create({
            userId: photo.ownerId,
            type: 'like',
            referenceId: photoId,
            message: `${req.user.name} liked your photo.`
        });
    }

    res.status(200).json({ message: 'Liked.' });
});

const unlikePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const photoId = Number(id);

    await Like.destroy({ where: { userId, photoId } });
    res.status(200).json({ message: 'Unliked.' });
});

const commentOnPhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const photoId = Number(id);

    if (!content) throw new ApiError(400, 'Comment content is required.');

    const photo = await Photo.findByPk(photoId);
    if (!photo) throw new ApiError(404, 'Photo not found.');

    const comment = await Comment.create({ userId, photoId, content });

    if (photo.ownerId !== userId) {
        await Notification.create({
            userId: photo.ownerId,
            type: 'comment',
            referenceId: photoId,
            message: `${req.user.name} commented on your photo.`
        });
    }

    res.status(201).json({ comment });
});

const favoritePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const photoId = Number(id);

    await Favorite.findOrCreate({ where: { userId, photoId } });
    res.status(200).json({ message: 'Favorited.' });
});

const unfavoritePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const photoId = Number(id);

    await Favorite.destroy({ where: { userId, photoId } });
    res.status(200).json({ message: 'Unfavorited.' });
});

module.exports = {
    likePhoto,
    unlikePhoto,
    commentOnPhoto,
    favoritePhoto,
    unfavoritePhoto,
};
