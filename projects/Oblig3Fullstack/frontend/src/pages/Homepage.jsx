import { useEffect, useState, useContext } from "react";
import LobbyPreview from "../components/home/LobbyPreview";
import TopGames from "../components/home/TopGames";
import { Link } from "react-router-dom";
import { AppearanceContext } from "../context/AppearanceContext";
import { AuthContext } from "../context/AuthContext";
import "../styles/styles.css";

export default function Homepage() {
    const { lobbyPreviewCount } = useContext(AppearanceContext);
    const { user } = useContext(AuthContext);
    const [lobbyGames, setLobbyGames] = useState([]);
    const [topGames, setTopGames] = useState([]);

    useEffect(() => {
        fetch(`/api/games?status=pending&limit=${lobbyPreviewCount}`)
            .then(res => res.json())
            .then(data => {
                const all = data.games ?? [];
                const visible = all.filter(game => {
                    const creator = game.players?.[0];
                    const prefs = game.matchPreferences ?? {};

                    if (!user && creator?.type === "registered" && prefs.allowAnonymous === false) return false;
                    if (user && game.players?.some(p => String(p.id) === String(user.id))) return false;
                    return true;
                });
                setLobbyGames(visible);
            })
            .catch(() => {});

        (async () => {
            const activeRes = await fetch(`/api/games?status=active&limit=5&sort=-createdAt`);
            const activeData = await activeRes.json();
            const active = activeData.games ?? [];

            if (active.length < 5) {
                const need = 5 - active.length;
                const completedRes = await fetch(`/api/games?status=completed&limit=${need}&sort=-createdAt`);
                const completedData = await completedRes.json();
                setTopGames([...active, ...(completedData.games ?? [])]);
            } else {
                setTopGames(active);
            }
        })().catch(() => {});
    }, [lobbyPreviewCount, user]);

    return (
        <div className="homepage">
            <section className="intro">
                <h1>Spanish Poker Dice</h1>
                <p>A strategic dice game played online with players worldwide.</p>

                <Link to="/create-game" className="create-btn">
                    Create New Game
                </Link>
            </section>

            <section>
                <h2>Lobby Preview</h2>
                <LobbyPreview games={lobbyGames} />
            </section>

            <section>
                <h2>Top Games</h2>
                <TopGames games={topGames} />
            </section>
        </div>
    );
}
