const path = require('path');

const getPublicImageUrl = (filename) => {
  const baseUrl = process.env.PUBLIC_ASSET_URL || process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl.replace(/\/$/, '')}/uploads/${encodeURIComponent(filename)}`;
};

const getUploadPath = (filename) => path.join(__dirname, '..', '..', 'uploads', filename);

const removeLocalFile = async (absolutePath) => {
  const fs = require('fs/promises');
  try {
    await fs.unlink(path.resolve(absolutePath));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

module.exports = {
  getPublicImageUrl,
  getUploadPath,
  removeLocalFile,
};
