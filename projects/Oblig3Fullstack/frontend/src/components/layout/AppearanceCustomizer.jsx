import { useContext, useState } from "react";
import { AppearanceContext } from "../../context/AppearanceContext";
import "../../styles/appearance.css";

export default function AppearanceCustomizer() {
  const {
    isDarkMode,
    setIsDarkMode,
    boardColor,
    setBoardColor,
    soundEnabled,
    setSoundEnabled,
    lobbyPreviewCount,
    setLobbyPreviewCount,
  } = useContext(AppearanceContext);

  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: "Pink", value: "pink" },
    { name: "Blue", value: "blue" },
    { name: "Purple", value: "purple" },
    { name: "Green", value: "green" },
  ];

  return (
    <div className="appearance-customizer">
      <button
        className="appearance-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize appearance"
      >
        Customize
      </button>

      {isOpen && (
        <div className="appearance-menu">
          <h3>Customize</h3>

          <div className="appearance-item">
            <label>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
              />
              Dark Mode
            </label>
          </div>

          <div className="appearance-item">
            <label>Board Color:</label>
            <div className="color-buttons">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`color-btn ${
                    boardColor === color.value ? "active" : ""
                  }`}
                  style={{
                    backgroundColor: color.value,
                  }}
                  onClick={() => setBoardColor(color.value)}
                  title={color.name}
                >
                  {boardColor === color.value ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="appearance-item">
            <label>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              Sound Effects
            </label>
          </div>

          <div className="appearance-item">
            <label>
              Lobby Games: <strong>{lobbyPreviewCount}</strong>
            </label>
            <input
              type="range"
              min="3"
              max="12"
              value={lobbyPreviewCount}
              onChange={(e) => setLobbyPreviewCount(Number(e.target.value))}
              className="lobby-slider"
            />
          </div>

          <button
            className="appearance-close"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
