
/**
 * This sets dynamic matchmaking on a time frame. the longer the wait the more leanient the
 *  matchmaking based on ELO becomes
 */
const ELO_TIERS = [
  { maxWaitSec: 30, window: 50 },
  { maxWaitSec: 60, window: 150 },
  { maxWaitSec: 120, window: 300 }
];

/**
 * This checks if the players are annonymus or if they are registers players
 *  This is done to make sure that anonymus players can only play against othe anonymus players
 */
export function arePlayersCompatible(existingPlayers, joiningPlayer) {
  const hasAnonymousPlayer = existingPlayers.some(player => player.type === 'anonymous');
  const hasRegisteredPlayer = existingPlayers.some(player => player.type === 'registered');

  if (joiningPlayer.type === 'anonymous') {
    return !hasRegisteredPlayer;
  }

  return !hasAnonymousPlayer;
}

/**
 * makes a mongoDB query filter object from optional URL query params.
 *  It conditionally adds: status, variant.rounds, variants.straightsAllowed, variant.timePerRound.
 * This is used by game list endponts so filtering logic is reusable.
 */
export function buildGameFilter({ status, rounds, straightsAllowed, timePerRound }) {
  const filter = {};

  if (status) filter.status = status;
  if (rounds) filter['variant.rounds'] = parseInt(rounds);
  if (straightsAllowed !== undefined) filter['variant.straightsAllowed'] = straightsAllowed === 'true';
  if (timePerRound) filter['variant.timePerRound'] = parseInt(timePerRound);

  return filter;
}

/**
 * this convers wait time to allowed ELO diffrence
 * it converts milliseconds to seconds, find first tier where waitSec is less than tier max
 *  return the tier window. If no tier matches, then it returns infinity. 
 *  so if you wait long it stops enforcing ELO diffence
 */
function getEloWindow(waitMs) {
  const waitSec = waitMs / 1000;
  const tier = ELO_TIERS.find(t => waitSec < t.maxWaitSec);
  return tier ? tier.window : Infinity;
}

/**
 * this finds the best pending game the user can join
 * it loads ppending games with matchching variant settings, sotrs oldest first.
 * For each pending game it gets the creator(first player), skip invalid entries, skips games made by the same user
 *  fetches creator user to get creator ELO, computes current allowed ELO window,
 *  ComparesnELO gap agains allowed window then returns first compatible game.
 * Returns null if there are none are compatible
 */
export async function findCompatiblePendingGame({ Game, User, userId, variant, userElo }) {
  const pendingGames = await Game.find({
    status: 'pending',
    'variant.rounds': variant.rounds,
    'variant.straightsAllowed': variant.straightsAllowed,
    'variant.timePerRound': variant.timePerRound
  }).sort({ createdAt: 1 });

  const now = Date.now();

  for (const pendingGame of pendingGames) {
    const creator = pendingGame.players[0];
    if (!creator || creator.type !== 'registered') continue;
    if (String(creator.id) === String(userId)) continue;

    const creatorUser = await User.findOne({ publicId: String(creator.id) });
    if (!creatorUser) continue;

    const eloWindow = getEloWindow(now - pendingGame.createdAt.getTime());
    const eloDiff = Math.abs(userElo - creatorUser.eloRating);
    if (eloWindow !== Infinity && eloDiff > eloWindow) continue;

    return pendingGame;
  }

  return null;
}
