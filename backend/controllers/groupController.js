const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { Group, GroupMember, GroupAlbum, Album, User, sequelize } = require('../models');
const { mapGroup } = require('../utils/mappers');

const groupInclude = [
  { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] },
  {
    model: User,
    as: 'members',
    attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'],
    through: { attributes: [] },
  },
  {
    model: Album,
    as: 'albums',
    attributes: ['id', 'name', 'privacy'],
    through: { attributes: [] },
  },
];

const isGroupMember = async (groupId, userId) => {
  const member = await GroupMember.findOne({ where: { groupId, userId } });
  return Boolean(member);
};

const createGroup = asyncHandler(async (req, res) => {
  const { name, members = [] } = req.body;

  if (!name) {
    throw new ApiError(400, 'Group name is required.');
  }

  const memberSet = [...new Set([req.user.id, ...members.map((m) => Number(m))].filter(Boolean))];

  const group = await sequelize.transaction(async (transaction) => {
    const created = await Group.create({ name, ownerId: req.user.id }, { transaction });

    await GroupMember.bulkCreate(
      memberSet.map((userId) => ({ groupId: created.id, userId })),
      { transaction }
    );

    return created;
  });

  const withRelations = await Group.findByPk(group.id, { include: groupInclude });
  res.status(201).json({ group: mapGroup(withRelations) });
});

const listGroups = asyncHandler(async (req, res) => {
  const groupIds = (await GroupMember.findAll({ where: { userId: req.user.id }, attributes: ['groupId'] })).map(
    (row) => row.groupId
  );

  const groups = await Group.findAll({
    where: { id: groupIds.length ? groupIds : [0] },
    include: groupInclude,
    order: [['updatedAt', 'DESC']],
  });

  res.json({ groups: groups.map(mapGroup) });
});

const getGroup = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const group = await Group.findByPk(groupId, { include: groupInclude });

  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  const member = await isGroupMember(group.id, req.user.id);
  if (!member && req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied.');
  }

  res.json({ group: mapGroup(group) });
});

const updateGroup = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  if (group.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only owner can update group.');
  }

  const { name, members } = req.body;

  await sequelize.transaction(async (transaction) => {
    if (name !== undefined) group.name = name;
    await group.save({ transaction });

    if (Array.isArray(members)) {
      const memberSet = [...new Set([group.ownerId, ...members.map((m) => Number(m))].filter(Boolean))];
      await GroupMember.destroy({ where: { groupId }, transaction });
      await GroupMember.bulkCreate(
        memberSet.map((userId) => ({ groupId, userId })),
        { transaction }
      );
    }
  });

  const withRelations = await Group.findByPk(group.id, { include: groupInclude });
  res.json({ group: mapGroup(withRelations) });
});

const deleteGroup = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const group = await Group.findByPk(groupId);

  if (!group) {
    throw new ApiError(404, 'Group not found.');
  }

  if (group.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only owner can delete group.');
  }

  await sequelize.transaction(async (transaction) => {
    await GroupAlbum.destroy({ where: { groupId }, transaction });
    await GroupMember.destroy({ where: { groupId }, transaction });
    await group.destroy({ transaction });
  });

  res.json({ message: 'Group deleted.' });
});

const addAlbumToGroup = asyncHandler(async (req, res) => {
  const groupId = Number(req.params.id);
  const group = await Group.findByPk(groupId);

  if (!group) throw new ApiError(404, 'Group not found.');

  if (group.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only owner can add albums.');
  }

  const albumId = Number(req.body.albumId);
  const album = await Album.findByPk(albumId);
  if (!album) throw new ApiError(404, 'Album not found.');

  await GroupAlbum.findOrCreate({ where: { groupId, albumId }, defaults: { groupId, albumId } });

  const withRelations = await Group.findByPk(group.id, { include: groupInclude });
  res.json({ group: mapGroup(withRelations) });
});

module.exports = {
  createGroup,
  listGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addAlbumToGroup,
};
