const express = require('express');
const {
  createGroup,
  listGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addAlbumToGroup,
} = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createGroup);
router.get('/', auth, listGroups);
router.get('/:id', auth, getGroup);
router.patch('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);
router.post('/:id/albums', auth, addAlbumToGroup);

module.exports = router;
