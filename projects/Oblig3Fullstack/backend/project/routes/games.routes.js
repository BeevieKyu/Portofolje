import express from 'express';
import Game from '../models/Game.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { requireAdmin, requireUser, setUserRole } from '../middleware/auth.middleware.js';
import { applyEloAndStatsUpdates } from '../services/elo.service.js';
import { arePlayersCompatible, buildGameFilter, findCompatiblePendingGame } from '../services/game-matchmaking.service.js';
import { buildSortObject, validateGameComment, validateGameCreation, validateGameJoin, validateGameQueue, validateGameResult, validatePagination } from '../validators/validate.js';

const router = express.Router();

async function enrichGameComments(comments) {
  const registeredAuthorIds = [...new Set(
    comments
      .filter(comment => comment.author?.type === 'registered')
      .map(comment => String(comment.author.id))
  )];

  const users = registeredAuthorIds.length > 0
    ? await User.find({ publicId: { $in: registeredAuthorIds } }).select('publicId username')
    : [];

  const usernameById = new Map(users.map(user => [String(user.publicId), user.username]));

  return comments.map(comment => ({
    id: String(comment._id),
    gameId: String(comment.gameId),
    author: comment.author,
    authorName: comment.author?.type === 'registered'
      ? usernameById.get(String(comment.author.id)) ?? String(comment.author.id)
      : comment.author?.type === 'admin'
        ? 'Admin'
        : 'Guest',
    content: comment.content,
    createdAt: comment.createdAt
  }));
}

/**
 * Handles quueue, game creating, joining game, listiing and fetching games, saving results 
 *  adding, listing and deleting comments on games
 * 
 * Middleware runs, then it req data form req.body, req.params OR req.query.
 * the rouse checks for invalid states. Database changes are saved. JSON respone return error fall into catcj
 */


/** 
 * reads user Id and variand from body, finde the registered user by piblic id
 * uses findCompatiblePendingGame to see whether an unfinishes game exists already.
 * If it finds one, it adds the users as player 2, change the game to active, sets startedAt. 
 * saves and returns the matched game.
 * If it CANT fint one is creates a new pending game and rewurns that the user is queueing
*/
router.post('/queue', setUserRole, requireUser, validateGameQueue, async (req, res) => {
  try {
    const { userId, variant } = req.body;


    const user = await User.findOne({ publicId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingGame = await findCompatiblePendingGame({
      Game,
      User,
      userId,
      variant,
      userElo: user.eloRating
    });

    if (pendingGame) {
      pendingGame.players.push({ type: 'registered', id: userId });
      pendingGame.status = 'active';
      pendingGame.startedAt = new Date();
      await pendingGame.save();

      return res.json({
        matched: true,
        message: 'Matched into an existing game',
        game: pendingGame
      });
    }


    /**
     * Manual game creation mostly for testing, since i want control :)
     */
    const game = new Game({
      variant,
      players: [{ type: 'registered', id: userId }],
      status: 'pending'
    });
    await game.save();

    res.status(201).json({
      matched: false,
      message: 'No opponent found yet. Waiting in the matchmaking queue.',
      game
    });

  } catch (error) {
    console.error('Error in matchmaking queue:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', setUserRole, validateGameCreation, async (req, res) => {
  try {
    const { variant, players, matchPreferences = {} } = req.body;
    const hasTwoPlayers = players.length === 2;

    const normalizedPreferences = {
      allowAnonymous: matchPreferences.allowAnonymous !== undefined ? Boolean(matchPreferences.allowAnonymous) : true,
      minElo: matchPreferences.minElo !== undefined && matchPreferences.minElo !== null && matchPreferences.minElo !== ''
        ? Number(matchPreferences.minElo)
        : null,
      maxElo: matchPreferences.maxElo !== undefined && matchPreferences.maxElo !== null && matchPreferences.maxElo !== ''
        ? Number(matchPreferences.maxElo)
        : null,
    };

    const game = new Game({
      variant,
      players,
      matchPreferences: normalizedPreferences,
      status: hasTwoPlayers ? 'active' : 'pending',
      startedAt: hasTwoPlayers ? new Date() : undefined
    });

    await game.save();

    res.status(201).json({
      message: 'Game created successfully',
      game
    });

  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Joining a game
 * Reads the joining player fomr req body. Finds the game by Mongo id
 * Rejects if,
 *  Game does not exist, game already complered, already have 2 players, 
 *  same player is already in game ot if an anonymus player tries to join.
 */

router.post('/:id/join', setUserRole, validateGameJoin, async (req, res) => {
  try {
    const { player } = req.body;
    const game = await Game.findById(req.params.id);
    const creator = game?.players?.[0];
    const prefs = game?.matchPreferences || {};

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status === 'completed') {
      return res.status(400).json({ error: 'Cannot join a completed game' });
    }

    if (game.players.length >= 2) {
      return res.status(409).json({ error: 'Game already has 2 players' });
    }

    const isAlreadyInGame = game.players.some(existingPlayer => (
      existingPlayer.type === player.type && String(existingPlayer.id) === String(player.id)
    ));

    if (isAlreadyInGame) {
      return res.status(409).json({ error: 'Player already joined this game' });
    }

    if (!arePlayersCompatible(game.players, player)) {
      return res.status(400).json({ error: 'Anonymous players can only play against other anonymous players' });
    }

    if (player.type === 'anonymous' && creator?.type === 'registered' && prefs.allowAnonymous === false) {
      return res.status(403).json({ error: 'Anonymous players are not allowed in this game' });
    }

    if (player.type === 'registered' && (prefs.minElo != null || prefs.maxElo != null)) {
      const joiningUser = await User.findOne({ publicId: String(player.id) }).select('eloRating');
      if (!joiningUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (prefs.minElo != null && joiningUser.eloRating < Number(prefs.minElo)) {
        return res.status(400).json({ error: 'Your Elo is below the required range for this game' });
      }
      if (prefs.maxElo != null && joiningUser.eloRating > Number(prefs.maxElo)) {
        return res.status(400).json({ error: 'Your Elo is above the required range for this game' });
      }
    }

    game.players.push(player);

    if (game.players.length === 2) {
      game.status = 'active';
      game.startedAt = game.startedAt || new Date();
    }

    await game.save();

    res.json({
      message: 'Joined game successfully',
      game
    });

  } catch (error) {
    console.error('Error joining game:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Reads optional filters from query, read pagination info from req.pagination
 *  Build a filter using buildGameFilter
 *  Build sorting using buildSortObject
 *  Runs the db query with filter, sort, skip and limit
 *  Counts total number of matching games, returns both games and pagnation.
 * 
 * Mainly used for browsing and searching for games.
 */
router.get('/', setUserRole, validatePagination, async (req, res) => {
  try {
    const {
      status,
      rounds,
      straightsAllowed,
      timePerRound,
      sort = '-createdAt'
    } = req.query;
    const { page: pageNumber, limit: limitNumber } = req.pagination;

    const filter = buildGameFilter({ status, rounds, straightsAllowed, timePerRound });

    const skip = (pageNumber - 1) * limitNumber;

    const sortObj = buildSortObject(sort);

    const games = await Game.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber);

    const total = await Game.countDocuments(filter);

    res.json({
      games,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Gets a game
 * Finds game by ID returns 404 if it does not exsist, 
 *  returns full gane uf found returns 404 if format is invalid
 */
router.get('/:id', setUserRole, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);

  } catch (error) {
    console.error('Error fetching game:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Saves game result
 * reads, winner, finale score, rolls and hold. 
 *  reated ampty elodelras array, loads the game
 * Rejects:
 *  game not found, game already dine, less than 2 players in game.
 * Then it updates the game 
 *  saves: 
 *  winner, finale score, rolls, holds, status to completed and sets completedAt.
 * 
 * After all that it handles stat changes
 * extracts registered players form game.players then find them in the db.
 *  converts the winner to string, calls applyEloAndStatsUpdates(users, winnerId) 
 *  saves the changed users then stores the returned ELO changes in game.eloDeltas.
 */

router.post('/:id/result', setUserRole, validateGameResult, async (req, res) => {
  try {
    const { winner, finalScores, rolls, holds } = req.body;
    const eloDeltas = [];

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status === 'completed') {
      return res.status(400).json({ error: 'Game result already recorded' });
    }

    if (game.players.length < 2) {
      return res.status(400).json({ error: 'Game needs 2 players before saving result' });
    }

    game.winner = winner;
    game.finalScores = finalScores;
    game.rolls = rolls;
    game.holds = holds;
    game.status = 'completed';
    game.completedAt = new Date();

    await game.save();

    const registeredPlayerIds = game.players
      .filter(player => player.type === 'registered')
      .map(player => String(player.id));

    if (registeredPlayerIds.length > 0) {
      const users = await User.find({ publicId: { $in: registeredPlayerIds } });
      const winnerId = String(winner);
      eloDeltas.push(...applyEloAndStatsUpdates(users, winnerId));

      await Promise.all(users.map(user => user.save()));
    }

    game.eloDeltas = eloDeltas;
    await game.save();

    res.json({
      message: 'Game result saved successfully',
      game
    });

  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Adds a comment to a game.
 * Reads author and conrent, checks that the game exists, creates a new comment linked to game ID
 *  Saves and returns it.
 * ONLY registers users can comment beavuse of requireUser.
 */
router.post('/:id/comments', setUserRole, requireUser, validateGameComment, async (req, res) => {
  try {
    const { author, content } = req.body;

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const comment = new Comment({
      gameId: req.params.id,
      author,
      content
    });

    await comment.save();

    const [enrichedComment] = await enrichGameComments([comment]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: enrichedComment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * lists comments for a game.
 * reads abd sord pagination calyes, check that the game exsists, fetches comment for that gameId
 *  sorts and paginates them, count total comments, returns comments and pagination info.
 */
router.get('/:id/comments', setUserRole, validatePagination, async (req, res) => {
  try {
    const { sort = '-createdAt' } = req.query;
    const { page: pageNumber, limit: limitNumber } = req.pagination;

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const sortObj = buildSortObject(sort);

    const comments = await Comment.find({ gameId: req.params.id })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber);

    const enrichedComments = await enrichGameComments(comments);

    const total = await Comment.countDocuments({ gameId: req.params.id });

    res.json({
      comments: enrichedComments,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Deleting a comment from a game.
 * Find the comment by the id, returns 404 if missing. check that the comment belongs to the game in the url
 *  deletes the comment then returns success message
 */
router.delete('/:id/comments/:commentId', setUserRole, requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.gameId.toString() !== req.params.id) {
      return res.status(400).json({ error: 'Comment does not belong to this game' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;