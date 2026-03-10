import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CHAPTERS, CHAPTER_NAMES, CHAPTER_IMAGES, HERO_IMAGE, DATA, CONSEQUENCES,
  getArchetype, UNILEVER_ACTUAL, CHAPTER_REVEAL_NAMES, getScoreBarWidth, Chapter, Option
} from "@/lib/gameData";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'register' | 'title' | 'opening' | 'decision1' | 'decision2' | 'outcome' | 'gameover' | 'final';
type DecisionRecord = { chapter: string; chapterTitle: string; choiceLabel: string; choiceDesc: string; investorDelta: number; esgDelta: number };
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
  const [screen, setScreen] = useState<Screen>('register');
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
  const [gameOverReason, setGameOverReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const submitResult = trpc.game.submitResult.useMutation({
    onSuccess: () => { toast.success("Your results have been recorded!"); setSubmitted(true); },
    onError: () => toast.error("Could not save results. Please notify your instructor."),
  });

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  function checkGameOver(inv: number, esgVal: number): boolean {
    if (inv < 0 || esgVal < 0) {
      let reason = '';
      if (inv < 0 && esgVal < 0) reason = "Both your Investor Confidence and ESG Credibility have dropped below zero. You lost the trust of investors and the credibility of your sustainability commitments at the same time.";
      else if (inv < 0) reason = "Your Investor Confidence has dropped below zero. Investors have lost faith in your ability to manage the company's financial interests.";
      else reason = "Your ESG Credibility has dropped below zero. The market no longer believes in Titan's environmental and social commitments.";
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

  function handleDecision(ch: Chapter, decisionNum: 1 | 2, optionId: string) {
    const data = DATA[ch];
    const opt = (decisionNum === 1 ? data.d1.options : data.d2.options).find((o: Option) => o.id === optionId)!;
    const key = ch + decisionNum;
    const newInv = investor + opt.inv;
    const newEsg = esg + opt.esg;
    setInvestor(newInv);
    setEsg(newEsg);
    setChoices(prev => ({ ...prev, [key]: optionId }));
    setChoiceLabels(prev => ({ ...prev, [key]: opt.label }));
    setDecisions(prev => [...prev, {
      chapter: key,
      chapterTitle: decisionNum === 1 ? data.d1.title : data.d2.title,
      choiceLabel: `Option ${optionId}: ${opt.label}`,
      choiceDesc: opt.desc,
      investorDelta: opt.inv,
      esgDelta: opt.esg,
    }]);

    const conseq = CONSEQUENCES[key][optionId];
    setModal({
      title: `Decision ${key}: ${opt.label}`,
      consequence: conseq,
      invDelta: opt.inv,
      esgDelta: opt.esg,
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
    setScreen('register'); setInvestor(10); setEsg(10);
    setCurrentChapter(null); setCompletedChapters([]); setChoices({});
    setChoiceLabels({}); setDecisions([]); setModal(null); setSubmitted(false);
    setPlayerName(''); setPlayerEmail('');
    scrollTop();
  }

  const ch = currentChapter;
  const chData = ch ? DATA[ch] : null;

  return (
    <div className="game-wrapper">
      <NavBar currentChapter={currentChapter} completedChapters={completedChapters} visible={screen !== 'register' && screen !== 'title' && screen !== 'gameover' && screen !== 'final'} />
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
            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header">Your Decisions</div>
              <div className="decision-trail">
                {[1, 2].map(dNum => {
                  const key = ch + dNum;
                  const choiceId = choices[key];
                  const opts = dNum === 1 ? chData.d1.options : chData.d2.options;
                  const opt = opts.find((o: Option) => o.id === choiceId);
                  if (!opt) return null;
                  return (
                    <div key={key} className="trail-item">
                      <div className="trail-label">Decision {key}</div>
                      <div className="trail-choice">Option {choiceId}: {opt.label} — <em>{opt.desc}</em></div>
                      <div style={{ marginTop: '0.4rem' }}>
                        <ScoreBadge label="Investor" delta={opt.inv} type="investor" />
                        <ScoreBadge label="ESG" delta={opt.esg} type="esg" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <CollapsibleSection title="What Actually Happened" content={chData.outcome.whatHappened} />
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
              <button className="btn-primary" onClick={resetGame} style={{ marginTop: '1.5rem' }}>Play Again</button>
            </div>
          </div>
        )}

        {/* ── FINAL SUMMARY ── */}
        {screen === 'final' && (
          <FinalSummary
            investor={investor} esg={esg} choices={choices} choiceLabels={choiceLabels}
            playerName={playerName} submitted={submitted} onReset={resetGame}
          />
        )}
      </div>
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

// ─── Final Summary ─────────────────────────────────────────────────────────────
function FinalSummary({ investor, esg, choices, choiceLabels, playerName, submitted, onReset }: {
  investor: number; esg: number; choices: Record<string, string>; choiceLabels: Record<string, string>;
  playerName: string; submitted: boolean; onReset: () => void;
}) {
  const archetype = getArchetype(choices);
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
        <p>The companies behind this game are all real.</p>
        <p><strong>Titan Consumer Group</strong> is <strong>Unilever</strong> — one of the world's largest consumer goods companies, with over 400 brands and operations in 190 countries.</p>
      </div>

      <div className="reveal-grid">
        {CHAPTERS.map(ch => (
          <div key={ch} className="reveal-card">
            <img src={CHAPTER_IMAGES[ch]} alt={CHAPTER_REVEAL_NAMES[ch]} />
            <div className="reveal-card-body">
              <h3>Chapter {ch} — {CHAPTER_NAMES[ch]} is {CHAPTER_REVEAL_NAMES[ch].split(' / ')[1]}</h3>
              <p>{ch === 'A' && "Acquired in 2000. Unilever created an independent board but overrode it in 2022 when Ben & Jerry's tried to stop sales in occupied Palestinian territories."}
                {ch === 'B' && "Acquired in 2015. The brand was partially integrated, struggled financially, and was quietly wound down by 2024-2025."}
                {ch === 'C' && "Acquired in 2016 for ~$700M. The brand's products survived but its political activism was gradually silenced."}
                {ch === 'D' && "Acquired in 2017. Unilever sold its tea business (including Pukka) to CVC Capital Partners for €4.5 billion in 2022. By 2024, Pukka lost its B Corp certification, its Bristol offices were closed, and most staff were let go."}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Compare Your Decisions with Reality</div>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr><th>Chapter</th><th>Your Choice (D1)</th><th>Your Choice (D2)</th><th>Unilever (D1)</th><th>Unilever (D2)</th></tr>
            </thead>
            <tbody>
              {CHAPTERS.map(ch => (
                <tr key={ch}>
                  <td><strong>{CHAPTER_REVEAL_NAMES[ch]}</strong></td>
                  <td>Option {choices[ch + '1']}: {choiceLabels[ch + '1']}</td>
                  <td>Option {choices[ch + '2']}: {choiceLabels[ch + '2']}</td>
                  <td>{UNILEVER_ACTUAL[ch + '1']}</td>
                  <td>{UNILEVER_ACTUAL[ch + '2']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="final-reflection">
        <p>You managed four ESG acquisitions. Unilever managed the same four in real life.</p>
        <p>Looking at the comparison: where did your decisions match Unilever's? Where did they differ? And what does the pattern tell you about whether large companies can genuinely protect the ESG brands they acquire — or whether the structure of corporate ownership itself makes this impossible?</p>
      </div>

      {submitted && (
        <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--esg-green)', background: 'var(--esg-green-bg)' }}>
          <p style={{ color: 'var(--esg-green)', fontWeight: 700, marginBottom: 0 }}>✓ Your results have been recorded, {playerName}. Your instructor will review your performance.</p>
        </div>
      )}

      <button className="btn-primary btn-block" onClick={onReset} style={{ marginTop: '1rem' }}>Play Again</button>
    </div>
  );
}
