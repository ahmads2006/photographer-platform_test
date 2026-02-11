const jwt = require('jsonwebtoken');
const { Message, Group, Album, GroupMember, AlbumMember, User } = require('../models');
const { mapMessage } = require('../utils/mappers');

const privateRoom = (userA, userB) => {
  const [a, b] = [String(userA), String(userB)].sort();
  return `private:${a}:${b}`;
};

const registerChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = Number(decoded.id);
      return next();
    } catch (_error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('chat:join', async (payload) => {
      const { chatType, targetId } = payload || {};
      const id = Number(targetId);
      if (!chatType || !id) return;

      if (chatType === 'private') {
        socket.join(privateRoom(socket.userId, id));
        return;
      }

      if (chatType === 'group') {
        const group = await Group.findByPk(id);
        if (!group) return;

        const member = await GroupMember.findOne({ where: { groupId: id, userId: socket.userId } });
        if (member) socket.join(`group:${id}`);
        return;
      }

      if (chatType === 'album') {
        const album = await Album.findByPk(id);
        if (!album) return;

        const member = await AlbumMember.findOne({ where: { albumId: id, userId: socket.userId } });
        if (member) socket.join(`album:${id}`);
      }
    });

    socket.on('chat:send', async (payload, ack) => {
      try {
        const { chatType, targetId, content } = payload || {};
        const id = Number(targetId);

        if (!chatType || !id || !content) {
          ack?.({ ok: false, message: 'chatType, targetId and content are required.' });
          return;
        }

        let room;
        let created;

        if (chatType === 'private') {
          room = privateRoom(socket.userId, id);
          created = await Message.create({
            senderId: socket.userId,
            chatType,
            recipientId: id,
            content,
          });
        } else if (chatType === 'group') {
          const member = await GroupMember.findOne({ where: { groupId: id, userId: socket.userId } });
          if (!member) {
            ack?.({ ok: false, message: 'Not allowed.' });
            return;
          }

          room = `group:${id}`;
          created = await Message.create({
            senderId: socket.userId,
            chatType,
            groupId: id,
            content,
          });
        } else if (chatType === 'album') {
          const member = await AlbumMember.findOne({ where: { albumId: id, userId: socket.userId } });
          if (!member) {
            ack?.({ ok: false, message: 'Not allowed.' });
            return;
          }

          room = `album:${id}`;
          created = await Message.create({
            senderId: socket.userId,
            chatType,
            albumId: id,
            content,
          });
        } else {
          ack?.({ ok: false, message: 'Invalid chatType.' });
          return;
        }

        const message = await Message.findByPk(created.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] }],
        });

        const mapped = mapMessage(message);
        io.to(room).emit('chat:message', mapped);
        ack?.({ ok: true, message: mapped });
      } catch (error) {
        ack?.({ ok: false, message: error.message || 'Failed to send message.' });
      }
    });
  });
};

module.exports = registerChatSocket;
