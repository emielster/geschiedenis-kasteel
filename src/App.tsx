import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CastleBackground } from './Castle';
import { LoadingDots, ConnectionStatus, LoadingOverlay } from './LoadingSpinner';
import './styles.css';

const g = globalThis as any;
if (!g.__supabase__) {
  g.__supabase__ = createClient(
    'https://xqyzzujbfzuzdbhauhcn.supabase.co',
    'sb_publishable_GpWwn2ycs3dmdeOBQv2gpw_1vG_RtO6',
    { auth: { persistSession: false } }
  );
}
const supabase = g.__supabase__;

type Question = { text: string; choices: string[]; correct: number };

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MAX_TIME = 15;

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  return (
    <>
      <CastleBackground />
      <div className="content-wrapper">
        {path.startsWith('/host') ? <HostLanding /> : <JoinLanding />}
      </div>
    </>
  );
}

function HostLanding() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div className="app-root">
        <div className="card join-card">
          <h1>Hertogen van Brabant</h1>
          <div className="join-section">
            <h2 className="join-title">Host a Game</h2>
            <p className="join-subtitle">Create a quiz and manage players</p>
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
            <button disabled={!name} onClick={() => setStarted(true)} className="join-button">Start Hosting</button>
            <button className="secondary" onClick={() => { window.location.pathname = '/'; }} style={{ width: '100%', marginTop: '10px' }}>Back</button>
          </div>
          <footer className="footer">made by Emiel, Louis, Oscar en Fjorre</footer>
        </div>
      </div>
    );
  }
  return <Lobby name={name} isHost={true} onExit={() => { window.location.pathname = '/'; }} />;
}

function JoinLanding() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  if (!joined) {
    return (
      <div className="app-root">
        <div className="card join-card">
          <h1>Hertogen van Brabant</h1>
          <div className="join-section">
            <h2 className="join-title">Join a Game</h2>
            <p className="join-subtitle">Enter your name to join the quiz</p>
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
            <button disabled={!name} onClick={() => setJoined(true)} className="join-button">Join Game</button>
          </div>
          <footer className="footer">made by Emiel, Louis, Oscar en Fjorre</footer>
        </div>
      </div>
    );
  }
  return <Lobby name={name} isHost={false} onExit={() => { setJoined(false); setName(''); }} />;
}

function useChannel(code: string, name: string, isHost: boolean) {
  const nameRef = useRef(name);
  const isHostRef = useRef(isHost);
  nameRef.current = name;
  isHostRef.current = isHost;

  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState<Array<{ name: string; score: number; isHost?: boolean }>>([]);
  const [incomingQuestion, setIncomingQuestion] = useState<Question | null>(null);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const [lastPointsEarned, setLastPointsEarned] = useState<{ playerName: string; points: number } | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    const chan = supabase.channel(`quiz-${code}`, {
      config: {
        presence: { key: name },
        broadcast: { ack: false, self: true },
      },
    });
    channelRef.current = chan;

    const updatePlayers = () => {
      if (!mountedRef.current) return;
      const state = chan.presenceState() as Record<string, any[]>;
      const list = Object.values(state).flat().map((p: any) => ({
        name: p.name,
        score: p.score ?? 0,
        isHost: p.isHost ?? false,
      }));
      setPlayers(list);
    };

    chan.on('presence', { event: 'sync' }, updatePlayers);
    chan.on('presence', { event: 'join' }, updatePlayers);
    chan.on('presence', { event: 'leave' }, updatePlayers);

    chan.on('broadcast', { event: 'question' }, (msg: any) => {
      const data = msg.payload ?? msg;
      setGameEnded(false);
      setShowLeaderboard(false); 
      setLastPointsEarned(null);
      setIncomingQuestion(data.question);
      setIncomingIndex(data.index);
    });

    chan.on('broadcast', { event: 'score-update' }, (msg: any) => {
      const data = msg.payload ?? msg;
      setScores(data.scores ?? {});
    });

    chan.on('broadcast', { event: 'points-earned' }, (msg: any) => {
      const data = msg.payload ?? msg;
      setLastPointsEarned({ playerName: data.playerName, points: data.points });
    });

    chan.on('broadcast', { event: 'show-leaderboard' }, (msg: any) => {
      const data = msg.payload ?? msg;
      
      if (data.scores) setScores(data.scores);
      setShowLeaderboard(true);
    });

    chan.on('broadcast', { event: 'end' }, () => {
      setGameEnded(true);
      setShowLeaderboard(false);
      setIncomingQuestion(null);
    });

    chan.subscribe(async (status: string) => {
      if (!mountedRef.current) return;
      if (status === 'SUBSCRIBED') {
        await new Promise((r) => setTimeout(r, 300));
        if (!mountedRef.current) return;
        const payload = { name: nameRef.current, score: 0, isHost: isHostRef.current };
        try {
          await chan.track(payload);
          if (mountedRef.current) setIsReady(true);
        } catch (e) {
          if (mountedRef.current) setIsReady(true);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      channelRef.current = null;
      setIsReady(false);
      try { chan.untrack(); } catch (_) {}
      try { supabase.removeChannel(chan); } catch (_) {}
    };
  }, [code, name]);

  const sendQuestion = (index: number, question: Question) => {
    const chan = channelRef.current;
    if (!chan) return Promise.reject(new Error('no channel'));
    return chan.send({ type: 'broadcast', event: 'question', payload: { index, question } });
  };

  const sendScoreUpdate = (newScores: Record<string, number>) => {
    const chan = channelRef.current;
    if (!chan) return;
    return chan.send({ type: 'broadcast', event: 'score-update', payload: { scores: newScores } });
  };

  const sendAnswer = (index: number, answer: number, timeLeft: number) => {
    const chan = channelRef.current;
    if (!chan) return;
    return chan.send({ type: 'broadcast', event: 'player-answer', payload: { name: nameRef.current, index, answer, timeLeft } });
  };

  const broadcastLeaderboard = (currentScores: Record<string, number>) => {
    const chan = channelRef.current;
    if (!chan) return;
    return chan.send({ type: 'broadcast', event: 'show-leaderboard', payload: { scores: currentScores } });
  };

  return {
    channelRef, isReady, players,
    incomingQuestion, incomingIndex,
    scores, lastPointsEarned,
    gameEnded, showLeaderboard, setShowLeaderboard,
    sendQuestion, sendScoreUpdate, sendAnswer, broadcastLeaderboard,
  };
}

function Leaderboard({ scores, players, isFinal, onContinue }: {
  scores: Record<string, number>;
  players: Array<{ name: string; score: number; isHost?: boolean }>;
  isFinal: boolean;
  onContinue?: () => void;
}) {
  
  const sorted = players
    .filter((p) => !p.isHost)
    .map((p) => ({ name: p.name, score: scores[p.name] ?? p.score ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); 

  const maxScore = Math.max(...sorted.map((p) => p.score), 1);
  const total = sorted.length;

  const [phase, setPhase] = useState(0);
  const [pillarsUp, setPillarsUp] = useState<number[]>([]);
  const [namesVisible, setNamesVisible] = useState<number[]>([]);
  const [showWinner, setShowWinner] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setPhase(0);
    setPillarsUp([]);
    setNamesVisible([]);
    setShowWinner(false);
    setShowButton(false);

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let revealStep = 0; revealStep < total; revealStep++) {
      const sortedIdx = total - 1 - revealStep; 
      const delay = 600 + revealStep * 1000;

      timers.push(setTimeout(() => {
        setPillarsUp((prev) => [...prev, sortedIdx]);
        
        timers.push(setTimeout(() => {
          setNamesVisible((prev) => [...prev, sortedIdx]);
        }, 400));
      }, delay));
    }

    const winnerDelay = 600 + total * 1000 + 400;
    timers.push(setTimeout(() => setShowWinner(true), winnerDelay));
    timers.push(setTimeout(() => setShowButton(true), winnerDelay + 600));

    return () => timers.forEach(clearTimeout);
  }, [scores, total]);

  const PILLAR_COLORS = [
    'linear-gradient(180deg,#FFD700,#FFA500)',   
    'linear-gradient(180deg,#C0C0C0,#909090)',   
    'linear-gradient(180deg,#CD7F32,#9a5a1e)',   
    'linear-gradient(180deg,#6366f1,#4338ca)',   
    'linear-gradient(180deg,#3b82f6,#1d4ed8)',   
  ];

  const PILLAR_HEIGHT = 220; 

  return (
    <div className="lb2-bg">
      {}
      <div className="lb2-title" style={{ animation: 'fadeIn 0.5s ease' }}>
        {isFinal ? '🏆 Final Results' : '📊 Leaderboard'}
      </div>

      {}
      <div className="lb2-stage">
        {}
        {sorted.map((player, i) => {
          const heightPx = Math.max(Math.round((player.score / maxScore) * PILLAR_HEIGHT), 28);
          const isUp = pillarsUp.includes(i);
          const nameVis = namesVisible.includes(i);
          const isFirst = i === 0;

          return (
            <div key={player.name} className="lb2-col">
              {}
              <div
                className="lb2-nametag"
                style={{
                  opacity: nameVis ? 1 : 0,
                  transform: nameVis ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
                  transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <div className="lb2-medal">{i < 3 ? MEDALS[i] : `#${i+1}`}</div>
                <div className="lb2-playername">{player.name}</div>
                <div className="lb2-pts">{player.score} pts</div>
              </div>

              {}
              <div
                className={`lb2-pillar${isFirst && showWinner ? ' lb2-pillar-winner' : ''}`}
                style={{
                  height: isUp ? `${heightPx}px` : '0px',
                  background: PILLAR_COLORS[i] ?? PILLAR_COLORS[4],
                  transition: isUp
                    ? 'height 0.7s cubic-bezier(0.34,1.56,0.64,1)'
                    : 'none',
                  boxShadow: isFirst && showWinner
                    ? '0 0 32px rgba(255,215,0,0.6), 0 0 64px rgba(255,215,0,0.3)'
                    : undefined,
                }}
              />
            </div>
          );
        })}

        {}
        <div className="lb2-floor" />
      </div>

      {}
      {isFinal && showWinner && sorted[0] && (
        <div className="lb2-winner" style={{ animation: 'feedbackPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <span className="lb2-winner-crown">👑</span>
          <span className="lb2-winner-text">{sorted[0].name} wins!</span>
        </div>
      )}

      {onContinue && showButton && (
        <button
          className="join-button"
          onClick={onContinue}
          style={{ marginTop: '24px', animation: 'slideUp 0.4s ease', width: 'auto', padding: '12px 32px', fontSize: '0.95rem' }}
        >
          {isFinal ? 'Play Again' : 'Continue →'}
        </button>
      )}

      {!onContinue && (
        <p className="lb2-waiting">Waiting for next question...</p>
      )}
    </div>
  );
}

function Lobby({ name, isHost, onExit }: { name: string; isHost: boolean; onExit: () => void }) {
  const {
    channelRef, isReady, players,
    incomingQuestion, incomingIndex,
    scores, lastPointsEarned,
    gameEnded, showLeaderboard, setShowLeaderboard,
    sendQuestion, sendScoreUpdate, sendAnswer, broadcastLeaderboard,
  } = useChannel('main', name, isHost);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHost || questions.length > 0 || questionsLoading) return;
    setQuestionsLoading(true);
    fetch('/questions.json')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (Array.isArray(data)) { setQuestions(data); setLoadError(null); } else { setLoadError('Invalid questions format'); } })
      .catch((err) => setLoadError(`Failed to load questions: ${err.message}`))
      .finally(() => setQuestionsLoading(false));
  }, [isHost, questions.length, questionsLoading]);

  const scoresRef = useRef(scores);
  scoresRef.current = scores;

  useEffect(() => {
    const chan = channelRef.current;
    if (!chan || !isReady || !isHost || questions.length === 0) return;

    const handleAnswer = async (msg: any) => {
      const { name: playerName, index, answer, timeLeft } = msg.payload ?? msg;
      const q = questions[index];
      if (!q) return;

      const correct = q.correct === answer;
      
      const points = correct ? Math.round(500 + ((timeLeft ?? 0) / MAX_TIME) * 500) : 0;

      const currentScores = { ...scoresRef.current };
      currentScores[playerName] = (currentScores[playerName] ?? 0) + points;

      await chan.send({ type: 'broadcast', event: 'score-update', payload: { scores: currentScores } });
      await chan.send({ type: 'broadcast', event: 'points-earned', payload: { playerName, points } });
    };

    chan.on('broadcast', { event: 'player-answer' }, handleAnswer);
  }, [isReady, isHost, questions, channelRef]);

  const startGame = async () => {
    if (!isReady || questions.length === 0) { alert('Not ready yet'); return; }
    setIsStarting(true);
    try {
      await sendQuestion(0, questions[0]);
      setCurrentIndex(0);
    } catch (e) {
      alert('Failed to start: ' + (e as any).message);
    } finally {
      setIsStarting(false);
    }
  };

  const nextQuestion = async () => {
    const chan = channelRef.current;
    if (!chan || !isReady) return;
    const next = (currentIndex ?? -1) + 1;
    if (next >= questions.length) {
      await chan.send({ type: 'broadcast', event: 'end', payload: {} });
      setCurrentIndex(null);
      return;
    }
    await sendQuestion(next, questions[next]);
    setCurrentIndex(next);
  };

  const showScores = async () => {
    
    await broadcastLeaderboard(scores);
  };

  if (gameEnded) {
    return (
      <Leaderboard
        scores={scores}
        players={players}
        isFinal={true}
        onContinue={isHost ? () => window.location.reload() : undefined}
      />
    );
  }

  if (showLeaderboard) {
    return (
      <Leaderboard
        scores={scores}
        players={players}
        isFinal={false}
        onContinue={isHost ? () => setShowLeaderboard(false) : undefined}
      />
    );
  }

  return (
    <div className="app-root">
      {isStarting && <LoadingOverlay message="Starting game..." />}

      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Hertogen van Brabant</h1>
        <div className="lobby-header">
          <h2 style={{ margin: 0, fontSize: '1rem' }}>{isHost ? 'hosting' : `joined as ${name}`}</h2>
          <button className="secondary" onClick={onExit}>Exit</button>
        </div>

        <ConnectionStatus isReady={isReady} />

        {loadError && isHost && (
          <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
            ⚠️ {loadError}
          </div>
        )}

        <div className="section">
          <h3>Players ({players.filter((p) => !p.isHost).length})</h3>
          {players.filter((p) => !p.isHost).length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
              <p style={{ color: 'rgba(31,41,55,0.5)', fontSize: '0.9rem', margin: 0 }}>No players yet...</p>
              <LoadingDots text="" />
            </div>
          ) : (
            <div className="players-list">
              {players
                .filter((p) => !p.isHost)
                .sort((a, b) => (scores[b.name] ?? b.score ?? 0) - (scores[a.name] ?? a.score ?? 0))
                .map((p, i) => (
                  <div key={p.name} className="player-badge" style={{ borderColor: i === 0 && (scores[p.name] ?? 0) > 0 ? '#FFD700' : undefined }}>
                    {i === 0 && (scores[p.name] ?? 0) > 0 ? '👑 ' : ''}{p.name} · {scores[p.name] ?? p.score ?? 0} pts
                  </div>
                ))}
            </div>
          )}
        </div>

        {isHost ? (
          <div className="section">
            <h3>Controls</h3>
            <div className="row" style={{ marginTop: 8 }}>
              <button onClick={startGame} disabled={questions.length === 0 || !isReady || isStarting} style={{ flex: 1 }}>
                {isStarting ? 'Starting...' : currentIndex === null ? 'Start Game' : 'Running'}
              </button>
              <button onClick={nextQuestion} disabled={questions.length === 0 || currentIndex === null || !isReady} className="secondary">Next</button>
              <button onClick={showScores} disabled={currentIndex === null} className="secondary">🏆 Scores</button>
              <button onClick={async () => {
                const c = channelRef.current;
                if (c) { await c.send({ type: 'broadcast', event: 'end', payload: {} }); setCurrentIndex(null); }
              }} className="secondary">End</button>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'rgba(31,41,55,0.5)', textAlign: 'center' }}>
              {questionsLoading ? 'Loading questions...' : `${questions.length} questions loaded`}
              {currentIndex !== null ? ` · Q${currentIndex + 1}/${questions.length}` : ''}
              {' · '}{isReady ? '✓ Connected' : '⏳ Connecting...'}
            </div>
          </div>
        ) : (
          <div className="section">
            {incomingQuestion ? (
              <QuestionBlock
                question={incomingQuestion}
                index={incomingIndex ?? 0}
                playerName={name}
                playerScore={scores[name] ?? 0}
                lastPointsEarned={lastPointsEarned?.playerName === name ? lastPointsEarned.points : null}
                onAnswer={(ans, timeLeft) => sendAnswer(incomingIndex ?? 0, ans, timeLeft)}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingDots text="Waiting for host to start..." />
              </div>
            )}
          </div>
        )}

        <footer className="footer">made by Emiel, Louis, Oscar en Fjorre</footer>
      </div>
    </div>
  );
}

function QuestionBlock({ question, index, playerName, playerScore, lastPointsEarned, onAnswer }: {
  question: Question;
  index: number;
  playerName: string;
  playerScore: number;
  lastPointsEarned: number | null;
  onAnswer: (ans: number, timeLeft: number) => void;
}) {
  
  const [revealPhase, setRevealPhase] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    setAnswered(false);
    setSelected(null);
    setTimeLeft(MAX_TIME);
    setShowPop(false);
    setRevealPhase(0);

    const t1 = setTimeout(() => setRevealPhase(1), 1400);
    
    const t2 = setTimeout(() => setRevealPhase(2), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [question, index]);

  useEffect(() => {
    if (lastPointsEarned !== null && lastPointsEarned > 0) {
      setShowPop(true);
      const t = setTimeout(() => setShowPop(false), 1200);
      return () => clearTimeout(t);
    }
  }, [lastPointsEarned]);

  useEffect(() => {
    if (revealPhase < 2 || answered) return;
    if (timeLeft <= 0) { setAnswered(true); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, revealPhase]);

  const handle = (i: number) => {
    if (answered || revealPhase < 2) return;
    setAnswered(true);
    setSelected(i);
    onAnswer(i, timeLeft);
  };

  const isCorrect = selected === question.correct;

  return (
    <div style={{ position: 'relative' }}>
      {}
      {revealPhase === 0 && (
        <div className="cinematic-cover" style={{ animation: 'fadeIn 0.4s ease' }}>
          <div className="cinematic-castle">🏰</div>
          <div className="cinematic-question-mark">?</div>
          <p className="cinematic-label">Question {index + 1}</p>
        </div>
      )}

      {}
      {revealPhase >= 1 && (
        <div style={{ animation: revealPhase === 1 ? 'cinematicReveal 0.6s cubic-bezier(0.34,1.56,0.64,1)' : undefined }}>
          {}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(31,41,55,0.5)', fontWeight: 600 }}>
              Question {index + 1}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue)', background: 'rgba(59,130,246,0.08)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.2)' }}>
              {playerScore} pts
            </span>
          </div>

          {}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, flex: 1, fontSize: '1.3rem' }}>{question.text}</h3>
            {revealPhase >= 2 && (
              <div className={`timer${timeLeft <= 5 && !answered ? ' warning' : ''}`}>{timeLeft}</div>
            )}
          </div>

          {}
          <div className="grid-choices">
            {question.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handle(i)}
                className={`choice${revealPhase < 2 ? ' choice-locked' : ''}${selected === i ? ' selected' : ''}${answered && selected === i ? (isCorrect ? ' correct' : ' incorrect') : ''}${answered && i === question.correct && selected !== i ? ' correct' : ''}`}
                disabled={(revealPhase < 2) || (answered && selected !== i && i !== question.correct)}
                style={{
                  animation: revealPhase === 2 ? `choiceUnlock 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both` : undefined,
                }}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>

          {answered && (
            <div className={`feedback${!isCorrect ? ' wrong' : ''}`} style={{ marginTop: '16px' }}>
              {isCorrect
                ? lastPointsEarned !== null
                  ? `✓ Correct! +${lastPointsEarned} points`
                  : '✓ Correct! Calculating points...'
                : `✗ Wrong — ${question.choices[question.correct]} was correct`}
            </div>
          )}

          {showPop && lastPointsEarned !== null && lastPointsEarned > 0 && (
            <div className="points-pop">+{lastPointsEarned}</div>
          )}

          {answered && (
            <div className="score-display" style={{ marginTop: '12px' }}>
              Waiting for next question...
            </div>
          )}
        </div>
      )}
    </div>
  );
}