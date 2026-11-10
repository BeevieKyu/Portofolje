import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { fetchPlayerMap, avgElo } from "../../utils/playerUtils";
import { getGuestId } from "../../utils/authUtils";

export default function LobbyPreview({ games = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playerMap, setPlayerMap] = useState({});

  useEffect(() => {
    if (!games.length) return;
    fetchPlayerMap(games).then(setPlayerMap);
  }, [games]);

  async function handleJoin(gameId) {
    const player = user
      ? { type: "registered", id: user.id }
      : { type: "anonymous", id: getGuestId() };

    try {
      await fetch(`/api/games/${gameId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player }),
      });
    } catch {
      void 0;
    }
    navigate(`/game/${gameId}`);
  }

  if (!Array.isArray(games) || games.length === 0) {
    return <p>No games available right now.</p>;
  }

  return (
    <ul className="preview-list">
      {games.map(game => {
        const players = game.players ?? [];
        const avg = avgElo(players, playerMap);
        const gameId = game._id ?? game.id;
        return (
          <li key={gameId} className="preview-item">
            <button onClick={() => handleJoin(gameId)}>
              <strong>
                {game.variant?.rounds}R · {game.variant?.timePerRound}s · Straights {game.variant?.straightsAllowed ? "on" : "off"}
              </strong>
              <p>
                {players.length
                  ? players.map(p =>
                      p.type === "registered"
                        ? (playerMap[String(p.id)]?.username ?? String(p.id).slice(0, 8))
                        : "Guest"
                    ).join(", ")
                  : "No players yet"
                }
                {avg != null && ` · Avg Elo: ${avg}`}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
