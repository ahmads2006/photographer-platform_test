const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { User, Follow, Photo } = require('../models');

const { mapUser } = require('../utils/mappers');

const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'avatar', 'role', 'reputationPoints', 'createdAt']
    });

    if (!user) throw new ApiError(404, "User not found.");

    // stats
    const followersCount = await Follow.count({ where: { followingId: id } });
    const followingCount = await Follow.count({ where: { followerId: id } });

    let isFollowing = false;
    if (currentUserId) {
        const follow = await Follow.findOne({ where: { followerId: currentUserId, followingId: id } });
        isFollowing = !!follow;
    }

    res.json({
        user: mapUser(user),
        followersCount,
        followingCount,
        isFollowing
    });
});

const listUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'avatar', 'role', 'reputationPoints'],
        limit: 50
    });
    res.json({ users: users.map(mapUser) });
});

const followUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const followerId = req.user.id;
    const followingId = Number(id);

    if (followerId === followingId) {
        throw new ApiError(400, "You cannot follow yourself.");
    }

    const targetUser = await User.findByPk(followingId);
    if (!targetUser) {
        throw new ApiError(404, "User not found.");
    }

    const existing = await Follow.findOne({
        where: { followerId, followingId },
    });

    if (existing) {
        return res.status(200).json({ message: "Already following." });
    }

    await Follow.create({ followerId, followingId });
    // TODO: Trigger notification
    res.status(200).json({ message: "Followed successfully." });
});

const unfollowUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const followerId = req.user.id;
    const followingId = Number(id);

    const deleted = await Follow.destroy({
        where: { followerId, followingId },
    });

    if (!deleted) {
        return res.status(400).json({ message: "Not following this user." });
    }

    res.status(200).json({ message: "Unfollowed successfully." });
});

const getFollowers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id, {
        include: [{
            model: User,
            as: 'Followers',
            attributes: ['id', 'name', 'email', 'avatar'],
            through: { attributes: [] }
        }]
    });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    res.json({ followers: user.Followers });
});

const getFeed = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
        include: [{
            model: User,
            as: 'Following',
            attributes: ['id'],
            through: { attributes: [] }
        }]
    });

    const followingIds = user.Following.map(u => u.id);

    const photos = await Photo.findAll({
        where: {
            ownerId: followingIds,
            visibility: 'public' // Assuming feed only shows public photos
        },
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'avatar'] }],
        order: [['createdAt', 'DESC']],
        limit: 50
    });

    res.json({ photos });
});

const getFollowing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id, {
        include: [{
            model: User,
            as: 'Following',
            attributes: ['id', 'name', 'email', 'avatar'],
            through: { attributes: [] }
        }]
    });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    res.json({ following: user.Following });
});

const listCollaborators = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get IDs of users already followed
    const following = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Exclude self

    const users = await User.findAll({
        where: {
            id: { [require('sequelize').Op.notIn]: followingIds },
            role: { [require('sequelize').Op.ne]: 'super_admin' } // Optional: exclude super_admin if desired, but user didn't ask
        },
        attributes: ['id', 'name', 'avatar'],
        order: require('sequelize').literal('RAND()'),
        limit: 5
    });

    res.json({ users: users.map(mapUser) });
});

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFeed,
    listCollaborators,
    getUser,
    listUsers,
};
