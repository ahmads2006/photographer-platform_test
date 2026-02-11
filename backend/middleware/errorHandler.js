const errorHandler = (err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired.' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error.', details: err.keyValue });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  return res.status(status).json({ message });
};

module.exports = errorHandler;
