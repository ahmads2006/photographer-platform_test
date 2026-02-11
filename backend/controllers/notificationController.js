const asyncHandler = require('../utils/asyncHandler');
const { Notification } = require('../models');

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
    });
    res.json({ notifications });
});

const markRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ where: { id, userId } });
    if (notification) {
        notification.isRead = true;
        await notification.save();
    }

    res.json({ success: true });
});

module.exports = {
    getNotifications,
    markRead,
};
