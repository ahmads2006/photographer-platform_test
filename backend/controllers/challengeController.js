const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Challenge, ChallengeEntry, ChallengeVote, Photo, User } = require('../models');

const createChallenge = asyncHandler(async (req, res) => {
    const { title, description, startTime, endTime } = req.body;
    const creatorId = req.user.id;

    if (!title || !startTime || !endTime) {
        throw new ApiError(400, 'Title, start time, and end time are required.');
    }

    const challenge = await Challenge.create({
        creatorId,
        title,
        description,
        startTime,
        endTime,
        status: 'scheduled',
    });

    res.status(201).json({ challenge });
});

const listChallenges = asyncHandler(async (req, res) => {
    const challenges = await Challenge.findAll({
        include: [{ model: User, as: 'Creator', attributes: ['id', 'name', 'avatar'] }],
        order: [['createdAt', 'DESC']],
    });
    res.json({ challenges });
});

const getChallenge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const challenge = await Challenge.findByPk(id, {
        include: [
            { model: User, as: 'Creator', attributes: ['id', 'name', 'avatar'] },
            {
                model: ChallengeEntry,
                as: 'Entries',
                include: [{ model: Photo }, { model: User, attributes: ['id', 'name'] }]
            }
        ],
    });

    if (!challenge) throw new ApiError(404, 'Challenge not found.');

    res.json({ challenge });
});

const joinChallenge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { photoId } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findByPk(id);
    if (!challenge) throw new ApiError(404, 'Challenge not found.');

    // Check if active (simplified logic)
    const now = new Date();
    if (now < new Date(challenge.startTime) || now > new Date(challenge.endTime)) {
        // Allow joining if scheduled? maybe not.
        // throw new ApiError(400, 'Challenge is not active.');
    }

    const existing = await ChallengeEntry.findOne({ where: { challengeId: id, userId } });
    if (existing) throw new ApiError(400, 'You have already joined this challenge.');

    const entry = await ChallengeEntry.create({
        challengeId: id,
        userId,
        photoId,
    });

    res.status(201).json({ entry });
});

const voteEntry = asyncHandler(async (req, res) => {
    const { id, entryId } = req.params;
    const userId = req.user.id;

    const entry = await ChallengeEntry.findByPk(entryId);
    if (!entry) throw new ApiError(404, 'Entry not found.');

    const alreadyVoted = await ChallengeVote.findOne({ where: { entryId, userId } });
    if (alreadyVoted) throw new ApiError(400, 'You have already voted for this entry.');

    await ChallengeVote.create({ entryId, userId });
    await entry.increment('votesCount');

    res.json({ message: 'Voted successfully.' });
});

module.exports = {
    createChallenge,
    listChallenges,
    getChallenge,
    joinChallenge,
    voteEntry,
};
