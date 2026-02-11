const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models');
const { mapUser } = require('../utils/mappers');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required.');
  }

  const normalizedEmail = String(email).toLowerCase();
  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) {
    throw new ApiError(409, 'Email is already in use.');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashed,
    avatar: avatar || '',
  });

  const token = signToken(user.id);

  return res.status(201).json({
    token,
    user: mapUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required.');
  }

  const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user.id);

  return res.json({
    token,
    user: mapUser(user),
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: mapUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar'];
  const updates = Object.keys(req.body);
  const valid = updates.every((k) => allowed.includes(k));

  if (!valid) {
    throw new ApiError(400, `Only ${allowed.join(', ')} can be updated.`);
  }

  updates.forEach((key) => {
    req.user[key] = req.body[key];
  });

  await req.user.save();
  res.json({ user: mapUser(req.user) });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });

  res.json({ users: users.map(mapUser) });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  listUsers,
};
