const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Report, UserBlock, User } = require('../models');

const reportContent = asyncHandler(async (req, res) => {
    const { targetId, targetType, reason, description } = req.body;
    const reporterId = req.user.id;

    if (!targetId || !targetType || !reason) {
        throw new ApiError(400, 'Target ID, type, and reason are required.');
    }

    await Report.create({
        reporterId,
        targetId,
        targetType,
        reason,
        description,
    });

    res.status(201).json({ message: 'Report submitted.' });
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blockerId = req.user.id;
    const blockedId = Number(id);

    if (blockerId === blockedId) {
        throw new ApiError(400, 'You cannot block yourself.');
    }

    await UserBlock.findOrCreate({
        where: { blockerId, blockedId },
    });

    res.status(200).json({ message: 'User blocked.' });
});

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blockerId = req.user.id;
    const blockedId = Number(id);

    await UserBlock.destroy({
        where: { blockerId, blockedId },
    });

    res.status(200).json({ message: 'User unblocked.' });
});

const getBlockedUsers = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: [{
            model: User,
            as: 'BlockedUsers',
            attributes: ['id', 'name', 'avatar'],
            through: { attributes: [] }
        }]
    });

    res.json({ blocked: user.BlockedUsers });
});

module.exports = {
    reportContent,
    blockUser,
    unblockUser,
    getBlockedUsers,
};
