import Game from '../models/Game.js';
import Comment from '../models/Comment.js';
import { gameComments } from './constants.js';
import { randomItem, randomVariant } from './helpers.js';

/**
 * this file is responsible for seeding completed games and comments into the db
 * It staets with an empty array(games), loops it 40 times, picks a random user as player 1 and 2
 * repete untill player 2 is not the same as player 1.
 * randomly picks one as the winner and finale scores.
 * then creates a game document is Mongodb, pushes that created game into the games array
 * after the loop it returns the array of created games.
 * 
 * This is useful for leaderbord data, recent game history, profile stats and testing completed-game endpoints.
 */
export async function seedGames(users) {
  const games = [];

  for (let i = 0; i < 40; i += 1) {
    const player1 = randomItem(users);
    let player2 = randomItem(users);
    while (player2.publicId === player1.publicId) {
      player2 = randomItem(users);
    }

    const winner = randomItem([player1.publicId, player2.publicId]);
    const score1 = randomItem([12, 15, 18]);
    const score2 = randomItem([10, 12, 14]);

    const game = await Game.create({
      players: [
        { type: 'registered', id: player1.publicId },
        { type: 'registered', id: player2.publicId }
      ],
      variant: randomVariant(),
      status: 'completed',
      winner,
      finalScores: { player1: score1, player2: score2 },
      startedAt: new Date(),
      completedAt: new Date()
    });

    games.push(game);
  }

  return games;
}

export async function seedGameComments(games, users) {
  for (let i = 0; i < 20; i += 1) {
    const game = randomItem(games);
    const commenter = randomItem(users);

    await Comment.create({
      gameId: game._id,
      author: { type: 'registered', id: commenter.publicId },
      content: randomItem(gameComments)
    });
  }
}
