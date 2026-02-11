const express = require('express');
const {
  createAlbum,
  listAlbums,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  listAlbumPhotos,
} = require('../controllers/albumController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createAlbum);
router.get('/', auth, listAlbums);
router.get('/:id', auth, getAlbum);
router.patch('/:id', auth, updateAlbum);
router.delete('/:id', auth, deleteAlbum);
router.get('/:id/photos', auth, listAlbumPhotos);

module.exports = router;
