const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

const auth = async (req, _res, next) => {
  try {
    const raw = req.header('Authorization') || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Authentication token is required.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    if (user.isBanned) {
      throw new ApiError(403, 'Your account has been banned.');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Please authenticate.'));
  }
};

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You are not allowed to perform this action.'));
  }
  return next();
};

module.exports = {
  auth,
  authorizeRoles,
};
