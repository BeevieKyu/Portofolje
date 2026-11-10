import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { validateEmail, validatePasswordMatch, validatePasswordLength } from "../utils/validationUtils";
import "../styles/profile.css";

export default function UserProfile() {
  const { id } = useParams();
  const { user: loggedInUser, login } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [aboutMe, setAboutMe] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    aboutMe: "",
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileId = id || loggedInUser?.id;
        if (!profileId) {
          setError("No user ID provided and no logged-in user.");
          return;
        }

        const res = await fetch(`/api/users/${profileId}`);
        if (!res.ok) {
          throw new Error("Failed to load user profile.");
        }

        const data = await res.json();
        setProfile(data.user);

        setIsOwnProfile(loggedInUser?.id === profileId);

        const savedPicture = localStorage.getItem(`profilePicture_${profileId}`);
        if (savedPicture) {
          setProfilePicture(savedPicture);
        }

        const savedAboutMe = localStorage.getItem(`aboutMe_${profileId}`) ?? "";
        setAboutMe(savedAboutMe);

        setFormData({
          email: data.user.email,
          password: "",
          passwordConfirm: "",
          aboutMe: savedAboutMe,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, loggedInUser?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      setProfilePicture(base64);
      localStorage.setItem(`profilePicture_${profile.id}`, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    let validationError = validateEmail(formData.email);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (formData.password || formData.passwordConfirm) {
      validationError = validatePasswordMatch(formData.password, formData.passwordConfirm);
      if (validationError) {
        setFormError(validationError);
        return;
      }
      validationError = validatePasswordLength(formData.password);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    try {
      setFormLoading(true);

      const updates = { email: formData.email };
      if (formData.password) {
        updates.password = formData.password;
      }

      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "user"
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      const data = await res.json();
      setProfile(data.user);

      localStorage.setItem(`aboutMe_${profile.id}`, formData.aboutMe);
      setAboutMe(formData.aboutMe);

      if (isOwnProfile) {
        login({ ...loggedInUser, email: data.user.email });
      }

      setIsEditing(false);
      setFormData({
        email: data.user.email,
        password: "",
        passwordConfirm: "",
        aboutMe: formData.aboutMe,
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (!loggedInUser) {
    return (
      <div className="profile-page">
        <p className="profile-error">Please log in to view profiles.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="profile-page"><p>Loading profile…</p></div>;
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <p className="profile-error">{error || "Profile not found."}</p>
      </div>
    );
  }

  const profileId = id || loggedInUser?.id;

  const monthWins = Number(profile.last30Days?.wins ?? 0);
  const monthLosses = Number(profile.last30Days?.losses ?? 0);

  const weeklyChange = profile.weeklyEloRatingChange ?? 0;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={profile.username}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              profile.username?.[0]?.toUpperCase() ?? "U"
            )}
          </div>
        </div>

        <div className="profile-info-main">
          <h1>{profile.username}</h1>
          <p className="profile-username-note">@{profile.username}</p>
          {aboutMe && (
            <p className="profile-about-me">{aboutMe}</p>
          )}
        </div>

        {isOwnProfile && (
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        )}
      </div>

      {isEditing && isOwnProfile && (
        <div className="profile-edit-section">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="aboutMe">About Me</label>
              <textarea
                id="aboutMe"
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleInputChange}
                placeholder="Tell others a bit about yourself…"
                rows={3}
                maxLength={300}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password (leave blank to keep current)</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <input
                id="passwordConfirm"
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture</label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--text)", marginTop: "0.5rem" }}>
                Max 2MB. Supported formats: JPEG, PNG, WebP, GIF
              </p>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" disabled={formLoading}>
              {formLoading ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{profile.eloRating ?? 1200}</div>
          {weeklyChange !== 0 && (
            <div className={`stat-elo-change ${weeklyChange > 0 ? "elo-up" : "elo-down"}`}>
              {weeklyChange > 0 ? `+${weeklyChange}` : weeklyChange} this week
            </div>
          )}
          <div className="stat-label">Elo Rating</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{profile.totalMatches ?? 0}</div>
          <div className="stat-label">Games Played</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{profile.totalWins ?? 0}</div>
          <div className="stat-label">Total Wins</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{profile.winPercentage ? Math.round(profile.winPercentage) : 0}%</div>
          <div className="stat-label">Win Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <span style={{ color: "#2e7d32" }}>{monthWins}W</span>
            {" / "}
            <span style={{ color: "#d32f2f" }}>{monthLosses}L</span>
          </div>
          <div className="stat-label">Last 30 Days</div>
        </div>
      </div>

      {profile.trophies && profile.trophies.length > 0 && (
        <div className="profile-section">
          <h2>Trophies & Awards</h2>
          <div className="trophies-grid">
            {profile.trophies.map((trophy, idx) => (
              <div key={idx} className="trophy-card">
                <div className="trophy-icon">🏆</div>
                <h3>{trophy.trophyTitle || "Award"}</h3>
                <p>{trophy.tournamentName || "Tournament"}</p>
                <p className="trophy-date">
                  {new Date(trophy.wonDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-section">
        <div className="section-header">
          <h2>Recent Games</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate(`/profile/${profileId}/games`)}
          >
            View All Games
          </button>
        </div>

        {profile.recentGames && profile.recentGames.length > 0 ? (
          <div className="games-list">
            {profile.recentGames.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-status">
                  <span className={`status-badge status-${game.status}`}>
                    {game.status === "pending" && "Waiting for players"}
                    {game.status === "active" && "In progress"}
                    {game.status === "completed" && "Completed"}
                  </span>
                </div>

                <div className="game-info">
                  <p className="game-variant">
                    {game.variant && (
                      <>
                        {game.variant.rounds}R · {game.variant.timePerRound}s · Straights {game.variant.straightsAllowed ? "on" : "off"}
                      </>
                    )}
                  </p>
                  <p className="game-date">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {game.status === "completed" && (
                  <div className="game-result">
                    <span className={game.winner && String(game.winner) === String(profile.id) ? "win" : "loss"}>
                      {game.winner && String(game.winner) === String(profile.id) ? "Won" : "Lost"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="lobby-state">No recent games yet.</p>
        )}
      </div>

      <div className="profile-section profile-user-info">
        <h2>Account Information</h2>
        <div className="user-info-grid">
          <div className="info-item">
            <label>Email</label>
            <p>{isOwnProfile ? profile.email : "••••••••"}</p>
          </div>
          <div className="info-item">
            <label>Account Type</label>
            <p className="capitalized">{profile.userType}</p>
          </div>
          <div className="info-item">
            <label>Member Since</label>
            <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="info-item">
            <label>Last Active</label>
            <p>
              {profile.lastLogin
                ? new Date(profile.lastLogin).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
