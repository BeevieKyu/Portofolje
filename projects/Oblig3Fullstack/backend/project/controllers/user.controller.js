import { registerUser, loginUser } from '../services/user.services.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import { hashpwd } from '../utils/hash.js';

function toPublicUser(userDoc) {
  const user = userDoc.toObject();
  return {
    id: user.publicId,
    username: user.username,
    email: user.email,
    age: user.age,
    userType: user.userType,
    eloRating: user.eloRating,
    eloRatingChange: user.eloRatingChange,
    totalMatches: user.totalMatches,
    totalWins: user.totalWins,
    winPercentage: user.winPercentage,
    appearancePreferences: user.appearancePreferences,
    trophies: user.trophies,
    isActive: user.isActive,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };
}

// recives http req, reads username, email, pwd and age. calls registerUser from service layer.
export const registerController = async (req, res, next) => {
  try {
    const { username, email, password, age } = req.body;

    const user = await registerUser({ username, email, password, age });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    next(error);
  }
};

// recives http req, reads email and pwd. calls loginUser from service layer.
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// recives http req, reads user id from url params. finds user by id and returns public info about user.
export const getUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ publicId: id }).select('-passwordHash -passwordSalt -_id -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate weekly Elo rating change and recent games
    const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));


    // Find the latest games where this user participated (all statuses)
    const recentGames = await Game.find({
      players: { $elemMatch: { type: 'registered', id } }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id status variant winner finalScores createdAt completedAt');

  // Calculate weekly Elo rating change by summing Elo from completed games in the past week
    const weeklyGames = await Game.find({
      status: 'completed',
      completedAt: { $gte: oneWeekAgo },
      players: { $elemMatch: { type: 'registered', id } }
    })
      .select('eloDeltas');

  
// Sum up the Elo rating changes for the user from the weekly games
    const weeklyEloRatingChange = weeklyGames.reduce((sum, game) => {
      const userDelta = (game.eloDeltas || []).find(delta => delta.userId === id);
      return sum + (userDelta ? userDelta.delta : 0);
    }, 0);

    // Last 30 day results should be based on all completed games in the period,
    // not only the latest 10 games returned in recentGames.
    const monthCompletedGames = await Game.find({
      status: 'completed',
      createdAt: { $gte: thirtyDaysAgo },
      players: { $elemMatch: { type: 'registered', id } }
    })
      .select('winner');

    const monthWins = monthCompletedGames.filter(game => String(game.winner) === String(id)).length;
    const monthLosses = monthCompletedGames.length - monthWins;

    const completedGames = await Game.find({
      status: 'completed',
      players: { $elemMatch: { type: 'registered', id } }
    })
      .select('variant eloDeltas');

    const eloByTimeControl = {
      3: 1200,
      10: 1200,
      30: 1200
    };

    for (const game of completedGames) {
      const control = Number(game.variant?.timePerRound);
      if (![3, 10, 30].includes(control)) continue;
      const userDelta = (game.eloDeltas || []).find(delta => String(delta.userId) === String(id));
      if (userDelta) {
        eloByTimeControl[control] += Number(userDelta.delta) || 0;
      }
    }

    res.status(200).json({
      user: {
        ...toPublicUser(user),
        weeklyEloRatingChange,
        last30Days: {
          wins: monthWins,
          losses: monthLosses,
          total: monthCompletedGames.length,
        },
        eloByTimeControl,
        recentGames: recentGames.map(game => ({
          id: String(game._id),
          status: game.status,
          variant: game.variant,
          winner: game.winner,
          finalScores: game.finalScores,
          createdAt: game.createdAt,
          completedAt: game.completedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};


// recives http req, reads user id from url params. reads email, age and pwd from body. updates user with new info and returns updated public info about user.
export const updateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { email, password, age, appearancePreferences } = req.body;
    const updates = {};

    // Only allow email, age, and pwd updates
    if (email !== undefined) updates.email = email;
    if (age !== undefined) updates.age = age;
    if (appearancePreferences !== undefined) updates.appearancePreferences = appearancePreferences;

    // Hash pwd before storing if provided
    if (password !== undefined) {
      updates.passwordHash = hashpwd(password);
      updates.passwordSalt = 'app-salt-env';
    }

    // Update user and return new public info
    const user = await User.findOneAndUpdate({ publicId: id }, updates, { new: true })
      .select('-passwordHash -passwordSalt -_id -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
};


// a protected route that requires authentication and returns user role
export const protectedController = async (req, res) => {
  res.status(200).json({
    message: 'Access granted',
    userRole: req.userRole,
  });
};

// Builds query settings for "list users"
export const listUsersController = async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;
    const { q, userType, isBanned, sort = '-createdAt' } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (userType) {
      filter.userType = userType;
    }

    if (isBanned !== undefined) {
      filter.isBanned = isBanned === 'true';
    }

    // Build sort object for query
    const sortObj = sort.startsWith('-') ? { [sort.substring(1)]: -1 } : { [sort]: 1 };
    const skip = (page - 1) * limit;

    // gets paginates users list for admins
    const users = await User.find(filter)
      .select('-passwordHash -passwordSalt -_id -__v')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    // returns paginated data, metadate and error handeling
    res.status(200).json({
      users: users.map(toPublicUser),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


// a controller that bans or unbans a user
export const banUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { isBanned = true } = req.body;

    const user = await User.findOneAndUpdate(
      { publicId: id },
      { isBanned: Boolean(isBanned) },
      { new: true }
    ).select('-passwordHash -passwordSalt -_id -__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user: toPublicUser(user)
    });
  } catch (error) {
    next(error);
  }
};
