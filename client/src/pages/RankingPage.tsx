import { trpc } from "@/lib/trpc";

type RankEntry = {
  id: number;
  rank: number;
  playerName: string;
  investorScore: number;
  esgScore: number;
  averageScore: number;
  archetypeLabel: string;
  completedAt: Date;
};

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingPage({ currentPlayerName, onPlayAgain }: {
  currentPlayerName: string;
  onPlayAgain: () => void;
}) {
  const { data: rankings, isLoading } = trpc.game.getRankings.useQuery(undefined, {
    refetchInterval: 15000, // auto-refresh every 15s
  });

  const myRank = rankings?.find(r => r.playerName === currentPlayerName);

  return (
    <div className="screen active">
      <div className="ranking-header">
        <h2>Class Leaderboard</h2>
        <p>Rankings are based on the average of Investor Confidence and ESG Credibility scores. Auto-refreshes every 15 seconds.</p>
      </div>

      {myRank && (
        <div className="my-rank-card">
          <div className="my-rank-label">Your Ranking</div>
          <div className="my-rank-position">
            {MEDAL[myRank.rank] ?? `#${myRank.rank}`}
            <span className="my-rank-number">#{myRank.rank}</span>
          </div>
          <div className="my-rank-scores">
            <span className="score-pill investor">📊 {myRank.investorScore}</span>
            <span className="score-pill esg">🌿 {myRank.esgScore}</span>
            <span className="my-rank-avg">Avg: <strong>{myRank.averageScore}</strong></span>
          </div>
          <div className="my-rank-archetype">{myRank.archetypeLabel}</div>
        </div>
      )}

      {isLoading ? (
        <div className="ranking-loading">Loading rankings...</div>
      ) : (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            Full Rankings — {rankings?.length ?? 0} player{rankings?.length !== 1 ? 's' : ''} completed
          </div>
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>📊 Investor</th>
                  <th>🌿 ESG</th>
                  <th>Avg Score</th>
                  <th>Archetype</th>
                </tr>
              </thead>
              <tbody>
                {rankings?.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--charcoal-light)' }}>No completed games yet.</td></tr>
                )}
                {rankings?.map(r => {
                  const isMe = r.playerName === currentPlayerName;
                  return (
                    <tr key={r.id} className={isMe ? 'ranking-row-me' : ''}>
                      <td>
                        <span className={`ranking-medal ${r.rank <= 3 ? 'top-three' : ''}`}>
                          {MEDAL[r.rank] ?? r.rank}
                        </span>
                      </td>
                      <td>
                        <strong>{r.playerName}</strong>
                        {isMe && <span className="ranking-you-badge"> (You)</span>}
                      </td>
                      <td>
                        <span className="score-pill investor">{r.investorScore}</span>
                      </td>
                      <td>
                        <span className="score-pill esg">{r.esgScore}</span>
                      </td>
                      <td>
                        <strong className="ranking-avg">{r.averageScore}</strong>
                      </td>
                      <td>
                        <span className="archetype-tag">{r.archetypeLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button className="btn-primary btn-block" onClick={onPlayAgain} style={{ marginTop: '1.5rem' }}>
        Play Again
      </button>
    </div>
  );
}
