import express from 'express';
import Comment from '../models/Comment.js';
import TournamentComment from '../models/TournamentComment.js';
import { requireAdmin, setUserRole } from '../middleware/auth.middleware.js';
import { validatePagination } from '../validators/validate.js';

const router = express.Router();

/**
 * defines asmin only-endpoint for comments across the platform.
 * Handles GET/api/comments 
 * lets admin get all comments, only game comments or only turnament comments.
 */
router.get('/', setUserRole, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { source = 'all', sort = '-createdAt' } = req.query;
    const { page, limit } = req.pagination;

    if (!['all', 'game', 'tournament'].includes(source)) {
      return res.status(400).json({ error: 'source must be one of: all, game, tournament' });
    }

    const [gameComments, tournamentComments] = await Promise.all([
      source === 'all' || source === 'game'
        ? Comment.find().select('gameId author content createdAt')
        : Promise.resolve([]),
      source === 'all' || source === 'tournament'
        ? TournamentComment.find().select('tournamentId author content createdAt')
        : Promise.resolve([])
    ]);

    const merged = [
      ...gameComments.map(comment => ({
        id: String(comment._id),
        source: 'game',
        gameId: String(comment.gameId),
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt
      })),
      ...tournamentComments.map(comment => ({
        id: String(comment._id),
        source: 'tournament',
        tournamentId: String(comment.tournamentId),
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt
      }))
    ];

    const direction = sort.startsWith('-') ? -1 : 1;
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;

    if (!['createdAt', 'content'].includes(sortField)) {
      return res.status(400).json({ error: 'sort must use createdAt or content' });
    }

    merged.sort((a, b) => {
      const first = a[sortField];
      const second = b[sortField];
      if (first < second) return -1 * direction;
      if (first > second) return 1 * direction;
      return 0;
    });

    const total = merged.length;
    const start = (page - 1) * limit;
    const comments = merged.slice(start, start + limit);

    res.json({
      source,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
