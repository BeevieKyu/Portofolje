import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getGuestId } from "../utils/authUtils";
import "../styles/create-game.css";

export default function CreateGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    rounds: 5,
    straightsAllowed: true,
    timePerRound: 10,
    playerType: user ? "registered" : "anonymous",
    userId: user?.id ?? "",
    allowAnonymous: false,
    minElo: "",
    maxElo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.minElo !== "" && form.maxElo !== "" && Number(form.minElo) > Number(form.maxElo)) {
      setError("Minimum Elo cannot be greater than maximum Elo.");
      return;
    }

    const playerId = form.playerType === "anonymous"
      ? getGuestId()
      : form.userId.trim();

    if (form.playerType === "registered" && !playerId) {
      setError("Please enter your user ID.");
      return;
    }

    const body = {
      variant: {
        rounds: Number(form.rounds),
        straightsAllowed: form.straightsAllowed,
        timePerRound: Number(form.timePerRound),
      },
      players: [{ type: form.playerType, id: playerId }],
      matchPreferences: {
        allowAnonymous: isRegistered ? form.allowAnonymous : true,
        minElo: isRegistered && form.minElo !== "" ? Number(form.minElo) : null,
        maxElo: isRegistered && form.maxElo !== "" ? Number(form.maxElo) : null,
      },
    };

    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      navigate(`/game/${data.game._id}`);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const isRegistered = user && form.playerType === "registered";

  return (
    <div className="create-game">
      <div className="create-game-header">
        <h1>Create a Game</h1>
        <p className="create-game-subtitle">Configure your match and wait for an opponent</p>
      </div>

      <form className="create-game-form" onSubmit={handleSubmit}>

        <fieldset className="form-group">
          <legend>Rounds</legend>
          <div className="option-row">
            {[3, 5, 7].map(r => (
              <label key={r} className={`option-card ${form.rounds === r ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="rounds"
                  value={r}
                  checked={form.rounds === r}
                  onChange={() => set("rounds", r)}
                />
                {r}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-group">
          <legend>Time per round</legend>
          <div className="option-row">
            {[3, 10, 30].map(t => (
              <label key={t} className={`option-card ${form.timePerRound === t ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="timePerRound"
                  value={t}
                  checked={form.timePerRound === t}
                  onChange={() => set("timePerRound", t)}
                />
                {t}s
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-group">
          <legend>Straights</legend>
          <div className="option-row">
            {[true, false].map(v => (
              <label key={String(v)} className={`option-card ${form.straightsAllowed === v ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="straightsAllowed"
                  value={String(v)}
                  checked={form.straightsAllowed === v}
                  onChange={() => set("straightsAllowed", v)}
                />
                {v ? "Allowed" : "Disabled"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-group">
          <legend>Play as</legend>
          <div className="option-row">
            {["anonymous", "registered"].map(t => (
              <label key={t} className={`option-card ${form.playerType === t ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="playerType"
                  value={t}
                  checked={form.playerType === t}
                  onChange={() => set("playerType", t)}
                />
                {t === "anonymous" ? "Anonymous" : "Registered"}
              </label>
            ))}
          </div>
          {form.playerType === "anonymous" && (
            <p className="form-hint">A random guest ID will be generated for you.</p>
          )}
        </fieldset>

        {form.playerType === "registered" && (
          <div className="form-group">
            <label className="form-label" htmlFor="userId">Playing as</label>
            <input
              id="userId"
              className="form-input"
              type="text"
              placeholder="Enter your user ID"
              value={user ? (user.username ?? user.id) : form.userId}
              onChange={e => !user && set("userId", e.target.value)}
              readOnly={!!user}
            />
            {user && <p className="form-hint">Signed in as {user.username ?? user.id}</p>}
          </div>
        )}

        {isRegistered && (
          <fieldset className="form-group">
            <legend>Allow anonymous players to join</legend>
            <div className="option-row">
              {[true, false].map(v => (
                <label key={String(v)} className={`option-card ${form.allowAnonymous === v ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="allowAnonymous"
                    value={String(v)}
                    checked={form.allowAnonymous === v}
                    onChange={() => set("allowAnonymous", v)}
                  />
                  {v ? "Yes" : "No"}
                </label>
              ))}
            </div>
            <p className="form-hint">
              {form.allowAnonymous
                ? "Guest players will be able to join your game."
                : "Only registered players will be able to join your game."}
            </p>
          </fieldset>
        )}

        {isRegistered && (
          <div className="form-group">
            <label className="form-label">Preferred opponent Elo</label>
            <div className="elo-range-row">
              <div className="elo-range-field">
                <label className="elo-range-label" htmlFor="minElo">Min</label>
                <input
                  id="minElo"
                  className="form-input elo-input"
                  type="number"
                  min={0}
                  max={3000}
                  step={50}
                  placeholder="Any"
                  value={form.minElo}
                  onChange={e => set("minElo", e.target.value)}
                />
              </div>
              <span className="elo-range-sep">–</span>
              <div className="elo-range-field">
                <label className="elo-range-label" htmlFor="maxElo">Max</label>
                <input
                  id="maxElo"
                  className="form-input elo-input"
                  type="number"
                  min={0}
                  max={3000}
                  step={50}
                  placeholder="Any"
                  value={form.maxElo}
                  onChange={e => set("maxElo", e.target.value)}
                />
              </div>
            </div>
            <p className="form-hint">Leave blank to accept any Elo rating.</p>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create Game"}
        </button>
      </form>
    </div>
  );
}
