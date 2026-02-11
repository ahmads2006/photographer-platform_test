const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { Message, Group, Album, GroupMember, AlbumMember, User } = require('../models');
const { mapMessage } = require('../utils/mappers');

const messageInclude = [
  { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] },
];

const assertMessageTarget = async ({ chatType, recipient, group, album, userId }) => {
  if (chatType === 'private') {
    if (!recipient) throw new ApiError(400, 'recipient is required for private chat.');
    return;
  }

  if (chatType === 'group') {
    if (!group) throw new ApiError(400, 'group is required for group chat.');

    const exists = await Group.findByPk(group);
    if (!exists) throw new ApiError(404, 'Group not found.');

    const member = await GroupMember.findOne({ where: { groupId: group, userId } });
    if (!member) throw new ApiError(403, 'Not a member of this group.');
    return;
  }

  if (chatType === 'album') {
    if (!album) throw new ApiError(400, 'album is required for album chat.');

    const exists = await Album.findByPk(album);
    if (!exists) throw new ApiError(404, 'Album not found.');

    const member = await AlbumMember.findOne({ where: { albumId: album, userId } });
    if (!member) throw new ApiError(403, 'Not a member of this album.');
    return;
  }

  throw new ApiError(400, 'Invalid chatType.');
};

const sendMessage = asyncHandler(async (req, res) => {
  const { chatType, recipient = null, group = null, album = null, content } = req.body;

  if (!content || !chatType) {
    throw new ApiError(400, 'chatType and content are required.');
  }

  await assertMessageTarget({
    chatType,
    recipient: recipient ? Number(recipient) : null,
    group: group ? Number(group) : null,
    album: album ? Number(album) : null,
    userId: req.user.id,
  });

  const created = await Message.create({
    senderId: req.user.id,
    chatType,
    recipientId: recipient ? Number(recipient) : null,
    groupId: group ? Number(group) : null,
    albumId: album ? Number(album) : null,
    content,
  });

  const message = await Message.findByPk(created.id, { include: messageInclude });
  res.status(201).json({ message: mapMessage(message) });
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatType, recipient, group, album, page = 1, limit = 50 } = req.query;

  if (!chatType) throw new ApiError(400, 'chatType is required.');

  const where = { chatType };

  if (chatType === 'private') {
    if (!recipient) throw new ApiError(400, 'recipient is required.');
    const recipientId = Number(recipient);

    where[Op.or] = [
      { senderId: req.user.id, recipientId },
      { senderId: recipientId, recipientId: req.user.id },
    ];
  }

  if (chatType === 'group') {
    if (!group) throw new ApiError(400, 'group is required.');
    const groupId = Number(group);
    await assertMessageTarget({ chatType, group: groupId, userId: req.user.id });
    where.groupId = groupId;
  }

  if (chatType === 'album') {
    if (!album) throw new ApiError(400, 'album is required.');
    const albumId = Number(album);
    await assertMessageTarget({ chatType, album: albumId, userId: req.user.id });
    where.albumId = albumId;
  }

  const safeLimit = Math.min(Number(limit) || 50, 200);

  const messages = await Message.findAll({
    where,
    include: messageInclude,
    order: [['timestamp', 'ASC']],
    offset: (Number(page) - 1) * safeLimit,
    limit: safeLimit,
  });

  const total = await Message.count({ where });

  res.json({
    messages: messages.map(mapMessage),
    pagination: { page: Number(page), limit: safeLimit, total },
  });
});

module.exports = {
  sendMessage,
  getMessages,
};
