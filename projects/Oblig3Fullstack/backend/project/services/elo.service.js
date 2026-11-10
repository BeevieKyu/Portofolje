const ELO_K_FACTOR = 32;


/**
 * this file contains rating and stat update logic for completed games.
 * it calculate expected ELO outcome between two platers
 *  and update player stats and ratings after a
 */

/**
 * takes two player ratings and returns expectes score for player A
 */
export function calculateExpectedScore(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

/**
 * this is the main fucntion of the file.
 * it recives the user documents involed in the result and the winnerID(public id)
 * 
 * foe each user:
 *  checks wheather this user is the winner, increases totalMatches by 1, if winner increase totalWins
 *  recalculates winPrecentage and resets eloRatingChange to 0
 * 
 * it only apply ELO for 2 users since this is designed for a 1v1 match.
 * 
 * It determinds who won by checking the winner ID
 * 
 * each player has expected result and actual result
 *  so if you do better than expected you gain point
 *  if you do worse you loose points. the more supricing the result the bigger the change.
 * 
 * Then it updates both users.
 */
export function applyEloAndStatsUpdates(users, winnerId) {
  for (const user of users) {
    const isWinner = String(user.publicId) === String(winnerId);
    user.totalMatches += 1;
    if (isWinner) user.totalWins += 1;
    user.winPercentage = user.totalMatches > 0
      ? Math.round((user.totalWins / user.totalMatches) * 10000) / 100
      : 0;
    user.eloRatingChange = 0;
  }

  if (users.length !== 2) {
    return [];
  }

  const [playerA, playerB] = users;
  const playerAIsWinner = String(playerA.publicId) === String(winnerId);
  const playerBIsWinner = String(playerB.publicId) === String(winnerId);

  if (!playerAIsWinner && !playerBIsWinner) {
    return [];
  }

  const expectedA = calculateExpectedScore(playerA.eloRating, playerB.eloRating);
  const expectedB = calculateExpectedScore(playerB.eloRating, playerA.eloRating);
  const actualA = playerAIsWinner ? 1 : 0;
  const actualB = playerBIsWinner ? 1 : 0;

  const deltaA = Math.round(ELO_K_FACTOR * (actualA - expectedA));
  const deltaB = Math.round(ELO_K_FACTOR * (actualB - expectedB));

  playerA.eloRating += deltaA;
  playerB.eloRating += deltaB;
  playerA.eloRatingChange = deltaA;
  playerB.eloRatingChange = deltaB;

  return [
    { userId: String(playerA.publicId), delta: deltaA },
    { userId: String(playerB.publicId), delta: deltaB }
  ];
}
