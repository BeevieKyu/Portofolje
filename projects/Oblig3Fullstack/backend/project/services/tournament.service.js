
/**
 * makes a mongoDB query filter object from optional URL query params.
 *  It conditionally adds: status, variant.rounds, variants.straightsAllowed, variant.timePerRound.
 * This is used by tournament list endponts so filtering logic is reusable.
 */
export function buildTournamentFilter({ status, rounds, straightsAllowed, timePerRound }) {
  const filter = {};
  if (status) filter.status = status;
  if (rounds) filter['variant.rounds'] = parseInt(rounds);
  if (straightsAllowed !== undefined) filter['variant.straightsAllowed'] = straightsAllowed === 'true';
  if (timePerRound) filter['variant.timePerRound'] = parseInt(timePerRound);
  return filter;
}

/**
 * creates tound 1 bracket from participant IDs
 * pairs players 2 by 2 into matches.
 * If there is an odd number of players, last one gets a bye match. meaning they automatically asvance
 * Then it returns an array containing one round object with roundNumber 1 and match list.
 */
export function generateBracket(participants) {
  const matches = [];

  for (let i = 0; i < participants.length; i += 2) {
    if (i + 1 < participants.length) {
      matches.push({ player1: participants[i], player2: participants[i + 1], status: 'pending' });
    } else {
      matches.push({ player1: participants[i], player2: null, winner: participants[i], status: 'bye' });
    }
  }

  return [{ roundNumber: 1, matches }];
}

/**
 *  creates the next round from the list of winners
 * it pairs players again and handle all matches with a bye
 */
export function buildNextRoundMatches(players) {
  const matches = [];

  for (let i = 0; i < players.length; i += 2) {
    const player1 = players[i];
    const player2 = i + 1 < players.length ? players[i + 1] : null;

    if (player2) {
      matches.push({ player1, player2, status: 'pending' });
    } else {
      matches.push({ player1, player2: null, winner: player1, status: 'bye' });
    }
  }

  return matches;
}

/**
 * Gets the winner IDs from a roundm both completed matches and bye matches.
 */
export function getRoundWinners(round) {
  const winners = [];

  for (const match of round.matches) {
    if (match.status === 'bye' && match.winner) winners.push(match.winner);
    if (match.status === 'completed' && match.winner) winners.push(match.winner);
  }

  return winners;
}

/**
 * This accepts a winner ID from a req and normalixes it into internal Mongo user ID when needed.
 * 
 * Loada player documents for match.player1 and same for player 2
 * bulds two allow-lists, internal IDs and public IDs
 * if the winner matches a public ID it converts it into corresponding internal_id.
 */
export async function resolveTournamentWinnerId({ User, match, winnerId }) {
  const playersById = await User.find({ _id: { $in: [match.player1, match.player2].filter(Boolean) } })
    .select('publicId');

  const allowedWinnerInternalIds = [String(match.player1), String(match.player2)];
  const allowedWinnerPublicIds = playersById.map(player => String(player.publicId));

  let resolvedWinnerId = String(winnerId);
  if (allowedWinnerPublicIds.includes(resolvedWinnerId)) {
    const matchedPlayer = playersById.find(player => String(player.publicId) === resolvedWinnerId);
    resolvedWinnerId = String(matchedPlayer._id);
  }

  return { resolvedWinnerId, allowedWinnerInternalIds };
}

/**
 * adds tournament tropphy to winner profile.
 * it fins winner user by internal ID
 * checks if trophy already exists for this tournament
 * pushes trophy object: tournamentID, tournamentName, trophyTitle and trophyimageUrl
 * then it saves user.
 */
async function awardTournamentTrophy({ tournament, winnerId, User }) {
  const winnerUser = await User.findById(winnerId);
  if (!winnerUser) return;

  const alreadyAwarded = winnerUser.trophies.some(
    t => String(t.tournamentId) === String(tournament._id)
  );

  if (alreadyAwarded) return;

  winnerUser.trophies.push({
    tournamentId: tournament._id,
    tournamentName: tournament.title,
    trophyTitle: tournament.trophy?.title || `${tournament.title} Winner`,
    trophyImageUrl: tournament.trophy?.imageUrl || ''
  });
  await winnerUser.save();
}

/**
 * progression logic after a match result is recorded.
 * 
 * checks if every match in the current round is resolved, if not stop.
 * collects winners for this round, if next rounf alredy exists it stops.
 * if there is only one winner, mark tournament completed, set tournament winner and award trophy.
 * If more than one winner, push a new-next round object built from winners
 */
export async function advanceTournamentIfRoundResolved({ tournament, roundNumber, round, User }) {
  const allResolved = round.matches.every(m => m.status === 'completed' || m.status === 'bye');
  if (!allResolved) return;

  const winners = getRoundWinners(round);
  const hasNextRound = tournament.bracket.some(r => r.roundNumber === roundNumber + 1);

  if (hasNextRound) return;

  if (winners.length === 1) {
    tournament.status = 'completed';
    tournament.winner = winners[0];
    await awardTournamentTrophy({ tournament, winnerId: winners[0], User });
    return;
  }

  if (winners.length > 1) {
    tournament.bracket.push({
      roundNumber: roundNumber + 1,
      matches: buildNextRoundMatches(winners)
    });
  }
}
