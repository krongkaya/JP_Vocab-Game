import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy, Users, Swords, Copy, Check, ChevronLeft,
  Crown, Zap, Star, Clock, Play, Wifi
} from 'lucide-react';
import { levelsData } from './vocabData';
import { getSocket, connectSocket, disconnectSocket, battleApi } from './battleSocket';
import type { Player, RoomSnapshot } from './battleSocket';
import './BattleScreen.css';

type BattlePhase =
  | 'role-select'      // เลือก host / join
  | 'host-setup'       // เลือก level + ชื่อ
  | 'join-setup'       // กรอกรหัส + ชื่อ
  | 'waiting-lobby'    // รอผู้เล่น (host & player)
  | 'question'         // แสดงคำถาม
  | 'answer-wait'      // กดตอบแล้ว รอคนอื่น
  | 'question-result'  // เฉลย + คะแนน
  | 'finished';        // จบเกม podium

interface QuestionPayload {
  word: string;
  kana: string;
  romaji: string;
  emoji: string;
  options: string[];
}

interface Props {
  onBack: () => void;
}

const LEVEL_TITLES = ['', 'Hiragana Basics', 'Katakana Words', 'Oishii Food', 'Kawaii Animals', 'Greetings', 'Numbers & Colors'];

export default function BattleScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<BattlePhase>('role-select');
  const [isHost, setIsHost] = useState(false);
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLimit, setTimeLimit] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [myResult, setMyResult] = useState<{ isCorrect: boolean; pointsGained: number } | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [fastestPlayerId, setFastestPlayerId] = useState<string | null>(null);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [myId, setMyId] = useState('');
  const [serverIp, setServerIp] = useState('localhost');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect local IP for showing students
  useEffect(() => {
    // Try to find local network address from location
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') setServerIp(host);
  }, []);

  // Socket setup
  useEffect(() => {
    connectSocket();
    const s = getSocket();
    setMyId(s.id ?? '');

    s.on('connect', () => setMyId(s.id ?? ''));

    s.on('room-created', ({ code, room: r }: { code: string; room: RoomSnapshot }) => {
      setRoomCode(code);
      setRoom(r);
      setPlayers(r.players);
      setPhase('waiting-lobby');
    });

    s.on('room-joined', ({ room: r }: { room: RoomSnapshot }) => {
      setRoomCode(r.code);
      setRoom(r);
      setPlayers(r.players);
      setPhase('waiting-lobby');
    });

    s.on('player-joined', ({ players: pl }: { players: Player[] }) => {
      setPlayers(pl);
    });

    s.on('player-left', ({ players: pl }: { players: Player[] }) => {
      setPlayers(pl);
    });

    s.on('question-started', (payload: {
      question: QuestionPayload;
      questionIndex: number;
      totalQuestions: number;
      timeLimit: number;
    }) => {
      setQuestion(payload.question);
      setQuestionIndex(payload.questionIndex);
      setTotalQuestions(payload.totalQuestions);
      setTimeLimit(payload.timeLimit);
      setTimeLeft(payload.timeLimit);
      setSelectedAnswer(null);
      setMyResult(null);
      setCorrectAnswer(null);
      setPhase('question');
      startTimer(payload.timeLimit);
    });

    s.on('answer-received', ({ isCorrect, pointsGained }: { isCorrect: boolean; pointsGained: number }) => {
      setMyResult({ isCorrect, pointsGained });
      setPhase('answer-wait');
    });

    s.on('question-result', ({
      correctAnswer: ca,
      players: pl,
      fastestPlayerId: fp,
    }: { correctAnswer: string; players: Player[]; fastestPlayerId?: string }) => {
      setCorrectAnswer(ca);
      setPlayers(pl);
      setFastestPlayerId(fp ?? null);
      setPhase('question-result');
      stopTimer();
    });

    s.on('game-finished', ({ players: pl }: { players: Player[] }) => {
      setFinalPlayers(pl);
      setPhase('finished');
      stopTimer();
    });

    s.on('room-dissolved', () => {
      setErrorMsg('ห้องถูกปิดโดยครู');
      setTimeout(() => handleBack(), 3000);
    });

    s.on('error', ({ message }: { message: string }) => {
      setErrorMsg(message);
    });

    return () => {
      stopTimer();
      s.off('connect');
      s.off('room-created');
      s.off('room-joined');
      s.off('player-joined');
      s.off('player-left');
      s.off('question-started');
      s.off('answer-received');
      s.off('question-result');
      s.off('game-finished');
      s.off('room-dissolved');
      s.off('error');
    };
  }, []);

  const startTimer = useCallback((limit: number) => {
    stopTimer();
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { stopTimer(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const handleBack = useCallback(() => {
    stopTimer();
    disconnectSocket();
    onBack();
  }, [onBack, stopTimer]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer || phase !== 'question') return;
    setSelectedAnswer(option);
    battleApi.sendAnswer(roomCode, option);
  };

  // ── OPTION COLORS ──────────────────────────
  const OPTION_COLORS = [
    { bg: '#e74c3c', hover: '#c0392b', label: '🔴' },
    { bg: '#3498db', hover: '#2980b9', label: '🔵' },
    { bg: '#f39c12', hover: '#d68910', label: '🟡' },
    { bg: '#27ae60', hover: '#219a52', label: '🟢' },
  ];

  const getOptionStyle = (option: string, idx: number) => {
    const col = OPTION_COLORS[idx % 4];
    if (!selectedAnswer && phase === 'question') {
      return { background: col.bg };
    }
    if (phase === 'question-result' || phase === 'answer-wait') {
      if (correctAnswer && option === correctAnswer) return { background: '#27ae60', boxShadow: '0 0 20px rgba(39,174,96,0.6)' };
      if (option === selectedAnswer && !myResult?.isCorrect) return { background: '#c0392b', opacity: 0.7 };
      return { background: col.bg, opacity: 0.45 };
    }
    if (option === selectedAnswer) return { background: '#7f8c8d' };
    return { background: col.bg };
  };

  // ── RENDERS ────────────────────────────────

  // Phase: role-select
  if (phase === 'role-select') return (
    <div className="battle-screen battle-dark">
      <button className="battle-back-btn" onClick={handleBack}><ChevronLeft size={20} /></button>
      <div className="battle-hero">
        <div className="battle-hero-icon">⚔️</div>
        <h1 className="battle-hero-title">โหมดแข่งขัน</h1>
        <p className="battle-hero-sub">Battle Room — ใครตอบเร็วสุดได้คะแนนสูงสุด!</p>
      </div>
      <div className="battle-role-cards">
        <button className="battle-role-card host-card" onClick={() => { setIsHost(true); setPhase('host-setup'); }}>
          <Crown size={36} className="role-icon" />
          <div className="role-label">ครู / โฮสต์</div>
          <div className="role-desc">สร้างห้อง เลือกด่าน<br />รับรหัสห้องแชร์ให้นักเรียน</div>
        </button>
        <button className="battle-role-card player-card" onClick={() => { setIsHost(false); setPhase('join-setup'); }}>
          <Users size={36} className="role-icon" />
          <div className="role-label">นักเรียน</div>
          <div className="role-desc">กรอกรหัสห้อง<br />เข้าร่วมแข่งขันได้เลย!</div>
        </button>
      </div>
      {errorMsg && <div className="battle-error">{errorMsg}</div>}
    </div>
  );

  // Phase: host-setup
  if (phase === 'host-setup') return (
    <div className="battle-screen battle-dark">
      <button className="battle-back-btn" onClick={() => setPhase('role-select')}><ChevronLeft size={20} /></button>
      <h2 className="battle-section-title"><Crown size={20} /> ตั้งค่าห้องแข่งขัน</h2>

      <div className="battle-form">
        <label className="battle-label">ชื่อของคุณ (ครู)</label>
        <input
          className="battle-input"
          placeholder="กรอกชื่อ..."
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
        />

        <label className="battle-label">เลือกด่านคำศัพท์</label>
        <div className="battle-level-grid">
          {levelsData.map(lvl => (
            <button
              key={lvl.id}
              className={`battle-level-btn ${selectedLevel === lvl.id ? 'selected' : ''}`}
              onClick={() => setSelectedLevel(lvl.id)}
            >
              <span className="level-num">ด่าน {lvl.id}</span>
              <span className="level-name">{lvl.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="battle-info-box">
          <Wifi size={14} /> นักเรียนต้องใช้ Wi-Fi เดียวกัน แล้วเปิด <strong>{serverIp === 'localhost' ? 'localhost:5173' : `http://${serverIp}:5173`}</strong>
        </div>

        {errorMsg && <div className="battle-error">{errorMsg}</div>}

        <button
          className="battle-btn battle-btn-primary"
          disabled={!nickname.trim()}
          onClick={() => {
            setErrorMsg('');
            battleApi.createRoom(selectedLevel, nickname.trim());
          }}
        >
          <Play size={18} /> สร้างห้อง
        </button>
      </div>
    </div>
  );

  // Phase: join-setup
  if (phase === 'join-setup') return (
    <div className="battle-screen battle-dark">
      <button className="battle-back-btn" onClick={() => setPhase('role-select')}><ChevronLeft size={20} /></button>
      <h2 className="battle-section-title"><Users size={20} /> เข้าร่วมห้องแข่งขัน</h2>

      <div className="battle-form">
        <label className="battle-label">ชื่อเล่นของคุณ</label>
        <input
          className="battle-input"
          placeholder="กรอกชื่อ..."
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
        />

        <label className="battle-label">รหัสห้อง (6 หลัก)</label>
        <input
          className="battle-input code-input"
          placeholder="เช่น AB12CD"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          maxLength={6}
        />

        {errorMsg && <div className="battle-error">{errorMsg}</div>}

        <button
          className="battle-btn battle-btn-primary"
          disabled={!nickname.trim() || inputCode.length < 6}
          onClick={() => {
            setErrorMsg('');
            battleApi.joinRoom(inputCode, nickname.trim());
          }}
        >
          <Swords size={18} /> เข้าร่วม!
        </button>
      </div>
    </div>
  );

  // Phase: waiting-lobby
  if (phase === 'waiting-lobby') return (
    <div className="battle-screen battle-dark">
      <div className="lobby-header">
        <div className="room-code-display">
          <span className="room-code-label">รหัสห้อง</span>
          <span className="room-code-value">{roomCode}</span>
          {isHost && (
            <button className="copy-code-btn" onClick={copyCode}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
        <div className="lobby-level-badge">ด่าน {room?.levelId} · {LEVEL_TITLES[room?.levelId ?? 1]}</div>
      </div>

      <div className="lobby-players-section">
        <div className="lobby-players-title">
          <Users size={16} /> ผู้เล่นในห้อง ({players.length})
        </div>
        <div className="lobby-players-list">
          {players.map((p, i) => (
            <div key={p.id} className="lobby-player-item" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="lobby-player-avatar">{p.nickname.charAt(0).toUpperCase()}</span>
              <span className="lobby-player-name">{p.nickname}</span>
              {p.id === room?.hostId && <Crown size={14} className="host-crown" />}
            </div>
          ))}
          {players.length === 0 && (
            <div className="lobby-empty">รอผู้เล่นเข้าร่วม...</div>
          )}
        </div>
      </div>

      {isHost ? (
        <div className="lobby-host-actions">
          <div className="lobby-hint">
            <Wifi size={14} /> แชร์รหัส <strong>{roomCode}</strong> ให้นักเรียนเปิดเว็บแล้วเลือก "นักเรียน"
          </div>
          <button
            className="battle-btn battle-btn-primary"
            onClick={() => battleApi.startGame(roomCode)}
            disabled={players.length < 1}
          >
            <Swords size={18} /> เริ่มแข่งเลย! ({players.length} คน)
          </button>
        </div>
      ) : (
        <div className="lobby-waiting-msg">
          <div className="pulse-dot" />
          รอครูเริ่มการแข่งขัน...
        </div>
      )}
    </div>
  );

  // Phase: question / answer-wait
  if (phase === 'question' || phase === 'answer-wait') return (
    <div className="battle-screen battle-dark battle-game">
      {/* Progress */}
      <div className="battle-progress-bar">
        <div className="battle-progress-fill" style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }} />
      </div>

      {/* Timer + counter */}
      <div className="battle-game-header">
        <span className="battle-q-counter">{questionIndex + 1} / {totalQuestions}</span>
        <div className={`battle-timer ${timeLeft <= 5 ? 'urgent' : ''}`}>
          <Clock size={14} />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Question card */}
      {question && (
        <div className="battle-question-card">
          <div className="battle-q-emoji">{question.emoji}</div>
          <div className="battle-q-word">{question.word}</div>
          <div className="battle-q-romaji">/ {question.romaji} /</div>
        </div>
      )}

      {/* Answer options */}
      <div className="battle-options-grid">
        {question?.options.map((opt, idx) => (
          <button
            key={idx}
            className={`battle-option-btn ${selectedAnswer === opt ? 'selected' : ''} ${phase === 'answer-wait' ? 'locked' : ''}`}
            style={getOptionStyle(opt, idx)}
            onClick={() => handleAnswer(opt)}
            disabled={phase === 'answer-wait'}
          >
            <span className="option-shape">{OPTION_COLORS[idx].label}</span>
            <span className="option-text">{opt}</span>
          </button>
        ))}
      </div>

      {/* Feedback after answering */}
      {phase === 'answer-wait' && myResult && (
        <div className={`battle-my-result ${myResult.isCorrect ? 'correct' : 'wrong'}`}>
          {myResult.isCorrect
            ? <><Zap size={18} /> ถูกต้อง! +{myResult.pointsGained} คะแนน</>
            : <>😿 ผิดแล้ว... +0</>
          }
        </div>
      )}
      {phase === 'answer-wait' && !myResult && (
        <div className="battle-waiting-others">
          <div className="pulse-dot" /> รอผู้เล่นคนอื่น...
        </div>
      )}
    </div>
  );

  // Phase: question-result
  if (phase === 'question-result') return (
    <div className="battle-screen battle-dark battle-result">
      <div className="result-header">
        <div className="result-correct-label">✅ คำตอบที่ถูกต้อง</div>
        <div className="result-correct-answer">{correctAnswer}</div>
        {fastestPlayerId && (
          <div className="result-fastest">
            <Zap size={14} /> {players.find(p => p.id === fastestPlayerId)?.nickname} ตอบเร็วที่สุด!
          </div>
        )}
      </div>

      <div className="result-leaderboard">
        <div className="leaderboard-title"><Trophy size={16} /> อันดับขณะนี้</div>
        {players.slice(0, 8).map((p, i) => (
          <div key={p.id} className={`leaderboard-row ${p.id === myId ? 'me' : ''}`}>
            <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
            <span className="lb-name">{p.nickname}{p.id === myId ? ' (คุณ)' : ''}</span>
            <span className="lb-score">{p.score.toLocaleString()}</span>
            {p.pointsGained !== undefined && p.pointsGained > 0 && (
              <span className="lb-gained">+{p.pointsGained}</span>
            )}
          </div>
        ))}
      </div>

      {isHost && (
        <div className="result-next-hint">
          <div className="pulse-dot" /> คำถามถัดไปจะเริ่มในไม่ช้า...
        </div>
      )}
    </div>
  );

  // Phase: finished — Podium
  if (phase === 'finished') {
    const top3 = finalPlayers.slice(0, 3);
    return (
      <div className="battle-screen battle-dark battle-finished">
        <h2 className="finished-title">🏆 จบการแข่งขัน!</h2>

        <div className="podium-container">
          {/* 2nd place */}
          {top3[1] && (
            <div className="podium-slot second">
              <div className="podium-avatar">{top3[1].nickname.charAt(0).toUpperCase()}</div>
              <div className="podium-name">{top3[1].nickname}</div>
              <div className="podium-score">{top3[1].score.toLocaleString()}</div>
              <div className="podium-block second-block">🥈</div>
            </div>
          )}
          {/* 1st place */}
          {top3[0] && (
            <div className="podium-slot first">
              <div className="podium-crown">👑</div>
              <div className="podium-avatar">{top3[0].nickname.charAt(0).toUpperCase()}</div>
              <div className="podium-name">{top3[0].nickname}</div>
              <div className="podium-score">{top3[0].score.toLocaleString()}</div>
              <div className="podium-block first-block">🥇</div>
            </div>
          )}
          {/* 3rd place */}
          {top3[2] && (
            <div className="podium-slot third">
              <div className="podium-avatar">{top3[2].nickname.charAt(0).toUpperCase()}</div>
              <div className="podium-name">{top3[2].nickname}</div>
              <div className="podium-score">{top3[2].score.toLocaleString()}</div>
              <div className="podium-block third-block">🥉</div>
            </div>
          )}
        </div>

        {/* Full leaderboard */}
        {finalPlayers.length > 3 && (
          <div className="final-leaderboard">
            {finalPlayers.slice(3).map((p, i) => (
              <div key={p.id} className={`leaderboard-row ${p.id === myId ? 'me' : ''}`}>
                <span className="lb-rank">{i + 4}.</span>
                <span className="lb-name">{p.nickname}{p.id === myId ? ' (คุณ)' : ''}</span>
                <span className="lb-score">{p.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="finished-my-score">
          {(() => {
            const me = finalPlayers.find(p => p.id === myId);
            const rank = finalPlayers.findIndex(p => p.id === myId) + 1;
            return me ? (
              <><Star size={16} fill="currentColor" /> คุณได้อันดับ {rank} — {me.score.toLocaleString()} คะแนน</>
            ) : null;
          })()}
        </div>

        <button className="battle-btn battle-btn-primary" onClick={handleBack}>
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return null;
}
