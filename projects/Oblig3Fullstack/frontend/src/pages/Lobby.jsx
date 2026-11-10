import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppearanceContext } from "../context/AppearanceContext";
import { useAuth } from "../context/useAuth";
import { getGuestId } from "../utils/authUtils";
import { fetchPlayerMap } from "../utils/playerUtils";
import "../styles/lobby.css";

function formatVariant(variant) {
  if (!variant) return "—";
  const straights = variant.straightsAllowed ? "Straights on" : "Straights off";
  return `${variant.rounds} rounds · ${variant.timePerRound}s · ${straights}`;
}

export default function Lobby() {
  const { lobbyPreviewCount } = useContext(AppearanceContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userElo, setUserElo] = useState(null);

  async function handleJoin(gameId) {
    let player;
    if (user) {
      player = { type: "registered", id: user.id };
    } else {
      player = { type: "anonymous", id: getGuestId() };
    }

    await fetch(`/api/games/${gameId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player }),
    }).catch(() => {});
    navigate(`/game/${gameId}`);
  }
  const [games, setGames] = useState([]);
  const [playerMap, setPlayerMap] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setUserElo(null);
      return;
    }

    fetch(`/api/users/${user.id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user?.eloRating != null) {
          setUserElo(Number(data.user.eloRating));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/games?status=pending&page=${page}&limit=${lobbyPreviewCount}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        const all = data.games ?? [];
        const visible = all.filter(game => {
          const creator = game.players?.[0];
          const prefs = game.matchPreferences ?? {};

          if (!user && creator?.type === "registered" && prefs.allowAnonymous === false) return false;
          if (user && game.players?.some(p => String(p.id) === String(user.id))) return false;

          if (user && creator?.type === "registered" && userElo != null) {
            if (prefs.minElo != null && Number(userElo) < Number(prefs.minElo)) return false;
            if (prefs.maxElo != null && Number(userElo) > Number(prefs.maxElo)) return false;
          }

          return true;
        });
        setGames(visible);
        setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError("Could not load games. Is the backend running?");
        }
      })
      .finally(() => setLoading(false));
    
    return () => controller.abort();
  }, [page, lobbyPreviewCount, user, userElo]);

  useEffect(() => {
    if (!games.length) return;
    fetchPlayerMap(games).then(setPlayerMap);
  }, [games]);

  return (
    <div className="lobby">
      <div className="lobby-header">
        <div>
          <h1>Lobby</h1>
          <p className="lobby-subtitle">Open games waiting for a second player</p>
        </div>
        <Link to="/create-game" className="create-btn">Create Game</Link>
      </div>

      {loading && <p className="lobby-state">Loading games…</p>}
      {error && <p className="lobby-state lobby-error">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className="lobby-state">No open games available. <Link to="/create-game">Create one?</Link></p>
      )}

      {!loading && !error && games.length > 0 && (
        <>
          <div className="lobby-table">
            <div className="lobby-table-head">
              <span>Variant</span>
              <span>Created by</span>
              <span>Waiting since</span>
              <span></span>
            </div>

            {games.map(game => (
              <div key={game._id} className="lobby-row">
                <span className="lobby-variant">{formatVariant(game.variant)}</span>
                <span className="lobby-players">
                  {game.players?.map(p =>
                    p.type === "registered"
                      ? (playerMap[String(p.id)]?.username ?? String(p.id).slice(0, 8))
                      : "Guest"
                  ).join(", ") || "—"}
                </span>
                <span className="lobby-time">
                  {new Date(game.createdAt).toLocaleString(undefined, {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
                <button className="join-btn" onClick={() => handleJoin(game._id)}>Join</button>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="lobby-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span>{page} / {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}

          <p className="lobby-total">{pagination.total} open game{pagination.total !== 1 ? "s" : ""}</p>
        </>
      )}
    </div>
  );
}
