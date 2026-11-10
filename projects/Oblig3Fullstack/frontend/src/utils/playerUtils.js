/**
 * Utility functions for player data operations
 */

/**
 * Fetches user data for all registered players in a list of games
 * @param {Array} games - Array of game objects
 * @returns {Promise<Object>} Map of user ID to user data
 */
export async function fetchPlayerMap(games) {
  const ids = [...new Set(
    (games ?? [])
      .flatMap(g => g.players ?? [])
      .filter(p => p.type === "registered")
      .map(p => String(p.id))
  )];

  const map = {};
  await Promise.all(ids.map(async id => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        map[id] = data.user;
      }
    } catch {
      // Silently fail if user data can't be fetched
      void 0;
    }
  }));

  return map;
}

/**
 * Calculates average Elo rating for a list of players
 * @param {Array} players - Array of player objects
 * @param {Object} playerMap - Map of user ID to user data
 * @returns {number|null} Average Elo rating or null if no valid ratings found
 */
export function avgElo(players, playerMap) {
  const elos = (players ?? [])
    .filter(p => p.type === "registered" && playerMap[String(p.id)]?.eloRating != null)
    .map(p => playerMap[String(p.id)].eloRating);

  if (!elos.length) return null;

  return Math.round(elos.reduce((a, b) => a + b, 0) / elos.length);
}

/**
 * Gets the display name for a player
 * @param {Object} player - Player object
 * @param {Object} playerMap - Map of user ID to user data
 * @returns {string} Display name (Guest or username or user ID)
 */
export function getDisplayName(player, playerMap) {
  if (player.type === "anonymous") return "Guest";
  return playerMap[String(player.id)]?.username ?? String(player.id).slice(0, 8);
}
