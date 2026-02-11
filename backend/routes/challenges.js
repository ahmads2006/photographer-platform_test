const express = require('express');
const {
    createChallenge,
    listChallenges,
    getChallenge,
    joinChallenge,
    voteEntry,
} = require('../controllers/challengeController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createChallenge);
router.get('/', listChallenges);
router.get('/:id', getChallenge);
router.post('/:id/join', auth, joinChallenge);
router.post('/:id/entries/:entryId/vote', auth, voteEntry);

module.exports = router;
