const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { Album, AlbumMember, User, Photo, sequelize } = require('../models');
const { mapAlbum, mapPhoto } = require('../utils/mappers');

const albumInclude = [
  { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] },
  {
    model: User,
    as: 'members',
    attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'],
    through: { attributes: [] },
  },
];

const isAlbumMember = async (albumId, userId) => {
  const member = await AlbumMember.findOne({ where: { albumId, userId } });
  return Boolean(member);
};

const createAlbum = asyncHandler(async (req, res) => {
  const { name, members = [], privacy = 'private' } = req.body;

  if (!name) {
    throw new ApiError(400, 'Album name is required.');
  }

  const memberSet = [...new Set([req.user.id, ...members.map((m) => Number(m))].filter(Boolean))];
  if (memberSet.length > 20) {
    throw new ApiError(400, 'Max 20 participants per album.');
  }

  const album = await sequelize.transaction(async (transaction) => {
    const created = await Album.create(
      {
        name,
        ownerId: req.user.id,
        privacy,
      },
      { transaction }
    );

    await AlbumMember.bulkCreate(
      memberSet.map((userId) => ({ albumId: created.id, userId })),
      { transaction }
    );

    return created;
  });

  const withRelations = await Album.findByPk(album.id, { include: albumInclude });
  res.status(201).json({ album: mapAlbum(withRelations) });
});

const listAlbums = asyncHandler(async (req, res) => {
  const memberRows = await AlbumMember.findAll({
    where: { userId: req.user.id },
    attributes: ['albumId'],
  });

  const memberAlbumIds = memberRows.map((row) => row.albumId);

  const albums = await Album.findAll({
    where: {
      [Op.or]: [{ privacy: 'public' }, { id: memberAlbumIds.length ? memberAlbumIds : [0] }],
    },
    include: albumInclude,
    order: [['updatedAt', 'DESC']],
  });

  res.json({ albums: albums.map(mapAlbum) });
});

const getAlbum = asyncHandler(async (req, res) => {
  const albumId = Number(req.params.id);
  const album = await Album.findByPk(albumId, { include: albumInclude });

  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  const canAccess = album.privacy === 'public' || (await isAlbumMember(album.id, req.user.id));
  if (!canAccess) {
    throw new ApiError(403, 'Access denied.');
  }

  res.json({ album: mapAlbum(album) });
});

const updateAlbum = asyncHandler(async (req, res) => {
  const albumId = Number(req.params.id);
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  if (album.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the album owner can update it.');
  }

  const { name, members, privacy } = req.body;

  await sequelize.transaction(async (transaction) => {
    if (name !== undefined) album.name = name;
    if (privacy !== undefined) album.privacy = privacy;
    await album.save({ transaction });

    if (Array.isArray(members)) {
      const memberSet = [...new Set([album.ownerId, ...members.map((m) => Number(m))].filter(Boolean))];
      if (memberSet.length > 20) {
        throw new ApiError(400, 'Max 20 participants per album.');
      }

      await AlbumMember.destroy({ where: { albumId: album.id }, transaction });
      await AlbumMember.bulkCreate(
        memberSet.map((userId) => ({ albumId: album.id, userId })),
        { transaction }
      );
    }
  });

  const withRelations = await Album.findByPk(album.id, { include: albumInclude });
  res.json({ album: mapAlbum(withRelations) });
});

const deleteAlbum = asyncHandler(async (req, res) => {
  const albumId = Number(req.params.id);
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  if (album.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the album owner can delete it.');
  }

  await sequelize.transaction(async (transaction) => {
    await Photo.update({ albumId: null }, { where: { albumId }, transaction });
    await AlbumMember.destroy({ where: { albumId }, transaction });
    await album.destroy({ transaction });
  });

  res.json({ message: 'Album deleted.' });
});

const listAlbumPhotos = asyncHandler(async (req, res) => {
  const albumId = Number(req.params.id);
  const album = await Album.findByPk(albumId);

  if (!album) {
    throw new ApiError(404, 'Album not found.');
  }

  const canAccess = album.privacy === 'public' || (await isAlbumMember(album.id, req.user.id));
  if (!canAccess) {
    throw new ApiError(403, 'Access denied.');
  }

  const photos = await Photo.findAll({
    where: { albumId },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] },
      { model: Album, as: 'album', attributes: ['id', 'name', 'privacy'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ photos: photos.map(mapPhoto) });
});

module.exports = {
  createAlbum,
  listAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  listAlbumPhotos,
};
