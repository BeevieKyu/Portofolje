import "../styles/about.css";

export default function AboutSpanishDice() {
  return (
    <div className="about-page">
      <h1>About Spanish Poker Dice</h1>

      <section className="about-section">
        <h2>What is Spanish Poker Dice?</h2>
        <p>
          Spanish Poker Dice is a competitive dice game that combines 
          elements of traditional poker with dice rolling. Players roll five dice to create the best poker hand, 
          competing against opponents to win rounds and earn Elo points.
        </p>
      </section>

      <section className="about-section">
        <h2>Game Rules</h2>
        <p>
          Each player rolls five dice. The goal is to get the highest poker hand ranking. 
          You can hold some dice and re-roll others two additional times
          to improve your hand before the final round.
        </p>
      </section>

      <section className="about-section">
        <h2>Hand Rankings (Highest to Lowest)</h2>
        <div className="hand-rankings">
          <div className="ranking">
            <h3>Five of a Kind</h3>
            <p>All five dice show the same number.</p>
          </div>
          <div className="ranking">
            <h3>Royal Flush</h3>
            <p>Five consecutive dice: 1-2-3-4-5 or 2-3-4-5-6</p>
          </div>
          <div className="ranking">
            <h3>Four of a Kind</h3>
            <p>Four dice show the same number, plus one different die</p>
          </div>
          <div className="ranking">
            <h3>Full House</h3>
            <p>Three of a kind plus a pair</p>
          </div>
          <div className="ranking">
            <h3>Straight</h3>
            <p>Five consecutive numbers in sequence</p>
          </div>
          <div className="ranking">
            <h3>Three of a Kind</h3>
            <p>Three dice show the same number, two others are different</p>
          </div>
          <div className="ranking">
            <h3>Two Pair</h3>
            <p>Two dice match, another two different dice match, one unmatched die</p>
          </div>
          <div className="ranking">
            <h3>One Pair</h3>
            <p>Two dice show the same number, three others are all different</p>
          </div>
          <div className="ranking">
            <h3>High Card</h3>
            <p>No matching dice. Ranked by the highest die value</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Game Variants</h2>
        <p>
          Our platform offers custom game variants based on three parameters:
        </p>
        <div className="variants-grid">
          <div className="variant-card">
            <h3>Rounds</h3>
            <p>Choose Best of 3, Best of 5, or Best of 7 rounds to determine the match winner</p>
          </div>
          <div className="variant-card">
            <h3>Straights Rule</h3>
            <p><strong>Allowed:</strong> Straights are valid hands. <strong>Not Allowed:</strong> Treat straights as high cards</p>
          </div>
          <div className="variant-card">
            <h3>Time Control</h3>
            <p>Play with time limits: 3 seconds, 10 seconds, or 30 seconds per round</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Scoring & Elo Rating</h2>
        <p>
          Victories earn you Elo rating points based on the strength of your opponent. Beating higher-rated 
          players gains you more points, while losses to lower-rated opponents cost more. Your Elo rating is 
          the measure of skill on our platform.
        </p>
      </section>

      <section className="about-section">
        <h2>Quick Start</h2>
        <ol className="steps-list">
          <li>Sign up or play as an anonymous user</li>
          <li>Go to the <a href="/lobby">Lobby</a> to join an existing game or <a href="/create-game">Create Game</a> to start a new one</li>
          <li>Configure your game variant</li>
          <li>Roll your dice: keep strong dice and re-roll to improve</li>
          <li>Compete to win rounds and climb in the leaderboard</li>
        </ol>
      </section>
    </div>
  );
}
