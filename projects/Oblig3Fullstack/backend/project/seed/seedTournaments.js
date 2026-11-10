import Tournament from '../models/Tournament.js';
import TournamentComment from '../models/TournamentComment.js';
import { tournamentSeriesNames } from './constants.js';
import { randomItem, randomVariant } from './helpers.js';

/**
 * this seeds fake tournaments and fake comments.
 * It creates and ampty participant array. creates a picked set then keep randomly choosing user
 *  indexes untill it had 8 uniwue users.
 * 
 * 
 */

export async function seedTournaments(admin, users) {
  const tournaments = [];

  for (let i = 1; i <= 8; i += 1) {
    const participants = [];
    const picked = new Set();

    while (participants.length < 8) {
      const idx = Math.floor(Math.random() * users.length);
      if (!picked.has(idx)) {
        picked.add(idx);
        participants.push(users[idx]._id);
      }
    }

    const tournament = await Tournament.create({
      title: `Tournament #${i} - ${randomItem(tournamentSeriesNames)} Series`,
      description: '8-player knockout tournament',
      variant: randomVariant(),
      status: randomItem(['upcoming', 'active', 'completed']),
      startDate: new Date(Date.now() + i * 86400000),
      maxParticipants: 8,
      participants,
      trophy: {
        title: `Trophy for Tournament #${i}`,
        imageUrl: 'https://example.com/trophy.png'
      },
      createdBy: admin._id
    });

    tournaments.push(tournament);
  }

  return tournaments;
}

/**
 * this creates 12 tournament comments
 * loops 12 times, picks a random tournament and random user then creates a comment.
 */
export async function seedTournamentComments(tournaments, users) {
  for (let i = 0; i < 12; i += 1) {
    const tournament = randomItem(tournaments);
    const commenter = randomItem(users);

    await TournamentComment.create({
      tournamentId: tournament._id,
      author: { type: commenter.userType === 'admin' ? 'admin' : 'registered', id: commenter.publicId },
      content: 'GG EZ! Looking forward to the next one.'
    });
  }
}
