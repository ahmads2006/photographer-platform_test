const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    avatar: { type: DataTypes.STRING(500), allowNull: true, defaultValue: '' },
    role: { type: DataTypes.ENUM('super_admin', 'admin', 'user'), allowNull: false, defaultValue: 'user' },
    reputationPoints: { type: DataTypes.INTEGER, defaultValue: 0, field: 'reputation_points' },
    isBanned: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_banned' },
  },
  {
    tableName: 'users',
    underscored: true,
  }
);

const Album = sequelize.define(
  'Album',
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    privacy: { type: DataTypes.ENUM('public', 'private'), allowNull: false, defaultValue: 'private' },
    ownerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'owner_id' },
  },
  {
    tableName: 'albums',
    underscored: true,
  }
);

const AlbumMember = sequelize.define(
  'AlbumMember',
  {
    albumId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'album_id', primaryKey: true },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id', primaryKey: true },
  },
  {
    tableName: 'album_members',
    underscored: true,
    timestamps: false,
  }
);

const Group = sequelize.define(
  'Group',
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    ownerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'owner_id' },
  },
  {
    tableName: 'groups',
    underscored: true,
  }
);

const GroupMember = sequelize.define(
  'GroupMember',
  {
    groupId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'group_id', primaryKey: true },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id', primaryKey: true },
  },
  {
    tableName: 'group_members',
    underscored: true,
    timestamps: false,
  }
);

const GroupAlbum = sequelize.define(
  'GroupAlbum',
  {
    groupId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'group_id', primaryKey: true },
    albumId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'album_id', primaryKey: true },
  },
  {
    tableName: 'group_albums',
    underscored: true,
    timestamps: false,
  }
);

const Photo = sequelize.define(
  'Photo',
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    ownerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'owner_id' },
    albumId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'album_id' },
    imageUrl: { type: DataTypes.STRING(500), allowNull: false, field: 'image_url' },
    visibility: { type: DataTypes.ENUM('public', 'private'), allowNull: false, defaultValue: 'private' },
    metadataTitle: { type: DataTypes.STRING(200), allowNull: false, field: 'metadata_title' },
    metadataDescription: { type: DataTypes.TEXT, allowNull: true, field: 'metadata_description' },
    metadataDate: { type: DataTypes.DATE, allowNull: true, field: 'metadata_date' },
    metadataLocation: { type: DataTypes.STRING(200), allowNull: true, field: 'metadata_location' },
    storageFilename: { type: DataTypes.STRING(255), allowNull: false, field: 'storage_filename' },
    storageMimetype: { type: DataTypes.STRING(120), allowNull: false, field: 'storage_mimetype' },
    storageSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'storage_size' },
  },
  {
    tableName: 'photos',
    underscored: true,
  }
);

const Message = sequelize.define(
  'Message',
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'sender_id' },
    chatType: { type: DataTypes.ENUM('private', 'group', 'album'), allowNull: false, field: 'chat_type' },
    recipientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'recipient_id' },
    groupId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'group_id' },
    albumId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'album_id' },
    content: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'messages',
    underscored: true,
    createdAt: false,
    updatedAt: false,
  }
);

User.hasMany(Album, { as: 'ownedAlbums', foreignKey: 'ownerId' });
Album.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Album.belongsToMany(User, { through: AlbumMember, as: 'members', foreignKey: 'albumId', otherKey: 'userId' });
User.belongsToMany(Album, { through: AlbumMember, as: 'memberAlbums', foreignKey: 'userId', otherKey: 'albumId' });

User.hasMany(Group, { as: 'ownedGroups', foreignKey: 'ownerId' });
Group.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Group.belongsToMany(User, { through: GroupMember, as: 'members', foreignKey: 'groupId', otherKey: 'userId' });
User.belongsToMany(Group, { through: GroupMember, as: 'memberGroups', foreignKey: 'userId', otherKey: 'groupId' });

Group.belongsToMany(Album, { through: GroupAlbum, as: 'albums', foreignKey: 'groupId', otherKey: 'albumId' });
Album.belongsToMany(Group, { through: GroupAlbum, as: 'groups', foreignKey: 'albumId', otherKey: 'groupId' });

User.hasMany(Photo, { as: 'photos', foreignKey: 'ownerId' });
Photo.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Album.hasMany(Photo, { as: 'photos', foreignKey: 'albumId' });
Photo.belongsTo(Album, { as: 'album', foreignKey: 'albumId' });

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Social Features
const Follow = sequelize.define('Follow', {
  followerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'follower_id', primaryKey: true },
  followingId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'following_id', primaryKey: true },
}, { tableName: 'follows', underscored: true, timestamps: true });

User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId', otherKey: 'followingId' });

const Like = sequelize.define('Like', {
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id', primaryKey: true },
  photoId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'photo_id', primaryKey: true },
}, { tableName: 'likes', underscored: true, timestamps: true });

User.belongsToMany(Photo, { through: Like, as: 'LikedPhotos', foreignKey: 'userId', otherKey: 'photoId' });
Photo.belongsToMany(User, { through: Like, as: 'Likers', foreignKey: 'photoId', otherKey: 'userId' });
Photo.hasMany(Like, { foreignKey: 'photoId' });
Like.belongsTo(Photo, { foreignKey: 'photoId' });

const Favorite = sequelize.define('Favorite', {
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id', primaryKey: true },
  photoId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'photo_id', primaryKey: true },
}, { tableName: 'favorites', underscored: true, timestamps: true });

User.belongsToMany(Photo, { through: Favorite, as: 'FavoritePhotos', foreignKey: 'userId', otherKey: 'photoId' });
Photo.belongsToMany(User, { through: Favorite, as: 'FavoritedBy', foreignKey: 'photoId', otherKey: 'userId' });

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  photoId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'photo_id' },
  content: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'comments', underscored: true, timestamps: true });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Photo.hasMany(Comment, { foreignKey: 'photoId' });
Comment.belongsTo(Photo, { foreignKey: 'photoId' });

// Challenges
const Challenge = sequelize.define('Challenge', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  creatorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'creator_id' },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  startTime: { type: DataTypes.DATE, allowNull: false, field: 'start_time' },
  endTime: { type: DataTypes.DATE, allowNull: false, field: 'end_time' },
  status: { type: DataTypes.ENUM('active', 'completed', 'scheduled'), defaultValue: 'scheduled' },
}, { tableName: 'challenges', underscored: true });

User.hasMany(Challenge, { as: 'CreatedChallenges', foreignKey: 'creatorId' });
Challenge.belongsTo(User, { as: 'Creator', foreignKey: 'creatorId' });

const ChallengeEntry = sequelize.define('ChallengeEntry', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  challengeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'challenge_id' },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  photoId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'photo_id' },
  votesCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'votes_count' },
}, { tableName: 'challenge_entries', underscored: true });

Challenge.hasMany(ChallengeEntry, { as: 'Entries', foreignKey: 'challengeId' });
ChallengeEntry.belongsTo(Challenge, { foreignKey: 'challengeId' });
User.hasMany(ChallengeEntry, { foreignKey: 'userId' });
ChallengeEntry.belongsTo(User, { foreignKey: 'userId' });
Photo.hasOne(ChallengeEntry, { foreignKey: 'photoId' });
ChallengeEntry.belongsTo(Photo, { foreignKey: 'photoId' });

const ChallengeVote = sequelize.define('ChallengeVote', {
  entryId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'entry_id', primaryKey: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id', primaryKey: true },
}, { tableName: 'challenge_votes', underscored: true, timestamps: false });

ChallengeEntry.hasMany(ChallengeVote, { foreignKey: 'entryId' });
User.hasMany(ChallengeVote, { foreignKey: 'userId' });

// Notifications
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
  type: { type: DataTypes.ENUM('follow', 'like', 'comment', 'challenge_invite', 'system'), allowNull: false },
  referenceId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'reference_id' },
  message: { type: DataTypes.STRING(255), allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
}, { tableName: 'notifications', underscored: true });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Safety & Moderation
const Report = sequelize.define('Report', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  reporterId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'reporter_id' },
  targetId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'target_id' },
  targetType: { type: DataTypes.ENUM('user', 'photo', 'album', 'comment'), allowNull: false, field: 'target_type' },
  reason: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'resolved', 'dismissed'), defaultValue: 'pending' },
}, { tableName: 'reports', underscored: true });

const UserBlock = sequelize.define('UserBlock', {
  blockerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'blocker_id', primaryKey: true },
  blockedId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'blocked_id', primaryKey: true },
}, { tableName: 'user_blocks', underscored: true, timestamps: true });

User.belongsToMany(User, { as: 'BlockedUsers', through: UserBlock, foreignKey: 'blockerId', otherKey: 'blockedId' });
User.belongsToMany(User, { as: 'BlockedBy', through: UserBlock, foreignKey: 'blockedId', otherKey: 'blockerId' });

const ModerationLog = sequelize.define('ModerationLog', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  adminId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admin_id' },
  actionType: { type: DataTypes.STRING(50), allowNull: false, field: 'action_type' }, // ban, unban, delete_user, delete_photo, promote, demote
  targetId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'target_id' },
  targetType: { type: DataTypes.ENUM('user', 'photo', 'album', 'comment'), allowNull: false, field: 'target_type' },
  details: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'moderation_logs', underscored: true });

User.hasMany(ModerationLog, { foreignKey: 'adminId' });
ModerationLog.belongsTo(User, { as: 'Admin', foreignKey: 'adminId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Album,
  AlbumMember,
  Group,
  GroupMember,
  GroupAlbum,
  Photo,
  Message,
  Follow,
  Challenge,
  ChallengeEntry,
  ChallengeVote,
  Like,
  Comment,
  Favorite,
  Notification,
  Report,
  UserBlock,
  ModerationLog,
};
