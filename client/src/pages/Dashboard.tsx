import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { CHAPTER_NAMES, CHAPTERS } from "@/lib/gameData";

type SortKey = 'rank' | 'playerName' | 'investorScore' | 'esgScore' | 'combinedScore' | 'archetypeLabel' | 'completedAt';
type SortDir = 'asc' | 'desc';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data: sessions, isLoading: sessionsLoading, refetch } = trpc.game.getSessions.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: analytics, isLoading: analyticsLoading } = trpc.game.getAnalytics.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const sendSummary = trpc.game.sendSummaryEmail.useMutation({
    onSuccess: () => toast.success("Summary email sent to your inbox!"),
    onError: () => toast.error("Failed to send summary email."),
  });

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (!isAuthenticated) return (
    <div className="dashboard-login">
      <div className="card" style={{ maxWidth: 400, margin: '4rem auto', textAlign: 'center' }}>
        <h2>Teacher Dashboard</h2>
        <p>Please log in to access the dashboard.</p>
        <a href={getLoginUrl()} className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Log In</a>
      </div>
    </div>
  );
  if (user?.role !== 'admin') return (
    <div className="dashboard-login">
      <div className="card" style={{ maxWidth: 400, margin: '4rem auto', textAlign: 'center' }}>
        <h2>Access Restricted</h2>
        <p>This dashboard is for instructors only. Please contact the system administrator to grant access.</p>
      </div>
    </div>
  );

  // Sort & filter
  const filtered = (sessions ?? []).filter(s =>
    s.playerName.toLowerCase().includes(search.toLowerCase()) ||
    s.playerEmail.toLowerCase().includes(search.toLowerCase()) ||
    s.archetypeLabel.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortKey as keyof typeof a];
    let bVal: any = b[sortKey as keyof typeof b];
    if (sortKey === 'completedAt') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function exportCSV() {
    if (!sessions?.length) return;
    const headers = ['Rank', 'Name', 'Email', 'Investor Score', 'ESG Score', 'Combined Score', 'Archetype', 'Game Over', 'Completed At', 'Duration (s)', ...CHAPTERS.flatMap(ch => [`${ch}1 Choice`, `${ch}2 Choice`])];
    const rows = sessions.map(s => {
      const decisions = (s.decisions as any[]) ?? [];
      const decisionMap: Record<string, string> = {};
      decisions.forEach((d: any) => { decisionMap[d.chapter] = d.choiceLabel; });
      return [
        s.rank, s.playerName, s.playerEmail, s.investorScore, s.esgScore, s.combinedScore,
        s.archetypeLabel, s.gameOver ? 'Yes' : 'No',
        new Date(s.completedAt).toLocaleString(), s.durationSeconds ?? 0,
        ...CHAPTERS.flatMap(ch => [decisionMap[ch + '1'] ?? '', decisionMap[ch + '2'] ?? '']),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `titan-challenge-results-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Titan Challenge — Student Performance Overview</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn-secondary" onClick={() => refetch()}>↻ Refresh</button>
          <button className="btn-secondary" onClick={() => sendSummary.mutate()} disabled={sendSummary.isPending}>
            {sendSummary.isPending ? 'Sending...' : '✉ Email Summary'}
          </button>
          <button className="btn-primary" onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analyticsLoading ? <div className="analytics-loading">Loading analytics...</div> : analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-label">Total Submissions</div>
            <div className="analytics-value">{analytics.total}</div>
          </div>
          <div className="analytics-card investor">
            <div className="analytics-label">Avg Investor Score</div>
            <div className="analytics-value investor-color">{analytics.avgInvestor}</div>
          </div>
          <div className="analytics-card esg">
            <div className="analytics-label">Avg ESG Score</div>
            <div className="analytics-value esg-color">{analytics.avgEsg}</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-label">Completion Rate</div>
            <div className="analytics-value">{analytics.completionRate}%</div>
          </div>
          <div className="analytics-card danger">
            <div className="analytics-label">Game Over Rate</div>
            <div className="analytics-value danger-color">{analytics.gameOverRate}%</div>
          </div>
        </div>
      )}

      {/* Search & Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="table-toolbar">
          <input className="form-input" placeholder="Search by name, email, or archetype..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
          <span className="table-count">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</span>
        </div>

        {sessionsLoading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sessions...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {([['rank', '#'], ['playerName', 'Name'], ['playerEmail', 'Email'], ['investorScore', 'Investor'], ['esgScore', 'ESG'], ['combinedScore', 'Combined'], ['archetypeLabel', 'Archetype'], ['completedAt', 'Completed']] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} onClick={() => handleSort(k)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      {label}<SortIcon k={k} />
                    </th>
                  ))}
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--charcoal-light)' }}>No submissions yet.</td></tr>
                )}
                {sorted.map(s => (
                  <>
                    <tr key={s.id} className={s.gameOver ? 'row-gameover' : ''}>
                      <td><span className="rank-badge">{s.rank}</span></td>
                      <td><strong>{s.playerName}</strong></td>
                      <td className="email-cell">{s.playerEmail}</td>
                      <td><span className="score-pill investor">{s.investorScore}</span></td>
                      <td><span className="score-pill esg">{s.esgScore}</span></td>
                      <td><strong>{s.combinedScore}</strong></td>
                      <td><span className="archetype-tag">{s.archetypeLabel}</span></td>
                      <td className="date-cell">{new Date(s.completedAt).toLocaleString()}</td>
                      <td>
                        <button className="btn-details" onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}>
                          {expandedRow === s.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === s.id && (
                      <tr key={`${s.id}-detail`} className="detail-row">
                        <td colSpan={9}>
                          <div className="detail-panel">
                            <h4>Decision Trail — {s.playerName}</h4>
                            <div className="detail-decisions">
                              {((s.decisions as any[]) ?? []).map((d: any, i: number) => (
                                <div key={i} className="detail-decision-item">
                                  <span className="detail-chapter">{d.chapter}</span>
                                  <span className="detail-title">{d.chapterTitle}</span>
                                  <span className="detail-choice">{d.choiceLabel}</span>
                                  <span className={`score-change ${d.investorDelta > 0 ? 'positive' : d.investorDelta < 0 ? 'negative' : 'zero'}`}>📊 {d.investorDelta > 0 ? '+' : ''}{d.investorDelta}</span>
                                  <span className={`score-change ${d.esgDelta > 0 ? 'positive' : d.esgDelta < 0 ? 'negative' : 'zero'}`}>🌿 {d.esgDelta > 0 ? '+' : ''}{d.esgDelta}</span>
                                </div>
                              ))}
                            </div>
                            {s.gameOver && <p style={{ color: 'var(--negative)', fontWeight: 700, marginTop: '0.5rem' }}>⚠ This player was removed by the board (game over).</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
