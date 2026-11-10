import User from '../models/User.js';
import { hashpwd } from '../utils/hash.js';
import { generateUsername } from './helpers.js';

/**
 * creates one admin user with fixed values. this makes it predictable for testing.
 */
export async function seedUsers() {
  const admin = await User.create({
    username: 'admin_user',
    email: 'admin@poker.test',
    passwordHash: hashpwd('admin123'),
    passwordSalt: 'app-salt-env',
    age: 35,
    userType: 'admin',
    eloRating: 2000,
    totalMatches: 100,
    totalWins: 65,
    winPercentage: 65
  });

  /**
   * creates an enpty users array first, then loops from 1 to 30
   * for each user it generates fake stats.
   */
  const users = [];
  for (let i = 1; i <= 30; i += 1) {
    const totalMatches = Math.floor(Math.random() * 80);
    const totalWins = totalMatches === 0 ? 0 : Math.floor(Math.random() * (totalMatches + 1));
    const winPercentage = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    /**
     * generates a username, email is player +index then @poker.test.
     */
    const user = await User.create({
      username: generateUsername(i),
      email: `player${i}@poker.test`,
      passwordHash: hashpwd('password123'),
      passwordSalt: 'app-salt-env',
      age: 18 + Math.floor(Math.random() * 40),
      userType: 'registered',
      eloRating: 1000 + Math.floor(Math.random() * 1200),
      totalMatches,
      totalWins,
      winPercentage
    });

    users.push(user);
  }

  return { admin, users };
}
