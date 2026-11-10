import express from 'express';
import Game from '../models/Game.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Creates route for GET/api/activity
 * Returns a summary of platform actvivity:
 *  Number of ongoing visavle games
 *  Numver of active registerd/admin users this week
 *  Last 10 games visable games
 */

const visibleGameFilter = {
  players: { $not: { $elemMatch: { type: 'anonymous' } } }
};

router.get('/', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

    const [ongoingGames, activeUsersThisWeek, recentGames] = await Promise.all([
      Game.countDocuments({
        ...visibleGameFilter,
        status: { $in: ['pending', 'active'] }
      }),
      User.countDocuments({
        isBanned: false,
        userType: { $in: ['registered', 'admin'] },
        lastLogin: { $gte: oneWeekAgo }
      }),
      Game.find({
        ...visibleGameFilter,
        status: 'completed'
      })
        .sort({ completedAt: -1, createdAt: -1 })
        .limit(10)
        .select('players variant winner status createdAt startedAt completedAt finalScores')
    ]);

    res.status(200).json({
      activity: {
        ongoingGames,
        activeUsersThisWeek,
        recentGames
      }
    });
  } catch (error) {
    console.error('Error fetching platform activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;