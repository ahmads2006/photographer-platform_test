const express = require('express');
const {
  uploadPhoto,
  listPhotos,
  getPhoto,
  updatePhoto,
  deletePhoto,
} = require('../controllers/photoController');
const { auth } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', auth, imageUpload.single('image'), uploadPhoto);
router.get('/', auth, listPhotos);
router.get('/:id', auth, getPhoto);
router.patch('/:id', auth, updatePhoto);
router.delete('/:id', auth, deletePhoto);

module.exports = router;
