import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CHAPTERS, CHAPTER_NAMES, CHAPTER_IMAGES, HERO_IMAGE, DATA, CONSEQUENCES,
  getArchetype, UNILEVER_ACTUAL, UNILEVER_DETAIL, CHAPTER_REVEAL_NAMES, DISCUSSION_PROMPTS, getScoreBarWidth, Chapter, Option
} from "@/lib/gameData";
import RankingPage from "./RankingPage";

const GAME_PASSWORD = "MSAF7008";

// ─── Password Gate ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().toUpperCase() === GAME_PASSWORD) {
      sessionStorage.setItem('titan_unlocked', '1');
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 3000);
    }
  }

  return (
    <div className="password-gate">
      <div className="password-gate-card">
        <h2>The Titan Challenge</h2>
        <p>This game is for enrolled students only. Please enter the class password to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="password"
            placeholder="Enter class password"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            required
          />
          {error && <div className="password-error">Incorrect password. Please try again.</div>}
          <button type="submit" className="btn-primary btn-block" style={{ marginTop: '1rem' }}>Enter →</button>
        </form>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'password' | 'register' | 'title' | 'opening' | 'decision1' | 'decision2' | 'outcome' | 'gameover' | 'final' | 'ranking';
type DecisionRecord = { chapter: string; chapterTitle: string; choiceLabel: string; choiceDesc: string; investorDelta: number; esgDelta: number; rationale?: string };
type ConfirmData = { ch: Chapter; decisionNum: 1 | 2; optionId: string; optLabel: string; optDesc: string; inv: number; esg: number } | null;
type ModalData = { title: string; consequence: string; invDelta: number; esgDelta: number; onContinue: () => void } | null;

// ─── Score Display ─────────────────────────────────────────────────────────────
function ScoreDisplay({ investor, esg }: { investor: number; esg: number }) {
  return (
    <div className="scores-display">
      <div className="score-box investor">
        <div className="score-label">Investor Confidence</div>
        <div className="score-value">{investor}</div>
        <div className="score-bar-track"><div className="score-bar-fill investor-fill" style={{ width: getScoreBarWidth(investor) + '%' }} /></div>
      </div>
      <div className="score-box esg">
        <div className="score-label">ESG Credibility</div>
        <div className="score-value">{esg}</div>
        <div className="score-bar-track"><div className="score-bar-fill esg-fill" style={{ width: getScoreBarWidth(esg) + '%' }} /></div>
      </div>
    </div>
  );
}

// ─── Score Change Badge ────────────────────────────────────────────────────────
function ScoreBadge({ label, delta, type }: { label: string; delta: number; type: 'investor' | 'esg' }) {
  const cls = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'zero';
  const icon = type === 'investor' ? '📊' : '🌿';
  const sign = delta > 0 ? '+' : '';
  return <span className={`score-change ${cls}`}>{icon} {label}: {sign}{delta}</span>;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ data, investor, esg, onClose }: { data: ModalData; investor: number; esg: number; onClose: () => void }) {
  if (!data) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{data.title}</h3>
        <div className="modal-consequence">{data.consequence}</div>
        <div style={{ margin: '1rem 0' }}>
          <ScoreBadge label="Investor Confidence" delta={data.invDelta} type="investor" />
          <ScoreBadge label="ESG Credibility" delta={data.esgDelta} type="esg" />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--charcoal-light)', marginBottom: '0.5rem' }}>
          Current scores: Investor Confidence <strong>{investor}</strong> | ESG Credibility <strong>{esg}</strong>
        </div>
        <button className="btn-continue" onClick={data.onContinue}>Continue</button>
      </div>
    </div>
  );
}

// ─── Confirmation Modal (rationale) ──────────────────────────────────────────
function ConfirmationModal({ data, rationale, setRationale, onConfirm, onCancel }: {
  data: ConfirmData;
  rationale: string;
  setRationale: (v: string) => void;
  onConfirm: (r: string) => void;
  onCancel: () => void;
}) {
  if (!data) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm-modal">
        <div className="confirm-modal-header">
          <div className="confirm-modal-tag">Confirm Your Decision</div>
          <h3>Option {data.optionId}: {data.optLabel}</h3>
          <p className="confirm-modal-desc">{data.optDesc}</p>
        </div>
        <div className="confirm-modal-rationale">
          <label className="form-label">Why did you make this choice? <span style={{fontWeight:400, opacity:0.6}}>(optional)</span></label>
          <textarea
            className="rationale-textarea"
            placeholder="Share your reasoning... (you can leave this blank)"
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>
        <div className="confirm-modal-actions">
          <button className="btn-secondary confirm-cancel" onClick={onCancel}>← Go Back</button>
          <button className="btn-primary confirm-ok" onClick={() => onConfirm(rationale)}>Confirm Decision →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Nav Bar ───────────────────────────────────────────────────────────────────
function NavBar({ currentChapter, completedChapters, visible }: { currentChapter: Chapter | null; completedChapters: Chapter[]; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="nav-bar">
      {CHAPTERS.map(ch => {
        const isCompleted = completedChapters.includes(ch);
        const isActive = currentChapter === ch;
        return (
          <div key={ch} className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            {isCompleted && <span className="check">✓ </span>}
            Chapter {ch}: {CHAPTER_NAMES[ch]}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Game Component ───────────────────────────────────────────────────────
export default function TitanGame() {
  const [screen, setScreen] = useState<Screen>(
    sessionStorage.getItem('titan_unlocked') === '1' ? 'register' : 'password'
  );
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [investor, setInvestor] = useState(10);
  const [esg, setEsg] = useState(10);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Chapter[]>([]);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [choiceLabels, setChoiceLabels] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [modal, setModal] = useState<ModalData>(null);
  const [confirmData, setConfirmData] = useState<ConfirmData>(null);
  const [rationale, setRationale] = useState('');
  const [gameOverReason, setGameOverReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const submitResult = trpc.game.submitResult.useMutation({
    onSuccess: () => { toast.success("Your results have been recorded!"); setSubmitted(true); },
    onError: () => toast.error("Could not save results. Please notify your instructor."),
  });

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  function checkGameOver(inv: number, esgVal: number): boolean {
    if (inv <= 0 || esgVal <= 0) {
      let reason = '';
      if (inv <= 0 && esgVal <= 0) reason = "Both your Investor Confidence and ESG Credibility have reached zero. You lost the trust of investors and the credibility of your sustainability commitments at the same time.";
      else if (inv <= 0) reason = "Your Investor Confidence has reached zero. Investors have lost faith in your ability to manage the company's financial interests.";
      else reason = "Your ESG Credibility has reached zero. The market no longer believes in Titan's environmental and social commitments.";
      setGameOverReason(reason);
      setScreen('gameover');
      scrollTop();
      // Submit game over result
      submitResult.mutate({ playerName, playerEmail, investorScore: inv, esgScore: esgVal, finalOutcome: 'game-over', archetypeLabel: 'Game Over', decisions, durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000), gameOver: true });
      return true;
    }
    return false;
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName.trim() || !playerEmail.trim()) return;
    startTimeRef.current = Date.now();
    setScreen('title');
    scrollTop();
  }

  function startGame() {
    setCurrentChapter('A');
    setScreen('opening');
    scrollTop();
  }

  // Step 1: clicking an option opens the confirmation modal
  function handleDecision(ch: Chapter, decisionNum: 1 | 2, optionId: string) {
    const data = DATA[ch];
    const opt = (decisionNum === 1 ? data.d1.options : data.d2.options).find((o: Option) => o.id === optionId)!;
    setRationale('');
    setConfirmData({ ch, decisionNum, optionId, optLabel: opt.label, optDesc: opt.desc, inv: opt.inv, esg: opt.esg });
  }

  // Step 2: player confirms (with optional rationale) → lock in the decision
  function confirmDecision(rationaleText: string) {
    if (!confirmData) return;
    const { ch, decisionNum, optionId, optLabel, optDesc, inv, esg: esgDelta } = confirmData;
    const data = DATA[ch];
    const key = ch + decisionNum;
    const newInv = investor + inv;
    const newEsg = esg + esgDelta;
    setInvestor(newInv);
    setEsg(newEsg);
    setChoices(prev => ({ ...prev, [key]: optionId }));
    setChoiceLabels(prev => ({ ...prev, [key]: optLabel }));
    setDecisions(prev => [...prev, {
      chapter: key,
      chapterTitle: decisionNum === 1 ? data.d1.title : data.d2.title,
      choiceLabel: `Option ${optionId}: ${optLabel}`,
      choiceDesc: optDesc,
      investorDelta: inv,
      esgDelta,
      rationale: rationaleText.trim(),
    }]);
    setConfirmData(null);
    const conseq = CONSEQUENCES[key][optionId];
    setModal({
      title: `Decision ${key}: ${optLabel}`,
      consequence: conseq,
      invDelta: inv,
      esgDelta,
      onContinue: () => {
        setModal(null);
        if (checkGameOver(newInv, newEsg)) return;
        if (decisionNum === 1) setScreen('decision2');
        else { setCompletedChapters(prev => [...prev, ch]); setScreen('outcome'); }
        scrollTop();
      }
    });
  }

  function nextChapter() {
    const idx = CHAPTERS.indexOf(currentChapter!);
    if (idx < CHAPTERS.length - 1) {
      const nextCh = CHAPTERS[idx + 1];
      setCurrentChapter(nextCh);
      setScreen('opening');
    } else {
      setScreen('final');
      // Submit final results
      const archetype = getArchetype(choices);
      submitResult.mutate({
        playerName, playerEmail, investorScore: investor, esgScore: esg,
        finalOutcome: archetype.title, archetypeLabel: archetype.title,
        decisions, durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000), gameOver: false,
      });
    }
    scrollTop();
  }

  function resetGame() {
    // Full reset — clears player info too (used by Play Again on final screen)
    setScreen('register'); setInvestor(10); setEsg(10);
    setCurrentChapter(null); setCompletedChapters([]); setChoices({});
    setChoiceLabels({}); setDecisions([]); setModal(null); setSubmitted(false);
    setPlayerName(''); setPlayerEmail('');
    scrollTop();
  }

  function handleDownloadPDF() {
    // Build a printable HTML page and trigger browser print/save as PDF
    const archetype = getArchetype(choices);
    const date = new Date().toLocaleDateString('en-HK', { year: 'numeric', month: 'long', day: 'numeric' });
    const decisionsHTML = decisions.map(d => {
      const invSign = d.investorDelta > 0 ? '+' : '';
      const esgSign = d.esgDelta > 0 ? '+' : '';
      const matchesUnilever = UNILEVER_ACTUAL[d.chapter]?.startsWith(d.choiceLabel.split(':')[0]);
      return `
        <div style="margin-bottom:1.2rem;padding:1rem;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:0.3rem">Decision ${d.chapter} — ${d.chapterTitle}</div>
          <div style="font-weight:600;color:#1e293b;margin-bottom:0.25rem">${d.choiceLabel}</div>
          <div style="font-size:0.85rem;color:#475569;margin-bottom:0.5rem">${d.choiceDesc}</div>
          <div style="font-size:0.8rem;margin-bottom:0.4rem">
            <span style="color:${d.investorDelta >= 0 ? '#0d9488' : '#dc2626'};font-weight:600">📊 Investor: ${invSign}${d.investorDelta}</span>
            &nbsp;&nbsp;
            <span style="color:${d.esgDelta >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">🌿 ESG: ${esgSign}${d.esgDelta}</span>
            &nbsp;&nbsp;
            <span style="font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:4px;background:${matchesUnilever ? '#dcfce7' : '#fef3c7'};color:${matchesUnilever ? '#166534' : '#92400e'}">${matchesUnilever ? '✓ Matches Titan' : '≠ Differs from Titan'}</span>
          </div>
          ${d.rationale ? `<div style="font-size:0.85rem;color:#1e293b;background:#eff6ff;border-left:3px solid #3b82f6;padding:0.5rem 0.75rem;border-radius:0 4px 4px 0"><em>Your rationale: ${d.rationale}</em></div>` : '<div style="font-size:0.8rem;color:#94a3b8;font-style:italic">No rationale provided</div>'}
        </div>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Titan Challenge — ${playerName}</title>
    <style>body{font-family:Georgia,serif;max-width:760px;margin:2rem auto;padding:1rem;color:#1e293b}h1{font-size:1.6rem;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:0.5rem}h2{font-size:1.1rem;color:#1e3a5f;margin-top:1.5rem}.score-box{display:inline-block;padding:0.5rem 1.2rem;border-radius:8px;font-weight:700;font-size:1rem;margin-right:1rem}.archetype{background:#1e3a5f;color:#fff;padding:1rem 1.5rem;border-radius:8px;margin:1rem 0}@media print{body{margin:0.5rem}}</style>
    </head><body>
    <h1>The Titan Challenge — Player Summary</h1>
    <p><strong>Player:</strong> ${playerName} &nbsp;&nbsp; <strong>Email:</strong> ${playerEmail} &nbsp;&nbsp; <strong>Date:</strong> ${date}</p>
    <div>
      <span class="score-box" style="background:#eff6ff;color:#1e3a5f">📊 Investor Confidence: ${investor}</span>
      <span class="score-box" style="background:#f0fdf4;color:#166534">🌿 ESG Credibility: ${esg}</span>
      <span class="score-box" style="background:#f8fafc;color:#475569">⭐ Average: ${((investor + esg) / 2).toFixed(1)}</span>
    </div>
    <div class="archetype"><div style="font-size:0.75rem;opacity:0.7;text-transform:uppercase;letter-spacing:0.1em">CEO Archetype</div><div style="font-size:1.2rem;font-weight:700">${archetype.title}</div><div style="font-size:0.9rem;margin-top:0.3rem;opacity:0.9">${archetype.desc}</div></div>
    <h2>Decision Journey</h2>
    ${decisionsHTML}
    <p style="font-size:0.8rem;color:#94a3b8;margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:0.75rem">Generated by The Titan Challenge — MSAF7008 Corporate Governance and Social Responsibility</p>
    </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  }

  function restartFromChapter1() {
    // Soft reset — keeps player name/email, restarts from Chapter A decision 1
    setInvestor(10); setEsg(10);
    setCurrentChapter('A');
    setCompletedChapters([]);
    setChoices({});
    setChoiceLabels({});
    setDecisions([]);
    setModal(null);
    setSubmitted(false);
    startTimeRef.current = Date.now();
    setScreen('opening');
    scrollTop();
  }

  const ch = currentChapter;
  const chData = ch ? DATA[ch] : null;

  return (
    <div className="game-wrapper">
      {/* ── PASSWORD GATE ── */}
      {screen === 'password' && (
        <PasswordGate onUnlock={() => setScreen('register')} />
      )}

      {screen !== 'password' && (
      <>
      <NavBar currentChapter={currentChapter} completedChapters={completedChapters} visible={screen !== 'register' && screen !== 'title' && screen !== 'gameover' && screen !== 'final' && screen !== 'ranking'} />
      <ConfirmationModal data={confirmData} rationale={rationale} setRationale={setRationale} onConfirm={confirmDecision} onCancel={() => setConfirmData(null)} />
      <Modal data={modal} investor={investor} esg={esg} onClose={() => {}} />

      <div className="container">

        {/* ── REGISTER ── */}
        {screen === 'register' && (
          <div className="screen active">
            <div className="hero-image title-hero">
              <img src={HERO_IMAGE} alt="The Titan Challenge" />
              <div className="hero-overlay">
                <h1>The Titan Challenge</h1>
              </div>
            </div>
            <div className="card">
              <div className="card-header">Welcome — Please Introduce Yourself</div>
              <p>Before you begin, please enter your name and email address. Your results will be recorded for class discussion.</p>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="e.g. Jane Smith" value={playerName} onChange={e => setPlayerName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="e.g. jane@university.edu" value={playerEmail} onChange={e => setPlayerEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary">Enter the Game →</button>
              </form>
            </div>
          </div>
        )}

        {/* ── TITLE ── */}
        {screen === 'title' && (
          <div className="screen active">
            <div className="hero-image title-hero">
              <img src={HERO_IMAGE} alt="The Titan Challenge" />
              <div className="hero-overlay">
                <h1>The Titan Challenge</h1>
              </div>
            </div>
            <div className="card">
              <p>Welcome, <strong>{playerName}</strong>. You are the CEO of Titan Consumer Group — a global company that sells products in 190 countries. Over four chapters, you will make decisions about brands that Titan acquires. These brands were built on strong social and environmental values.</p>
              <p>Every decision affects two scores: <strong>Investor Confidence</strong> (how much investors trust you) and <strong>ESG Credibility</strong> (how believable your environmental and social commitments are). Your scores carry forward from chapter to chapter. If either score drops to zero, the board will remove you.</p>
              <p><strong>Every choice has consequences.</strong></p>
            </div>
            <ScoreDisplay investor={investor} esg={esg} />
            <button className="btn-primary btn-block" onClick={startGame}>Begin Chapter A</button>
          </div>
        )}

        {/* ── CHAPTER OPENING ── */}
        {screen === 'opening' && ch && chData && (
          <div className="screen active">
            <div className="hero-image">
              <img src={CHAPTER_IMAGES[ch]} alt={chData.opening.title} />
            </div>
            <h2>{chData.opening.title}</h2>
            <ScoreDisplay investor={investor} esg={esg} />
            <div className="card" style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: chData.opening.text }} />
            <button className="btn-primary btn-block" onClick={() => { setScreen('decision1'); scrollTop(); }}>Make Your First Decision</button>
          </div>
        )}

        {/* ── DECISION 1 ── */}
        {screen === 'decision1' && ch && chData && (
          <div className="screen active">
            <ScoreDisplay investor={investor} esg={esg} />
            <div className="card">
              <div className="card-header">{chData.d1.title}</div>
              <p>{chData.d1.context}</p>
              <div className="options-grid">
                {chData.d1.options.map((opt: Option) => (
                  <button key={opt.id} className="option-btn" onClick={() => handleDecision(ch, 1, opt.id)}>
                    <span className="option-label">Option {opt.id}: {opt.label}</span>
                    <span className="option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DECISION 2 ── */}
        {screen === 'decision2' && ch && chData && (
          <div className="screen active">
            <ScoreDisplay investor={investor} esg={esg} />
            <div className="card">
              <div className="card-header">{chData.d2.title}</div>
              <p>{chData.d2.getContext(choices[ch + '1'] || 'A')}</p>
              <div className="options-grid">
                {chData.d2.options.map((opt: Option) => (
                  <button key={opt.id} className="option-btn" onClick={() => handleDecision(ch, 2, opt.id)}>
                    <span className="option-label">Option {opt.id}: {opt.label}</span>
                    <span className="option-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAPTER OUTCOME ── */}
        {screen === 'outcome' && ch && chData && (
          <div className="screen active">
            <ScoreDisplay investor={investor} esg={esg} />
            <h2 style={{ marginTop: '1rem' }}>{chData.opening.title} — Results</h2>

            {/* Per-decision contrast block */}
            <div className="reveal-contrast-block" style={{ marginTop: '1.25rem' }}>
              <div className="reveal-contrast-header">
                <img src={CHAPTER_IMAGES[ch]} alt={CHAPTER_NAMES[ch]} className="reveal-contrast-img" />
                <div className="reveal-contrast-title">
                  <div className="reveal-contrast-tag">What Actually Happened</div>
                  <h3 className="reveal-contrast-brand">{chData.opening.title}</h3>
                  <p className="reveal-contrast-desc">{chData.outcome.whatHappened.split('\n\n')[0]}</p>
                </div>
              </div>

              {[1, 2].map(dNum => {
                const key = ch + dNum;
                const choiceId = choices[key];
                const opts = dNum === 1 ? chData.d1.options : chData.d2.options;
                const opt = opts.find((o: Option) => o.id === choiceId);
                const unilever = UNILEVER_DETAIL[key];
                const matched = UNILEVER_ACTUAL[key]?.startsWith('Option ' + choiceId);
                return (
                  <div key={key} className="reveal-decision-row">
                    <div className="reveal-decision-label">Decision {key}</div>
                    <div className="reveal-decision-cols">
                      <div className={`reveal-col reveal-col-you ${matched ? 'matched' : 'different'}`}>
                        <div className="reveal-col-tag you-tag">You chose</div>
                        <div className="reveal-col-choice">Option {choiceId}: {opt?.label}</div>
                        <div className="reveal-col-desc">{opt?.desc}</div>
                        <div className="reveal-col-scores">
                          <span className={`score-change ${(opt?.inv ?? 0) > 0 ? 'positive' : (opt?.inv ?? 0) < 0 ? 'negative' : 'zero'}`}>📊 {(opt?.inv ?? 0) > 0 ? '+' : ''}{opt?.inv}</span>
                          {' '}
                          <span className={`score-change ${(opt?.esg ?? 0) > 0 ? 'positive' : (opt?.esg ?? 0) < 0 ? 'negative' : 'zero'}`}>🌿 {(opt?.esg ?? 0) > 0 ? '+' : ''}{opt?.esg}</span>
                        </div>
                      </div>
                      <div className={`reveal-vs-badge ${matched ? 'match' : 'diff'}`}>
                        {matched ? '✓ Match' : '≠ Differs'}
                      </div>
                      <div className="reveal-col reveal-col-real">
                        <div className="reveal-col-tag real-tag">Unilever did</div>
                        <div className="reveal-col-choice">{unilever?.label}</div>
                        <div className="reveal-col-desc">{unilever?.context}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Full narrative — remaining paragraphs after the first */}
              {chData.outcome.whatHappened.split('\n\n').slice(1).length > 0 && (
                <div className="outcome-narrative">
                  {chData.outcome.whatHappened.split('\n\n').slice(1).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="reflection-box">
              <h3>Reflection Questions</h3>
              <ul>{chData.outcome.reflections.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
            <button className="btn-primary btn-block" onClick={nextChapter}>{chData.outcome.nextLabel}</button>
          </div>
        )}

        {/* ── GAME OVER ── */}
        {screen === 'gameover' && (
          <div className="screen active">
            <div className="game-over-screen">
              <h1>Game Over</h1>
              <p style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>The board has asked for your resignation.</p>
              <p>{gameOverReason}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={restartFromChapter1}>Try Again →</button>
                <button className="btn-secondary" onClick={resetGame} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>Play as Someone Else</button>
              </div>
            </div>
          </div>
        )}

        {/* ── FINAL SUMMARY ── */}
        {screen === 'final' && (
          <FinalSummary
            investor={investor} esg={esg} choices={choices} choiceLabels={choiceLabels}
            playerName={playerName} submitted={submitted} decisions={decisions}
            onReset={resetGame}
            onViewRanking={() => setScreen('ranking')}
            onDownloadPDF={handleDownloadPDF}
          />
        )}

        {/* ── RANKING ── */}
        {screen === 'ranking' && (
          <RankingPage
            currentPlayerName={playerName}
            onPlayAgain={resetGame}
          />
        )}
      </div>
      </>
      )}
    </div>
  );
}

// ─── Collapsible Section ───────────────────────────────────────────────────────
function CollapsibleSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  const paragraphs = content.split('\n\n').map((p, i) => <p key={i}>{p}</p>);
  return (
    <div className={`collapsible ${open ? 'open' : ''}`}>
      <div className="collapsible-header" onClick={() => setOpen(!open)}>
        {title} <span className="collapsible-arrow">▼</span>
      </div>
      <div className="collapsible-body">
        <div className="collapsible-content">{paragraphs}</div>
      </div>
    </div>
  );
}

// ─── Final Summary ───────────────────────────────────────────────────────────────────
function FinalSummary({ investor, esg, choices, choiceLabels, playerName, submitted, decisions, onReset, onViewRanking, onDownloadPDF }: {
  investor: number; esg: number; choices: Record<string, string>; choiceLabels: Record<string, string>;
  playerName: string; submitted: boolean; decisions: DecisionRecord[]; onReset: () => void; onViewRanking: () => void; onDownloadPDF: () => void;
}) {
  const archetype = getArchetype(choices);
  const { data: distData } = trpc.game.getChoiceDistribution.useQuery();
  const distribution = distData?.distribution ?? {};
  const totalClassmates = distData?.total ?? 0;
  return (
    <div className="screen active">
      <h2>Your Journey</h2>
      <p>Here is every decision you made as CEO of Titan Consumer Group:</p>
      <div className="timeline-grid">
        {CHAPTERS.map(ch => [1, 2].map(dNum => {
          const key = ch + dNum;
          const choiceId = choices[key];
          const opts = dNum === 1 ? DATA[ch].d1.options : DATA[ch].d2.options;
          const opt = opts.find((o: Option) => o.id === choiceId);
          if (!opt) return null;
          return (
            <div key={key} className="timeline-item">
              <div className="timeline-marker">{key}</div>
              <div className="timeline-text">
                <div className="tl-label">{CHAPTER_NAMES[ch]} — Decision {dNum}</div>
                <div>Option {choiceId}: {choiceLabels[key]}
                  {' '}<span className={`score-change ${opt.inv > 0 ? 'positive' : opt.inv < 0 ? 'negative' : 'zero'}`}>📊 {opt.inv > 0 ? '+' : ''}{opt.inv}</span>
                  {' '}<span className={`score-change ${opt.esg > 0 ? 'positive' : opt.esg < 0 ? 'negative' : 'zero'}`}>🌿 {opt.esg > 0 ? '+' : ''}{opt.esg}</span>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Final Scores</div>
        <ScoreDisplay investor={investor} esg={esg} />
      </div>

      <div className="archetype-card">
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '0.5rem' }}>Your CEO Archetype</div>
        <h2>{archetype.title}</h2>
        <p>{archetype.desc}</p>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">The Real Story — Identity Reveal</div>
        <p>The companies behind this game are all real. <strong>Titan Consumer Group</strong> is <strong>Unilever</strong> — one of the world's largest consumer goods companies, with over 400 brands and operations in 190 countries.</p>
        <p>Each chapter below reveals the real brand and shows, decision by decision, how your choices compare to what Unilever actually did.</p>
      </div>

      {CHAPTERS.map(ch => {
        const realName = CHAPTER_REVEAL_NAMES[ch].split(' / ')[1];
        const chapterDesc: Record<string, string> = {
          A: "Acquired in 2000. Unilever created an independent board but overrode it in 2022 when Ben & Jerry's tried to stop sales in occupied Palestinian territories.",
          B: "Acquired in 2015. The brand was partially integrated, struggled financially, and was quietly wound down by 2024–2025.",
          C: "Acquired in 2016 for ~$700M. The brand's products survived but its political activism was gradually silenced.",
          D: "Acquired in 2017. Unilever sold its tea business (including Pukka) to CVC Capital Partners for €4.5 billion in 2022. By 2024, Pukka lost its B Corp certification, its Bristol offices were closed, and most staff were let go.",
        };
        return (
          <div key={ch} className="reveal-contrast-block">
            <div className="reveal-contrast-header">
              <img src={CHAPTER_IMAGES[ch]} alt={realName} className="reveal-contrast-img" />
              <div className="reveal-contrast-title">
                <div className="reveal-contrast-tag">Chapter {ch} — {CHAPTER_NAMES[ch]}</div>
                <h3 className="reveal-contrast-brand">{CHAPTER_NAMES[ch]} is <span className="reveal-real-name">{realName}</span></h3>
                <p className="reveal-contrast-desc">{chapterDesc[ch]}</p>
              </div>
            </div>
            {[1, 2].map(dNum => {
              const key = ch + dNum as string;
              const choiceId = choices[key];
              const opts = dNum === 1 ? DATA[ch].d1.options : DATA[ch].d2.options;
              const opt = opts.find((o: Option) => o.id === choiceId);
              const unilever = UNILEVER_DETAIL[key];
              const matched = UNILEVER_ACTUAL[key]?.startsWith('Option ' + choiceId);
              const myDecision = decisions.find(d => d.chapter === key);
              // Classmate distribution for this decision
              const keyDist = distribution[key] ?? {};
              const totalVotes = Object.values(keyDist).reduce((a: number, b) => a + (b as number), 0);
              const classmatePct = (optId: string) => totalVotes > 0 ? Math.round(((keyDist[optId] ?? 0) / totalVotes) * 100) : 0;
              const topClassmateOpt = totalVotes > 0 ? Object.entries(keyDist).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] : null;
              return (
                <div key={key} className="reveal-decision-row">
                  <div className="reveal-decision-label">Decision {key}</div>
                  <div className="reveal-decision-cols three-cols">
                    {/* Column 1: You */}
                    <div className={`reveal-col reveal-col-you ${matched ? 'matched' : 'different'}`}>
                      <div className="reveal-col-tag you-tag">You chose</div>
                      <div className="reveal-col-choice">Option {choiceId}: {opt?.label}</div>
                      <div className="reveal-col-desc">{opt?.desc}</div>
                      <div className="reveal-col-scores">
                        <span className={`score-change ${(opt?.inv ?? 0) > 0 ? 'positive' : (opt?.inv ?? 0) < 0 ? 'negative' : 'zero'}`}>📊 {(opt?.inv ?? 0) > 0 ? '+' : ''}{opt?.inv}</span>
                        {' '}
                        <span className={`score-change ${(opt?.esg ?? 0) > 0 ? 'positive' : (opt?.esg ?? 0) < 0 ? 'negative' : 'zero'}`}>🌿 {(opt?.esg ?? 0) > 0 ? '+' : ''}{opt?.esg}</span>
                      </div>
                      {myDecision?.rationale && (
                        <div className="reveal-rationale">
                          <span className="rationale-label">Your rationale:</span> {myDecision.rationale}
                        </div>
                      )}
                    </div>
                    {/* Column 2: Class aggregate */}
                    <div className="reveal-col reveal-col-class">
                      <div className="reveal-col-tag class-tag">Class choices{totalClassmates > 0 ? ` (n=${totalClassmates})` : ''}</div>
                      {totalVotes > 0 ? (
                        opts.map((o: Option) => {
                          const pct = classmatePct(o.id);
                          const isYours = o.id === choiceId;
                          const isTop = o.id === topClassmateOpt;
                          return (
                            <div key={o.id} className={`class-bar-row ${isYours ? 'class-bar-yours' : ''}`}>
                              <div className="class-bar-label">
                                <span className="class-bar-opt">Opt {o.id}</span>
                                {isTop && <span className="class-bar-top-badge">Most popular</span>}
                                {isYours && <span className="class-bar-you-badge">You</span>}
                              </div>
                              <div className="class-bar-track">
                                <div className="class-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="class-bar-pct">{pct}%</div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="class-bar-empty">No class data yet</div>
                      )}
                    </div>
                    {/* Column 3: Titan actual */}
                    <div className="reveal-col reveal-col-real">
                      <div className="reveal-col-tag real-tag">Titan (Unilever) did</div>
                      <div className={`reveal-vs-badge inline-badge ${matched ? 'match' : 'diff'}`}>{matched ? '✓ Matches your choice' : '≠ Differs from your choice'}</div>
                      <div className="reveal-col-choice">{unilever?.label}</div>
                      <div className="reveal-col-desc">{unilever?.context}</div>
                    </div>
                  </div>
                  {/* Discussion prompt */}
                  <div className="discussion-prompt">
                    <span className="discussion-prompt-icon">💬</span>
                    <span className="discussion-prompt-text">{DISCUSSION_PROMPTS[key]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="final-reflection">
        <p>You managed four ESG acquisitions. Unilever managed the same four in real life.</p>
        <p>Looking at the comparison: where did your decisions match Unilever's? Where did they differ? And what does the pattern tell you about whether large companies can genuinely protect the ESG brands they acquire — or whether the structure of corporate ownership itself makes this impossible?</p>
      </div>

      {submitted && (
        <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--esg-green)', background: 'var(--esg-green-bg)' }}>
          <p style={{ color: 'var(--esg-green)', fontWeight: 700, marginBottom: 0 }}>✓ Your results have been recorded, {playerName}. Your instructor will review your performance.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={onViewRanking}>🏆 View Class Ranking</button>
        <button className="btn-primary" style={{ flex: 1, background: '#0f766e' }} onClick={onDownloadPDF}>📄 Download My Summary (PDF)</button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onReset}>Play Again</button>
      </div>
    </div>
  );
}
