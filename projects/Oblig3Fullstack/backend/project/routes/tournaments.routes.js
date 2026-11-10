import express from 'express';
import Tournament from '../models/Tournament.js';
import TournamentComment from '../models/TournamentComment.js';
import User from '../models/User.js';
import { requireAdmin, requireUser, setUserRole } from '../middleware/auth.middleware.js';
import { advanceTournamentIfRoundResolved, buildTournamentFilter, generateBracket, resolveTournamentWinnerId } from '../services/tournament.service.js';
import { buildSortObject, validatePagination, validateTournamentComment, validateTournamentCreation, validateTournamentJoin } from '../validators/validate.js';

const router = express.Router();

/**
 * this controlls the tournament:
 * create tournaments, get one tournament, join, start, save round match results and advance rounds
 * ass/list/delete tournament commens
 */

/**
 * Admin only tournament creating 
 * expects title, varient,startDate and createdBy.
 * looks up the createdBy using public user Id then stores creator as internal mongo id
 * creates tournament with no perticipents and the default maxPerticipant of 8 if otherwise not specified
 */
router.post('/', setUserRole, requireAdmin, validateTournamentCreation, async (req, res) => {
  try {
    const { title, description, variant, startDate, maxParticipants, trophy, createdBy } = req.body;

    const creator = await User.findOne({ publicId: createdBy });
    if (!creator) {
      return res.status(400).json({ error: 'createdBy must reference an existing user' });
    }

    const tournament = new Tournament({
      title,
      description,
      variant,
      startDate,
      maxParticipants: maxParticipants || 8,
      trophy,
      createdBy: creator._id,
      participants: []
    });

    await tournament.save();
    res.status(201).json({ message: 'Tournament created successfully', tournament });

  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * public listing with optional filters and sorting. 
 * uses pagniation middleware
 * bulds filter using servce helper and sort with validator helper.
 * returns tournament and pagniation metadata
 */
router.get('/', setUserRole, validatePagination, async (req, res) => {
  try {
    const { status, rounds, straightsAllowed, timePerRound, sort = '-createdAt' } = req.query;
    const { page: pageNumber, limit: limitNumber } = req.pagination;

    const filter = buildTournamentFilter({ status, rounds, straightsAllowed, timePerRound });

    const skip = (pageNumber - 1) * limitNumber;
    const sortObj = buildSortObject(sort);

    const tournaments = await Tournament.find(filter).sort(sortObj).skip(skip).limit(limitNumber);
    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) }
    });

  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * fetches one turnament by id, returns 404 if not found and 400 if invalid id format
 */
router.get('/:id', setUserRole, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid tournament ID' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * only logged in users
 * find public id from body, checs if tournament exists and is still upcomming.
 * prevents overfilling and duplicate joins.
 * pushes user id into participants.
 */
router.post('/:id/join', setUserRole, requireUser, validateTournamentJoin, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ publicId: userId });
    if (!user) return res.status(400).json({ error: 'userId must reference an existing user' });

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'upcoming') return res.status(400).json({ error: 'Tournament is no longer accepting participants' });
    if (tournament.participants.length >= tournament.maxParticipants) return res.status(400).json({ error: 'Tournament is full' });
    if (tournament.participants.some(p => p.toString() === String(user._id))) {
      return res.status(400).json({ error: 'User already joined this tournament' });
    }

    tournament.participants.push(user._id);
    await tournament.save();
    res.json({ message: 'Joined tournament successfully', tournament });

  } catch (error) {
    console.error('Error joining tournament:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Only admin can start tournament.
 * can only start if there is at least 2 participants and is upcomming
 * generates initial bracker using service function then sets status to active.
 */
router.post('/:id/start', setUserRole, requireAdmin, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'upcoming') return res.status(400).json({ error: 'Tournament has already started or is completed' });
    if (tournament.participants.length < 2) return res.status(400).json({ error: 'At least 2 participants required to start' });

    tournament.bracket = generateBracket(tournament.participants);
    tournament.status = 'active';
    await tournament.save();
    res.json({ message: 'Tournament started, bracket generated', tournament });

  } catch (error) {
    console.error('Error starting tournament:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid tournament ID' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Logged in users can submit match retults. validates round and match index
 * it need a winnerid
 * loasa tournament anc confirm active status
 * finds the specified tound and match, blocks invalid states:
 *  already completet and bye match.
 * Resolves winner id via service helpe, ensures winner is actually one of the two players.
 * marks match as completed. 
 * calls serice hlper in advance tournament if the round is fully resolved.
 * Then it saves and returns the updates tournament
 */
router.post('/:id/rounds/:roundNumber/matches/:matchIndex/result', setUserRole, requireUser, async (req, res) => {
  try {
    const roundNumber = Number.parseInt(req.params.roundNumber, 10);
    const matchIndex = Number.parseInt(req.params.matchIndex, 10);
    const { winnerId, gameId } = req.body;

    if (!Number.isInteger(roundNumber) || roundNumber < 1 || !Number.isInteger(matchIndex) || matchIndex < 0) {
      return res.status(400).json({ error: 'roundNumber and matchIndex must be valid positive numbers' });
    }

    if (!winnerId) {
      return res.status(400).json({ error: 'winnerId is required' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'active') return res.status(400).json({ error: 'Tournament is not active' });

    const round = tournament.bracket.find(r => r.roundNumber === roundNumber);
    if (!round) return res.status(404).json({ error: 'Round not found' });

    const match = round.matches[matchIndex];
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status === 'completed') return res.status(400).json({ error: 'Match result already recorded' });
    if (match.status === 'bye') return res.status(400).json({ error: 'Cannot submit result for a bye match' });

    const { resolvedWinnerId, allowedWinnerInternalIds } = await resolveTournamentWinnerId({ User, match, winnerId });

    if (!allowedWinnerInternalIds.includes(resolvedWinnerId)) {
      return res.status(400).json({ error: 'winnerId must be one of the two match players' });
    }

    match.winner = resolvedWinnerId;
    match.status = 'completed';
    if (gameId) {
      match.gameId = gameId;
    }

    await advanceTournamentIfRoundResolved({ tournament, roundNumber, round, User });

    await tournament.save();

    res.json({
      message: 'Tournament match result saved successfully',
      tournament
    });
  } catch (error) {
    console.error('Error saving tournament match result:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid ID format' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Adds comments for one tournament.
 * only Logged in users can comment
 * validates comment payloas, ensures tournament exists then creates the comment.
 */
router.post('/:id/comments', setUserRole, requireUser, validateTournamentComment, async (req, res) => {
  try {
    const { author, content } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const comment = new TournamentComment({ tournamentId: req.params.id, author, content });
    await comment.save();
    res.status(201).json({ message: 'Comment added successfully', comment });

  } catch (error) {
    console.error('Error adding tournament comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * lists all comments for one tourament
 * supportes sort and pagination
 * retuens pagination metadata.
 */
router.get('/:id/comments', setUserRole, validatePagination, async (req, res) => {
  try {
    const { sort = '-createdAt' } = req.query;
    const { page: pageNumber, limit: limitNumber } = req.pagination;
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const skip = (pageNumber - 1) * limitNumber;
    const sortObj = buildSortObject(sort);

    const comments = await TournamentComment.find({ tournamentId: req.params.id }).sort(sortObj).skip(skip).limit(limitNumber);
    const total = await TournamentComment.countDocuments({ tournamentId: req.params.id });

    res.json({
      comments,
      pagination: { page: pageNumber, limit: limitNumber, total, pages: Math.ceil(total / limitNumber) }
    });

  } catch (error) {
    console.error('Error fetching tournament comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin moderation endpoint.
 * Makes sure the comment exists and belonges to this tournament id in the URL
 * Then deletes the comment.
 */
router.delete('/:id/comments/:commentId', setUserRole, requireAdmin, async (req, res) => {
  try {
    const comment = await TournamentComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.tournamentId.toString() !== req.params.id) return res.status(400).json({ error: 'Comment does not belong to this tournament' });

    await TournamentComment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting tournament comment:', error);
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid comment ID' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;