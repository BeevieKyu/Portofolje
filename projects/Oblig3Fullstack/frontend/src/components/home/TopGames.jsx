import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlayerMap, avgElo } from "../../utils/playerUtils";

export default function TopGames({ games = [] }) {
  const [playerMap, setPlayerMap] = useState({});

  useEffect(() => {
    if (!games.length) return;
    fetchPlayerMap(games).then(setPlayerMap);
  }, [games]);

  if (!Array.isArray(games) || games.length === 0) {
    return <p>No games running.</p>;
  }

  return (
    <ul className="preview-list">
      {games.map(game => {
        const players = game.players ?? [];
        const avg = avgElo(players, playerMap);
        const gameId = game._id ?? game.id;
        return (
          <li key={gameId} className="preview-item">
            <Link to={`/game/${gameId}`}>
              <div>
                <strong>
                  {game.variant?.rounds}R · {game.variant?.timePerRound}s · Straights {game.variant?.straightsAllowed ? "on" : "off"}
                </strong>
                <p>
                  {players.length
                    ? players.map(p =>
                        p.type === "registered"
                          ? (playerMap[String(p.id)]?.username ?? String(p.id).slice(0, 8))
                          : "Guest"
                      ).join(" vs ")
                    : "No players yet"
                  }
                  {avg != null && ` · Avg Elo: ${avg}`}
                </p>
              </div>
              <span className="watch-label">Watch</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
