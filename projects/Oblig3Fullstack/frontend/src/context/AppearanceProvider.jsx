import { useState, useEffect } from "react";
import { AppearanceContext } from "./AppearanceContext";
import { useAuth } from "./useAuth";

function loadSavedAppearance() {
  try {
    const raw = localStorage.getItem("appearance");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function AppearanceProvider({ children }) {
  const { user } = useAuth();
  const savedAppearance = loadSavedAppearance();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return savedAppearance.isDarkMode ?? false;
  });

  const [boardColor, setBoardColor] = useState(() => {
    return savedAppearance.boardColor ?? "pink";
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return savedAppearance.soundEnabled ?? true;
  });

  const [lobbyPreviewCount, setLobbyPreviewCount] = useState(() => {
    return savedAppearance.lobbyPreviewCount ?? 6;
  });

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    async function loadBackendPreferences() {
      try {
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { "x-user-role": "user" },
        });
        if (!res.ok) return;

        const data = await res.json();
        const prefs = data.user?.appearancePreferences;
        if (!prefs || cancelled) return;

        if (typeof prefs.isDarkMode === "boolean") setIsDarkMode(prefs.isDarkMode);
        if (typeof prefs.boardColor === "string" && prefs.boardColor) setBoardColor(prefs.boardColor);
        if (typeof prefs.soundEnabled === "boolean") setSoundEnabled(prefs.soundEnabled);
        if (typeof prefs.lobbyPreviewCount === "number") setLobbyPreviewCount(prefs.lobbyPreviewCount);
      } catch {
        void 0;
      }
    }

    loadBackendPreferences();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const appearancePreferences = {
      isDarkMode,
      boardColor,
      soundEnabled,
      lobbyPreviewCount,
    };

    localStorage.setItem(
      "appearance",
      JSON.stringify(appearancePreferences)
    );

    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }

    document.documentElement.style.setProperty("--board-color", boardColor);

    if (user?.id) {
      fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "user",
        },
        body: JSON.stringify({ appearancePreferences }),
      }).catch(() => {});
    }
  }, [isDarkMode, boardColor, soundEnabled, lobbyPreviewCount, user?.id]);

  return (
    <AppearanceContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        boardColor,
        setBoardColor,
        soundEnabled,
        setSoundEnabled,
        lobbyPreviewCount,
        setLobbyPreviewCount,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}
