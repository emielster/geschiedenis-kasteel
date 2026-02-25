// written by @emielster (emielster.dev)
// App.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CastleBackground } from './Castle';
import { SpinnerCircle, LoadingDots, ConnectionStatus, LoadingOverlay } from './LoadingSpinner';
import './styles.css';

const supabase = createClient(
  'https://xqyzzujbfzuzdbhauhcn.supabase.co',
  'sb_publishable_GpWwn2ycs3dmdeOBQv2gpw_1vG_RtO6',
  { auth: { persistSession: false } }
);

type Question = { text: string; choices: string[]; correct: number };

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

function useChannel(code: string | null, name: string | null, isHost = false) {
  const [channel, setChannel] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState<Array<{ name: string; score: number; isHost?: boolean }>>([]);
  const [incomingQuestion, setIncomingQuestion] = useState<Question | null>(null);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!code || !name) {
      console.log('Skipping channel setup - code or name missing', { code, name });
      return;
    }

    console.log('Setting up channel for:', { code, name, isHost });
    const chan = supabase.channel(`quiz-${code}`, { 
      config: { 
        presence: { key: name },
        broadcast: { ack: false } // ADD THIS - don't wait for acknowledgments
      } 
    });

    const updatePlayers = () => {
      try {
        const state = chan.presenceState() as Record<string, any[]>;
        console.log('Raw presence state:', state); // ADD THIS
        if (state && typeof state === 'object') {
          const list = Object.values(state).flat().map((p: any) => ({ name: p.name, score: p.score ?? 0, isHost: p.isHost }));
          setPlayers(list);
          console.log('Players updated:', list);
        }
      } catch (e) {
        console.error('Presence error:', e);
      }
    };

    chan.on('presence', { event: 'sync' }, updatePlayers);
    chan.on('presence', { event: 'join' }, updatePlayers);
    chan.on('presence', { event: 'leave' }, updatePlayers);

    chan.on('broadcast', { event: 'question' }, (message: any) => {
      console.log('Question received:', message);
      const data = message.payload || message;
      setIncomingQuestion(data.question);
      setIncomingIndex(data.index);
    });

    chan.on('broadcast', { event: 'score-update' }, (payload: any) => {
      setScores(payload.scores || {});
    });

    chan.subscribe(async (status: string) => {
      console.log('Channel status:', status, 'for', name, 'isHost:', isHost);
      if (status === 'SUBSCRIBED') {
        // Wait a tiny bit for the channel to stabilize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try { 
          const trackPayload = { name, score: 0, isHost };
          console.log('Attempting to track:', trackPayload);
          const result = await chan.track(trackPayload);
          console.log('Track result:', result);
          console.log('Successfully tracked as:', { name, isHost });
          setIsReady(true);
        } catch (e) {
          console.error('Track error details:', e);
          // Still set ready - the channel is subscribed
          setIsReady(true);
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error - check Supabase connection');
      } else if (status === 'TIMED_OUT') {
        console.error('Channel subscription timed out');
      }
    });

    setChannel(chan);

    return () => {
      console.log('Cleaning up channel for', name);
      try { 
        chan.unsubscribe(); 
      } catch (e) {
        console.error('Unsubscribe error:', e);
      }
    };
  }, [code, name, isHost]);

  const sendQuestion = async (index: number, question: Question) => {
    if (!channel || !isReady) return Promise.reject(new Error('channel not ready'));
    return channel.send({ type: 'broadcast', event: 'question', payload: { index, question } });
  };

  const sendScoreUpdate = async (newScores: Record<string, number>) => {
    if (!channel || !isReady) return;
    await channel.send({ type: 'broadcast', event: 'score-update', payload: { scores: newScores } });
  };

  const sendAnswer = async (index: number, answer: number) => {
    if (!channel || !isReady) return;
    await channel.send({ type: 'broadcast', event: 'player-answer', payload: { name, index, answer } });
  };

  return { channel, isReady, players, incomingQuestion, incomingIndex, scores, sendQuestion, sendScoreUpdate, sendAnswer };
}

function Lobby({ name, isHost, onExit }: { name: string; isHost: boolean; onExit: () => void }) {
  const room = 'main';
  const { channel, isReady, players, incomingQuestion, incomingIndex, scores, sendQuestion, sendScoreUpdate, sendAnswer } = useChannel(room, name || null, isHost);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isHost && questions.length === 0 && !questionsLoading) {
      console.log('Loading questions...');
      setQuestionsLoading(true);
      fetch('/questions.json')
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            console.log('Questions loaded:', data.length);
            setQuestions(data as Question[]);
            setLoadError(null);
          } else {
            setLoadError('Invalid questions format');
          }
        })
        .catch((err) => {
          console.error('Failed to load questions:', err);
          setLoadError(`Failed to load questions: ${err.message}`);
        })
        .finally(() => setQuestionsLoading(false));
    }
  }, [isHost, questions.length, questionsLoading]);

  const startGame = async () => {
    if (!channel) {
      alert('Channel not initialized');
      return;
    }
    if (!isReady) {
      alert('Game not ready yet, try again');
      return;
    }
    if (questions.length === 0) {
      alert('No questions loaded');
      return;
    }
    
    setIsStarting(true);
    try {
      console.log('Starting game with question 0');
      await sendQuestion(0, questions[0]);
      setCurrentIndex(0);
    } catch (e) {
      console.error('Failed to start game:', e);
      alert('Failed to start game: ' + (e as any).message);
    } finally {
      setIsStarting(false);
    }
  };

  const nextQuestion = async () => {
    if (!channel || !isReady) return;
    const next = (currentIndex ?? -1) + 1;
    if (next >= questions.length) {
      await channel.send({ type: 'broadcast', event: 'end', payload: {} });
      setCurrentIndex(null);
      return;
    }
    try {
      await sendQuestion(next, questions[next]);
      setCurrentIndex(next);
      await sendScoreUpdate({});
    } catch (e) {
      console.error('Failed to send next question:', e);
    }
  };

  // Host listens for answers and tallies
  useEffect(() => {
    if (!channel) return;
    const sub = channel.on('broadcast', { event: 'player-answer' }, async (payload: any) => {
      const { name: playerName, index, answer } = payload;
      const q = questions[index];
      if (!q) return;
      const ok = q.correct === answer;
      const state = channel.presenceState() as Record<string, any[]>;
      const flat = Object.values(state).flat();
      const currentScores: Record<string, number> = {};
      flat.forEach((p: any) => { currentScores[p.name] = p.score ?? 0; });
      currentScores[playerName] = (currentScores[playerName] || 0) + (ok ? 1 : 0);
      await channel.send({ type: 'broadcast', event: 'score-update', payload: { scores: currentScores } });
    });
    return () => { try { sub.unsubscribe(); } catch (e) {} };
  }, [channel, questions]);

  return (
    <div className="app-root">
      {isStarting && <LoadingOverlay message="Starting game..." />}
      
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>Hertogen van Brabant</h1>
        <div className="lobby-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem' }}>{isHost ? 'hosting' : `joined as ${name}`}</h2>
          </div>
          <button className="secondary" onClick={onExit}>Exit</button>
        </div>

        {/* Connection Status with animated indicator */}
        <ConnectionStatus isReady={isReady} />

        {loadError && isHost && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.85rem'
          }}>
            ⚠️ {loadError}
          </div>
        )}

        <div className="section">
          <h3>Players ({players.filter((p) => !p.isHost).length})</h3>
          {players.filter((p) => !p.isHost).length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
              <p style={{ color: 'rgba(31, 41, 55, 0.5)', fontSize: '0.9rem', margin: 0 }}>No players yet...</p>
              <LoadingDots text="" />
            </div>
          ) : (
            <div className="players-list">
              {players.filter((p) => !p.isHost).map((p, i) => (
                <div key={i} className="player-badge">
                  {p.name} · {scores[p.name] ?? p.score} points
                </div>
              ))}
            </div>
          )}
        </div>

        {isHost ? (
          <div className="section">
            <h3>Controls</h3>
            <div className="row" style={{ marginTop: 8 }}>
              <button onClick={startGame} disabled={questions.length === 0 || !isReady || isStarting} style={{ flex: 1, position: 'relative' }}>
                {isStarting ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      borderTopColor: 'var(--blue)',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Starting...
                  </div>
                ) : (
                  currentIndex === null ? 'Start Game' : 'Running'
                )}
              </button>
              <button onClick={nextQuestion} disabled={questions.length === 0 || currentIndex === null || !isReady} className="secondary">
                Next
              </button>
              <button
                onClick={async () => {
                  if (channel) {
                    await channel.send({ type: 'broadcast', event: 'end', payload: {} });
                    setCurrentIndex(null);
                  }
                }}
                className="secondary"
              >
                End
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'rgba(31, 41, 55, 0.5)', textAlign: 'center' }}>
              {questionsLoading ? 'Loading questions...' : `${questions.length} questions loaded`}
              {' · '}
              Channel: {isReady ? '✓ Connected' : '⏳ Connecting...'}
            </div>
          </div>
        ) : (
          <div className="section">
            {incomingQuestion ? (
              <QuestionBlock question={incomingQuestion} index={incomingIndex ?? 0} onAnswer={(ans) => sendAnswer(incomingIndex ?? 0, ans)} />
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

function QuestionBlock({ question, index, onAnswer }: { question: Question; index: number; onAnswer: (ans: number) => void }) {
  const [answered, setAnswered] = useState<boolean>(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    setAnswered(false);
    setSelected(null);
    setTimeLeft(15);
  }, [question, index]);

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      setAnswered(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered]);

  const handle = (i: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(i);
    onAnswer(i);
  };

  const isCorrect = selected === question.correct;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, flex: 1, fontSize: '1.3rem' }}>{question.text}</h3>
        <div className={`timer${timeLeft <= 5 && !answered ? ' warning' : ''}`}>{timeLeft}</div>
      </div>

      <div className="grid-choices">
        {question.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => handle(i)}
            className={`choice${selected === i ? ' selected' : ''}${answered && selected === i ? (isCorrect ? ' correct' : ' incorrect') : ''}`}
            disabled={answered && selected !== i}
            style={{ position: 'relative' }}
          >
            <span>{c}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className={`feedback${!isCorrect ? ' wrong' : ''}`} style={{ marginTop: '16px' }}>
          {isCorrect ? '✓ Correct!' : `✗ Wrong: ${question.choices[question.correct]}`}
        </div>
      )}

      {answered && (
        <div className="score-display" style={{ marginTop: '12px' }}>
          Next question coming...
        </div>
      )}
    </div>
  );
}