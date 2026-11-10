import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import "../styles/profile.css";

export default function AllUserGames() {
  const { id } = useParams();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchUserAndGames() {
      try {
        const userRes = await fetch(`/api/users/${id}`);
        if (!userRes.ok) throw new Error("User not found");
        const userdata = await userRes.json();
        setUserData(userdata.user);

        let allGames = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const gamesRes = await fetch(`/api/games?page=${page}&limit=50`);
          if (!gamesRes.ok) throw new Error("Could not fetch games");
          const gamesData = await gamesRes.json();
          
          if (gamesData.games && gamesData.games.length > 0) {
            allGames = allGames.concat(gamesData.games);
            page++;
            hasMore = page <= gamesData.pagination.pages;
          } else {
            hasMore = false;
          }
        }

        const userGames = allGames.filter(game => 
          game.players && game.players.some(player => player.id === id)
        );

        setGames(userGames);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndGames();
  }, [id]);

  if (loading) {
    return <div className="profile-page"><p>Loading games...</p></div>;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">Error: {error}</div>
        <Link to={`/profile/${id}`} style={{ marginTop: "1rem", display: "block" }}>
          ← Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Link to={`/profile/${id}`} style={{ marginBottom: "1.5rem", display: "inline-block", color: "var(--accent)" }}>
        ← Back to Profile
      </Link>
      <div style={{ marginBottom: "2rem" }}>
        <h1>{userData?.username}'s Games</h1>
        <p style={{ color: "var(--text)", marginBottom: 0 }}>
          Total games: <strong>{games.length}</strong>
        </p>
      </div>

      {games.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text)" }}>
          <p>No games found for this user.</p>
        </div>
      ) : (
        <div className="games-list">
          {games.map((game) => (
            <Link
              key={game._id}
              to={`/game/${game._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="game-card">
                <div className="game-status">
                  <StatusBadge status={game.status} />
                </div>

                <div className="game-info">
                  <p className="game-variant">
                    Best of {game.variant.rounds}, {game.variant.straightsAllowed ? "Straights Allowed" : "No Straights"}, {game.variant.timePerRound}s per round
                  </p>
                  <p className="game-date">
                    {new Date(game.createdAt).toLocaleDateString()} - {new Date(game.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="game-result">
                  {game.status === "completed" ? (
                    <>
                      {game.winner === id ? (
                        <span className="win">WIN</span>
                      ) : (
                        <span className="loss">LOSS</span>
                      )}
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
