import mongoose from 'mongoose';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Tournament from '../models/Tournament.js';
import Comment from '../models/Comment.js';
import TournamentComment from '../models/TournamentComment.js';
import { seedUsers } from './seedUsers.js';
import { seedGames, seedGameComments } from './seedGames.js';
import { seedTournaments, seedTournamentComments } from './seedTournaments.js';


/**
 * the main job for this file is to cordinate the seeding process in the correct order.
 * it also cleares the old seed data everytime you run it to make sure the seed is repetable.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/spanish_poker';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    await User.deleteMany({});
    await Game.deleteMany({});
    await Tournament.deleteMany({});
    await Comment.deleteMany({});
    await TournamentComment.deleteMany({});

    const { admin, users } = await seedUsers();
    const games = await seedGames(users);
    await seedGameComments(games, users);
    const tournaments = await seedTournaments(admin, users);
    await seedTournamentComments(tournaments, users);

    console.log('Database seeding complete.');
    console.log(`Users: ${users.length + 1}, Games: ${games.length}, Tournaments: ${tournaments.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

connectDB().then(seedDatabase);
