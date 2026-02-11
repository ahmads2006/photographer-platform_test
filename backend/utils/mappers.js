const mapUser = (user) => ({
  _id: user.id,
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const mapAlbum = (album) => ({
  _id: album.id,
  id: album.id,
  name: album.name,
  privacy: album.privacy,
  ownerId: album.ownerId,
  owner: album.owner ? mapUser(album.owner) : album.ownerId,
  members: Array.isArray(album.members) ? album.members.map(mapUser) : [],
  createdAt: album.createdAt,
  updatedAt: album.updatedAt,
});

const mapPhoto = (photo) => ({
  _id: photo.id,
  id: photo.id,
  ownerId: photo.ownerId,
  owner: photo.owner ? mapUser(photo.owner) : photo.ownerId,
  album: photo.album
    ? { _id: photo.album.id, id: photo.album.id, name: photo.album.name, privacy: photo.album.privacy }
    : photo.albumId,
  imageUrl: photo.imageUrl,
  visibility: photo.visibility,
  metadata: {
    title: photo.metadataTitle,
    description: photo.metadataDescription || '',
    date: photo.metadataDate,
    location: photo.metadataLocation || '',
  },
  storage: {
    filename: photo.storageFilename,
    mimetype: photo.storageMimetype,
    size: photo.storageSize,
  },
  createdAt: photo.createdAt,
  updatedAt: photo.updatedAt,
});

const mapGroup = (group) => ({
  _id: group.id,
  id: group.id,
  name: group.name,
  ownerId: group.ownerId,
  owner: group.owner ? mapUser(group.owner) : group.ownerId,
  members: Array.isArray(group.members) ? group.members.map(mapUser) : [],
  albums: Array.isArray(group.albums)
    ? group.albums.map((album) => ({ _id: album.id, id: album.id, name: album.name, privacy: album.privacy }))
    : [],
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

const mapMessage = (message) => ({
  _id: message.id,
  id: message.id,
  sender: message.sender ? mapUser(message.sender) : message.senderId,
  chatType: message.chatType,
  recipient: message.recipientId,
  group: message.groupId,
  album: message.albumId,
  content: message.content,
  timestamp: message.timestamp,
});

module.exports = {
  mapUser,
  mapAlbum,
  mapPhoto,
  mapGroup,
  mapMessage,
};
