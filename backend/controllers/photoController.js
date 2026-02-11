const { Op } = require('sequelize');
const path = require('path');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPublicImageUrl, removeLocalFile } = require('../services/storage/localStorage');
const { Photo, Album, AlbumMember, User } = require('../models');
const { mapPhoto } = require('../utils/mappers');

const normalizeMetadata = (bodyMetadata, fallbackTitle = '') => {
  const raw = typeof bodyMetadata === 'string' ? JSON.parse(bodyMetadata) : bodyMetadata || {};
  return {
    title: raw.title || fallbackTitle || 'Untitled',
    description: raw.description || '',
    date: raw.date || null,
    location: raw.location || '',
  };
};

const photoInclude = [
  { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'] },
  { model: Album, as: 'album', attributes: ['id', 'name', 'privacy'] },
];

const canViewPhoto = async (photo, user) => {
  if (user.role === 'admin') return true;
  if (photo.visibility === 'public') return true;
  if (photo.ownerId === user.id) return true;

  if (photo.albumId) {
    const member = await AlbumMember.findOne({ where: { albumId: photo.albumId, userId: user.id } });
    return Boolean(member);
  }

  return false;
};

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required.');
  }

  const albumId = req.body.album ? Number(req.body.album) : null;

  if (albumId) {
    const album = await Album.findByPk(albumId);
    if (!album) throw new ApiError(404, 'Album not found.');

    const member = await AlbumMember.findOne({ where: { albumId, userId: req.user.id } });
    if (!member) {
      throw new ApiError(403, 'You are not a member of this album.');
    }
  }

  const metadata = normalizeMetadata(req.body.metadata, req.body.title);

  const photo = await Photo.create({
    ownerId: req.user.id,
    albumId,
    imageUrl: getPublicImageUrl(req.file.filename),
    visibility: req.body.visibility || 'private',
    metadataTitle: metadata.title,
    metadataDescription: metadata.description,
    metadataDate: metadata.date,
    metadataLocation: metadata.location,
    storageFilename: req.file.filename,
    storageMimetype: req.file.mimetype,
    storageSize: req.file.size,
  });

  const withRelations = await Photo.findByPk(photo.id, { include: photoInclude });
  res.status(201).json({ photo: mapPhoto(withRelations) });
});

const listPhotos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, album } = req.query;
  const safeLimit = Math.min(Number(limit) || 20, 100);

  const memberRows = await AlbumMember.findAll({ where: { userId: req.user.id }, attributes: ['albumId'] });
  const memberAlbumIds = memberRows.map((row) => row.albumId);

  const where = {
    [Op.or]: [{ visibility: 'public' }, { ownerId: req.user.id }, { albumId: memberAlbumIds.length ? memberAlbumIds : [0] }],
  };

  if (album) {
    where.albumId = Number(album);
  }

  const photos = await Photo.findAll({
    where,
    include: photoInclude,
    order: [['createdAt', 'DESC']],
    offset: (Number(page) - 1) * safeLimit,
    limit: safeLimit,
  });

  const total = await Photo.count({ where });

  res.json({
    photos: photos.map(mapPhoto),
    pagination: { page: Number(page), limit: safeLimit, total },
  });
});

const getPhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findByPk(Number(req.params.id), { include: photoInclude });

  if (!photo) {
    throw new ApiError(404, 'Photo not found.');
  }

  if (!(await canViewPhoto(photo, req.user))) {
    throw new ApiError(403, 'Access denied.');
  }

  res.json({ photo: mapPhoto(photo) });
});

const updatePhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findByPk(Number(req.params.id));

  if (!photo) {
    throw new ApiError(404, 'Photo not found.');
  }

  if (photo.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the owner can update this photo.');
  }

  if (req.body.visibility) photo.visibility = req.body.visibility;
  if (req.body.metadata) {
    const metadata = normalizeMetadata(req.body.metadata, photo.metadataTitle);
    photo.metadataTitle = metadata.title;
    photo.metadataDescription = metadata.description;
    photo.metadataDate = metadata.date;
    photo.metadataLocation = metadata.location;
  }

  await photo.save();

  const withRelations = await Photo.findByPk(photo.id, { include: photoInclude });
  res.json({ photo: mapPhoto(withRelations) });
});

const deletePhoto = asyncHandler(async (req, res) => {
  const photo = await Photo.findByPk(Number(req.params.id));

  if (!photo) {
    throw new ApiError(404, 'Photo not found.');
  }

  if (photo.ownerId !== req.user.id && req.user.role !== 'admin') {
    // Check if album owner
    let isAlbumOwner = false;
    if (photo.albumId) {
      const album = await Album.findByPk(photo.albumId);
      if (album && album.ownerId === req.user.id) {
        isAlbumOwner = true;
      }
    }

    if (!isAlbumOwner) {
      throw new ApiError(403, 'Only the owner can delete this photo.');
    }
  }

  const filename = photo.storageFilename;
  await photo.destroy();
  await removeLocalFile(path.join(__dirname, '..', 'uploads', filename));

  res.json({ message: 'Photo deleted.' });
});

module.exports = {
  uploadPhoto,
  listPhotos,
  getPhoto,
  updatePhoto,
  deletePhoto,
};
