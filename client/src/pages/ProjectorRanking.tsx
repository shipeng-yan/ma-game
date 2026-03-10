import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const TOP_N = 10; // show top 10 on projector

export default function ProjectorRanking() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [countdown, setCountdown] = useState(30);

  const { data: rankings, isLoading, refetch } = trpc.game.getRankings.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Countdown timer display
  useEffect(() => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setLastUpdated(new Date());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rankings]);

  const top = rankings?.slice(0, TOP_N) ?? [];
  const total = rankings?.length ?? 0;

  return (
    <div className="projector-wrapper">
      {/* Header */}
      <div className="projector-header">
        <div className="projector-title">
          <span className="projector-trophy">🏆</span>
          The Titan Challenge — Class Leaderboard
        </div>
        <div className="projector-meta">
          <span className="projector-count">{total} player{total !== 1 ? "s" : ""} completed</span>
          <span className="projector-refresh">Refreshes in {countdown}s</span>
        </div>
      </div>

      {/* Table */}
      <div className="projector-body">
        {isLoading ? (
          <div className="projector-loading">Loading rankings…</div>
        ) : top.length === 0 ? (
          <div className="projector-empty">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
            <div>Waiting for students to complete the game…</div>
          </div>
        ) : (
          <table className="projector-table">
            <thead>
              <tr>
                <th className="col-rank">Rank</th>
                <th className="col-name">Name</th>
                <th className="col-score">📊 Investor</th>
                <th className="col-score">🌿 ESG</th>
                <th className="col-avg">Avg Score</th>
                <th className="col-arch">Archetype</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`projector-row ${idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : idx === 2 ? "rank-bronze" : ""}`}
                >
                  <td className="col-rank">
                    <span className="proj-medal">
                      {MEDAL[r.rank] ?? r.rank}
                    </span>
                  </td>
                  <td className="col-name">
                    <strong>{r.playerName}</strong>
                  </td>
                  <td className="col-score">
                    <span className="proj-score-pill investor">{r.investorScore}</span>
                  </td>
                  <td className="col-score">
                    <span className="proj-score-pill esg">{r.esgScore}</span>
                  </td>
                  <td className="col-avg">
                    <span className="proj-avg">{r.averageScore}</span>
                  </td>
                  <td className="col-arch">
                    <span className="proj-arch">{r.archetypeLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > TOP_N && (
          <div className="projector-footnote">
            Showing top {TOP_N} of {total} players
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="projector-footer">
        Ranked by average of Investor Confidence + ESG Credibility &nbsp;·&nbsp; Last updated {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}
