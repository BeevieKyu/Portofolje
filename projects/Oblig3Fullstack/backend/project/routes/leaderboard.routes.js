import express from 'express';
import User from '../models/User.js';
import { validateLeaderboardQuery, validatePagination } from '../validators/validate.js';

const router = express.Router();

/**
 * Mounted eleswhere but this defines the root slash.
 * category from query, default elo
 * page and limit from req.pagination.
 * 
 * Sorting
 * elo - sorts elo rating in decending order
 * wins- sorts by totalWins in decending order
 * winPercentage - sorted in decenting order
 * same for  matches
 * ok everything is sorter in decending order so the best players are on the top
 * 
 * Then it picks the chosen sort object 
 * 
 * only users who are registerd/admin who are UNbanned are included in the leaderbpard
 * 
 */
router.get('/', validateLeaderboardQuery, validatePagination, async (req, res) => {
  try {
    const { category = 'elo' } = req.query;
    const { page, limit } = req.pagination;

    const sortMap = {
      elo: { eloRating: -1 },
      wins: { totalWins: -1 },
      winPercentage: { winPercentage: -1 },
      matches: { totalMatches: -1 }
    };

    const sortObj = sortMap[category];
    const skip = (page - 1) * limit;

    const users = await User.find(
      { isBanned: false, userType: { $in: ['registered', 'admin'] } },
      { username: 1, eloRating: 1, totalWins: 1, totalMatches: 1, winPercentage: 1, eloRatingChange: 1 }
    )
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isBanned: false, userType: { $in: ['registered', 'admin'] } });

    res.json({
      category,
      leaderboard: users.map((u, i) => ({
        rank: skip + i + 1,
        username: u.username,
        eloRating: u.eloRating,
        eloRatingChange: u.eloRatingChange,
        totalWins: u.totalWins,
        totalMatches: u.totalMatches,
        winPercentage: u.winPercentage
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
