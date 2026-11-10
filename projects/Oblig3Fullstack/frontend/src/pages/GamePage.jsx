import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { AppearanceContext } from "../context/AppearanceContext";
import StatusBadge from "../components/StatusBadge";
import "../styles/game-page.css";

const POLL_INTERVAL = 15_000;

function PlayerCard({ player, label, isWinner, elo, username }) {
  const displayName = player.type === "anonymous"
    ? "Guest"
    : (username ?? String(player.id).slice(0, 16));
  return (
    <div className={`player-card ${isWinner ? "player-winner" : ""}`}>
      <span className="player-label">{label}</span>
      <span className="player-type">{player.type === "anonymous" ? "Guest" : "Registered"}</span>
      <span className="player-id">{displayName}</span>
      {elo !== undefined && <span className="player-elo">{elo} Elo</span>}
      {isWinner && <span className="winner-tag">🏆</span>}
    </div>
  );
}

function CommentList({ comments }) {
  if (!comments.length) {
    return <p className="no-comments">No comments yet. Be the first!</p>;
  }
  return (
    <ul className="comment-list">
      {comments.map(c => (
        <li key={c._id} className="comment-item">
          <div className="comment-meta">
            <span className="comment-author">{c.authorName ?? c.author?.username ?? String(c.author?.id ?? "unknown").slice(0, 12)}</span>
            <span className="comment-time">
              {new Date(c.createdAt).toLocaleString(undefined, {
                month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
              })}
            </span>
          </div>
          <p className="comment-text">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}

export default function GamePage() {
  const { id } = useParams();
  const { user: loggedInUser } = useAuth();
  const { boardColor } = useContext(AppearanceContext);

  const [game, setGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState(null);

  const [playerElos, setPlayerElos] = useState({});
  const [playerNames, setPlayerNames] = useState({});

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [commentPosting, setCommentPosting] = useState(false);

  const pollRef = useRef(null);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games/${id}`);
        if (!res.ok) throw new Error("Game not found");
        const data = await res.json();
        setGame(data);
        setGameError(null);
      } catch (e) {
        setGameError(e.message);
      } finally {
        setGameLoading(false);
      }
    }

    async function fetchComments() {
      try {
        const res = await fetch(`/api/games/${id}/comments?limit=50&sort=-createdAt`);
        if (!res.ok) return;
        const data = await res.json();
        setComments(data.comments ?? []);
      } finally {
        setCommentsLoading(false);
      }
    }

    fetchGame();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (!game?.players?.length) return;
    async function fetchElos() {
      const eloMap = {};
      const nameMap = {};
      for (const player of game.players) {
        if (player.type === "registered") {
          try {
            const res = await fetch(`/api/users/${player.id}`);
            if (res.ok) {
              const data = await res.json();
              eloMap[player.id] = data.user?.eloRating;
              nameMap[player.id] = data.user?.username;
            }
          } catch {
            void 0;
          }
        }
      }
      setPlayerElos(eloMap);
      setPlayerNames(nameMap);
    }
    fetchElos();
  }, [game?.players]);

  useEffect(() => {
    if (!game) return;
    
    if (game.status === "pending") {
      const pollFetchGame = async () => {
        try {
          const res = await fetch(`/api/games/${id}`);
          if (!res.ok) throw new Error("Game not found");
          const data = await res.json();
          setGame(data);
        } catch (e) {
          setGameError(e.message);
        }
      };
      
      pollRef.current = setInterval(pollFetchGame, POLL_INTERVAL);
    } else {
      clearInterval(pollRef.current);
    }
    
    return () => clearInterval(pollRef.current);
  }, [game, id]);

  async function handleComment(e) {
    e.preventDefault();
    setCommentError(null);

    if (!loggedInUser) {
      setCommentError("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setCommentPosting(true);
    try {
      const res = await fetch(`/api/games/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "user",
        },
        body: JSON.stringify({
          author: { type: "registered", id: loggedInUser.id },
          content: commentText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.error ?? data.message ?? "Failed to post comment.");
        return;
      }
      setComments(prev => [data.comment, ...prev]);
      setCommentText("");
    } catch {
      setCommentError("Could not reach the server.");
    } finally {
      setCommentPosting(false);
    }
  }

  if (gameLoading) return <div className="game-page"><p className="game-state">Loading game…</p></div>;
  if (gameError)   return <div className="game-page"><p className="game-state game-error">{gameError}</p></div>;

  const { variant, players, status, winner, createdAt } = game;
  const player1 = players?.[0];
  const player2 = players?.[1];

  return (
    <div className="game-page">

      <div className="game-topbar">
        <div>
          <h1 className="game-title">
            {variant?.rounds} Rounds · {variant?.timePerRound}s · Straights {variant?.straightsAllowed ? "on" : "off"}
          </h1>
          <p className="game-date">
            Created {new Date(createdAt).toLocaleString(undefined, {
              month: "long", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="game-layout">

        <main className="game-main">

          <div className="players-row">
            {player1
              ? (
                <PlayerCard
                  player={player1}
                  label="Player 1"
                  isWinner={winner && String(winner) === String(player1.id)}
                  elo={playerElos[player1.id]}
                  username={playerNames[player1.id]}
                />
              )
              : <div className="player-card player-empty">Waiting…</div>
            }
            <span className="vs-divider">vs</span>
            {player2
              ? (
                <PlayerCard
                  player={player2}
                  label="Player 2"
                  isWinner={winner && String(winner) === String(player2.id)}
                  elo={playerElos[player2.id]}
                  username={playerNames[player2.id]}
                />
              )
              : <div className="player-card player-empty">Waiting…</div>
            }
          </div>

          <div className="board-area" style={{ background: boardColor }}>
            {status === "pending" && !player2 && (
              <div className="board-overlay">
                <p className="overlay-title">Waiting for an opponent</p>
                <p className="overlay-sub">Page refreshes every 15 seconds</p>
              </div>
            )}
            {status === "pending" && player2 && (
              <div className="board-overlay">
                <p className="overlay-title">Game is full</p>
                <p className="overlay-sub">Both players have joined — starting soon</p>
              </div>
            )}
            {status === "active" && (
              <p className="board-placeholder">Game board coming soon</p>
            )}
            {status === "completed" && (
              <p className="board-placeholder">This game has ended</p>
            )}
          </div>
        </main>

        <aside className="game-sidebar">
          <h2 className="sidebar-heading">Comments</h2>

          {loggedInUser ? (
            <form className="comment-form" onSubmit={handleComment}>
              <input
                className="comment-author-input"
                type="text"
                placeholder="Your username"
                value={loggedInUser.username}
                disabled
              />
              <textarea
                className="comment-textarea"
                placeholder="Leave a comment…"
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                maxLength={500}
              />
              {commentError && <p className="comment-error">{commentError}</p>}
              <button className="comment-submit" type="submit" disabled={commentPosting}>
                {commentPosting ? "Posting…" : "Post"}
              </button>
            </form>
          ) : (
            <div className="comment-form comment-login-prompt">
              <p>Sign in to leave a comment</p>
            </div>
          )}

          <div className="comments-section">
            {commentsLoading
              ? <p className="no-comments">Loading…</p>
              : <CommentList comments={comments} />
            }
          </div>
        </aside>
      </div>
    </div>
  );
}
