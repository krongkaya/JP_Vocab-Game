import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  Utensils,
  PawPrint,
  MessageCircle,
  Palette,
  Heart,
  Coins,
  Star,
  Volume2,
  ChevronLeft,
  Moon,
  Sun,
  Search,
  Trophy,
  RefreshCw,
  Info,
  Gift,
  Home,
  Map,
  Cat,
  BookMarked,
  Zap,
  Check,
  Swords
} from 'lucide-react';
import { levelsData } from './vocabData';
import type { VocabItem, Level } from './vocabData';
import { catList } from './gachaData';
import type { CatItem } from './gachaData';
import nekoCafeBanner from './assets/neko_cafe_banner.png';
import NekoSprite from './NekoSprite';
import type { NekoMood } from './NekoSprite';
import BattleScreen from './BattleScreen';
import './App.css';

// ============================
// Sound Effects (Web Audio API)
// ============================
const playTone = (freqs: number[], durations: number[], type: OscillatorType = 'sine', volume = 0.07) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let time = ctx.currentTime;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx]);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + durations[idx]);
      time += durations[idx] * 0.8;
    });
  } catch (e) { /* silently fail */ }
};

const sfx = {
  correct: () => playTone([523.25, 659.25, 783.99], [0.08, 0.08, 0.2], 'sine', 0.06),
  wrong: () => playTone([300, 250], [0.15, 0.2], 'sawtooth', 0.04),
  click: () => playTone([800], [0.03], 'sine', 0.03),
  coin: () => playTone([987.77, 1318.51], [0.05, 0.15], 'sine', 0.05),
  victory: () => playTone([523.25, 659.25, 783.99, 1046.50], [0.06, 0.06, 0.06, 0.22], 'sine', 0.06),
  combo: () => playTone([1046.50, 1318.51, 1567.98], [0.04, 0.04, 0.15], 'sine', 0.05),
  levelUp: () => playTone([392, 440, 523.25, 659.25, 783.99], [0.06, 0.06, 0.06, 0.06, 0.2], 'sine', 0.06),
};

// Text to Speech — high quality Japanese voice
const getJapaneseVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  // Priority: exact ja-JP > any ja locale
  return (
    voices.find(v => v.lang === 'ja-JP' && !v.name.includes('(')) ??
    voices.find(v => v.lang === 'ja-JP') ??
    voices.find(v => v.lang.startsWith('ja')) ??
    null
  );
};

const speakJapanese = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ja-JP';
    utt.rate = 0.82;   // ชัดขึ้น ไม่เร็วเกินไป
    utt.pitch = 1.05;  // เสียงสูงขึ้นเล็กน้อย ฟังดูเป็นธรรมชาติ
    utt.volume = 1.0;  // เสียงดังเต็มที่
    const voice = getJapaneseVoice();
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  // ถ้า voices ยังไม่โหลด ให้รอก่อน
  if (window.speechSynthesis.getVoices().length === 0) {
    const handler = () => { doSpeak(); window.speechSynthesis.removeEventListener('voiceschanged', handler); };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
  } else {
    doSpeak();
  }
};

// Sakura Petals
function SakuraPetals() {
  const petals = useRef(
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 6 + Math.random() * 8,
    }))
  );

  return (
    <div className="sakura-container">
      {petals.current.map(p => (
        <div
          key={p.id}
          className="sakura-petal"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}

// Icon Colors for level badges
const LEVEL_COLORS = [
  { bg: 'linear-gradient(135deg, #ff7e93, #ff6bb5)', shadow: 'rgba(255,126,147,0.3)' },
  { bg: 'linear-gradient(135deg, #ffab6b, #ffcc70)', shadow: 'rgba(255,171,107,0.3)' },
  { bg: 'linear-gradient(135deg, #6cc06a, #8bd488)', shadow: 'rgba(108,192,106,0.3)' },
  { bg: 'linear-gradient(135deg, #64b5f6, #42a5f5)', shadow: 'rgba(100,181,246,0.3)' },
  { bg: 'linear-gradient(135deg, #b07cff, #c084fc)', shadow: 'rgba(176,124,255,0.3)' },
  { bg: 'linear-gradient(135deg, #ffc934, #ffde59)', shadow: 'rgba(255,201,52,0.3)' },
];

const LEVEL_ICONS = [BookOpen, Sparkles, Utensils, PawPrint, MessageCircle, Palette];

// ============================
// Main App
// ============================
function App() {
  // Screen & theme
  const [screen, setScreen] = useState<'lobby' | 'map' | 'game' | 'collection' | 'dictionary' | 'battle'>('lobby');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  // User persistent state
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('neko_coins') || '100', 10));
  const [unlockedCats, setUnlockedCats] = useState<string[]>(() => {
    const s = localStorage.getItem('neko_unlocked_cats');
    return s ? JSON.parse(s) : ['calico'];
  });
  const [activeCatId, setActiveCatId] = useState(() => localStorage.getItem('neko_active_cat') || 'calico');
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    const s = localStorage.getItem('neko_level_stars');
    return s ? JSON.parse(s) : {};
  });
  const [dictStats, setDictStats] = useState<Record<string, { correct: number; total: number }>>(() => {
    const s = localStorage.getItem('neko_dict_stats');
    return s ? JSON.parse(s) : {};
  });

  // Gameplay state
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameQuestions, setGameQuestions] = useState<Array<{ vocab: VocabItem; options: string[] }>>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [ansStatus, setAnsStatus] = useState<'correct' | 'wrong' | null>(null);
  const [victoryStatus, setVictoryStatus] = useState<{
    stars: number; coinsGained: number; finalScore: number; accuracy: number;
  } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showingHint, setShowingHint] = useState(false);
  
  // New Gameplay states (Power-ups & Fever)
  const [usedHint, setUsedHint] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number, x: number, y: number, text: string, type: 'combo' | 'score' | 'powerup' }>>([]);
  let floatingIdCounter = useRef(0);

  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timerValue, setTimerValue] = useState(100);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<string | null>(null);
  const [nekoGameMood, setNekoGameMood] = useState<NekoMood>('idle');

  // Gacha state
  const [activeTab, setActiveTab] = useState<'gacha' | 'cats'>('gacha');
  const [gachaState, setGachaState] = useState<'idle' | 'shaking' | 'revealed'>('idle');
  const [rolledCat, setRolledCat] = useState<CatItem | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  // Dictionary state
  const [dictSearch, setDictSearch] = useState('');
  const [dictFilterLevel, setDictFilterLevel] = useState(0);

  const activeCat = catList.find(c => c.id === activeCatId) || catList[0];
  const maxLivesForCat = activeCatId === 'samurai' ? 4 : 3;

  // Fever Mode logic
  const isFeverMode = combo >= 5;

  // Timer speed: Bullet Cat slows it down, Fever speeds it up
  let timerDecayRate = activeCatId === 'neko_shikansen' ? 0.35 : 0.5;
  if (isFeverMode) timerDecayRate *= 1.5; // Fever makes it harder!

  const addFloatingText = (text: string, type: 'combo' | 'score' | 'powerup', x: number = 50, y: number = 30) => {
    const id = floatingIdCounter.current++;
    setFloatingTexts(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1500);
  };

  // ============================
  // Persistence
  // ============================
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('neko_coins', coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem('neko_unlocked_cats', JSON.stringify(unlockedCats)); }, [unlockedCats]);
  useEffect(() => { localStorage.setItem('neko_active_cat', activeCatId); }, [activeCatId]);
  useEffect(() => { localStorage.setItem('neko_level_stars', JSON.stringify(levelStars)); }, [levelStars]);
  useEffect(() => { localStorage.setItem('neko_dict_stats', JSON.stringify(dictStats)); }, [dictStats]);

  // Preload voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices());
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive && !selectedAns && !gameOver && !victoryStatus && !isFrozen) {
      timerRef.current = setInterval(() => {
        setTimerValue(prev => {
          const next = prev - timerDecayRate;
          if (next <= 0) {
            // Time's up — treat as wrong answer
            clearInterval(timerRef.current!);
            setTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, selectedAns, gameOver, victoryStatus, currentQIndex, isFrozen, timerDecayRate]);

  const handleTimeUp = useCallback(() => {
    if (selectedAns || gameOver || victoryStatus) return;
    const currentQ = gameQuestions[currentQIndex];
    if (!currentQ) return;

    setSelectedAns('__timeout__');
    setAnsStatus('wrong');
    setShowCorrectAnswer(currentQ.vocab.meaningTh);
    sfx.wrong();
    setCombo(0);

    // Update stats
    const wk = currentQ.vocab.word;
    setDictStats(prev => ({
      ...prev,
      [wk]: { correct: (prev[wk]?.correct || 0), total: (prev[wk]?.total || 0) + 1 }
    }));

    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setTimeout(() => setGameOver(true), 1200);
    } else {
      setTimeout(() => advanceQuestion(), 1800);
    }
  }, [selectedAns, gameOver, victoryStatus, gameQuestions, currentQIndex, lives]);

  // ============================
  // Navigation
  // ============================
  const toggleTheme = () => { sfx.click(); setTheme(t => t === 'light' ? 'dark' : 'light'); };

  const changeScreen = (s: typeof screen) => {
    sfx.click();
    setScreen(s);
    setRolledCat(null);
    setCollectionError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
  };

  // ============================
  // Gameplay
  // ============================
  const startLevel = (level: Level) => {
    sfx.click();
    setCurrentLevel(level);
    setLives(maxLivesForCat);
    setScore(0);
    setCurrentQIndex(0);
    setSelectedAns(null);
    setAnsStatus(null);
    setVictoryStatus(null);
    setGameOver(false);
    setShowingHint(false);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setShowCorrectAnswer(null);
    setNekoGameMood('idle');
    setTimerValue(100);
    setUsedHint(false);
    setIsFrozen(false);

    const pool = [...level.vocab].sort(() => 0.5 - Math.random());
    const questions = pool.map(item => {
      const others = level.vocab
        .filter(v => v.id !== item.id)
        .map(v => v.meaningTh)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      return {
        vocab: item,
        options: [item.meaningTh, ...others].sort(() => 0.5 - Math.random()),
      };
    });

    setGameQuestions(questions);
    setScreen('game');
    setTimerActive(true);
    setTimeout(() => speakJapanese(questions[0].vocab.word), 400);
  };

  const advanceQuestion = () => {
    const nextIdx = currentQIndex + 1;
    if (nextIdx < gameQuestions.length) {
      setCurrentQIndex(nextIdx);
      setSelectedAns(null);
      setAnsStatus(null);
      setShowingHint(false);
      setShowCorrectAnswer(null);
      setTimerValue(100);
      setNekoGameMood('idle');
      setUsedHint(false);
      setIsFrozen(false);
      setTimerActive(true);
      speakJapanese(gameQuestions[nextIdx].vocab.word);
    } else {
      finishLevel();
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (selectedAns || gameOver || victoryStatus) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    const currentQ = gameQuestions[currentQIndex];
    const isCorrect = option === currentQ.vocab.meaningTh;
    setSelectedAns(option);

    // Update stats
    const wk = currentQ.vocab.word;
    setDictStats(prev => ({
      ...prev,
      [wk]: {
        correct: (prev[wk]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[wk]?.total || 0) + 1
      }
    }));

    if (isCorrect) {
      setAnsStatus('correct');
      sfx.correct();
      setNekoGameMood('eat');
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setCorrectCount(c => c + 1);

      // Combo sound at 3+
      if (newCombo >= 3) sfx.combo();

      // Score: base 10 + combo bonus + time bonus
      const timeBonus = Math.floor(timerValue / 10);
      const comboBonus = Math.min(newCombo, 5) * 2;
      let pointsEarned = 10 + timeBonus + comboBonus;
      let coinsEarned = activeCatId === 'black' ? 2 : 1;

      if (isFeverMode) {
        pointsEarned *= 2;
        coinsEarned *= 2;
      }

      setScore(s => s + pointsEarned);
      setCoins(c => c + coinsEarned);
      
      addFloatingText(`+${pointsEarned}`, 'score');
      if (newCombo >= 2) {
        setTimeout(() => addFloatingText(`${newCombo} Combo!`, 'combo'), 200);
      }

      setTimeout(() => advanceQuestion(), 1200);
    } else {
      setAnsStatus('wrong');
      sfx.wrong();
      setNekoGameMood('sad');
      setCombo(0);
      setShowCorrectAnswer(currentQ.vocab.meaningTh);

      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1200);
      } else {
        setTimeout(() => advanceQuestion(), 1800);
      }
    }
  };

  const handleUseHint = () => {
    if (usedHint || coins < 10 || selectedAns || gameOver) return;
    sfx.click();
    setCoins(c => c - 10);
    setUsedHint(true);
    addFloatingText('-10', 'powerup', 20, 80);
    
    // Logic to visually remove 2 wrong options is handled in render
  };

  const handleUseFreeze = () => {
    if (isFrozen || coins < 5 || selectedAns || gameOver) return;
    sfx.click();
    setCoins(c => c - 5);
    setIsFrozen(true);
    addFloatingText('❄️ Frozen', 'powerup', 80, 80);
  };

  const finishLevel = () => {
    sfx.victory();
    setTimerActive(false);

    const totalQ = gameQuestions.length;
    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    let starsEarned = 1;
    if (lives === maxLivesForCat) starsEarned = 3;
    else if (lives >= maxLivesForCat - 1) starsEarned = 2;

    let gainedCoins = starsEarned * 10 + maxCombo * 2;
    if (activeCatId === 'matcha' && starsEarned === 3) gainedCoins += 5;
    if (activeCatId === 'sakura_princess') gainedCoins *= 2;

    const levelId = currentLevel?.id || 1;
    const prev = levelStars[levelId] || 0;
    if (starsEarned > prev) {
      setLevelStars(p => ({ ...p, [levelId]: starsEarned }));
    }

    setCoins(c => c + gainedCoins);
    setVictoryStatus({ stars: starsEarned, coinsGained: gainedCoins, finalScore: score, accuracy });
  };

  // ============================
  // Gacha
  // ============================
  const rollGacha = () => {
    if (gachaState !== 'idle') return;
    const cost = 80;
    if (coins < cost) {
      sfx.wrong();
      setCollectionError("เหรียญไม่พอจ้า! ไปลุยด่านสะสมเหรียญก่อนนะ 🐾");
      return;
    }
    sfx.click();
    setCoins(c => c - cost);
    setGachaState('shaking');
    setCollectionError(null);
    setRolledCat(null);

    // Shake for 2.5 seconds before revealing
    setTimeout(() => {
      sfx.coin();
      const rand = Math.random() * 100;
      let rarity: CatItem['rarity'] = "Common";
      if (rand > 90) rarity = "Epic";
      else if (rand > 60) rarity = "Rare";
      const pool = catList.filter(c => c.rarity === rarity);
      const rolled = pool[Math.floor(Math.random() * pool.length)];
      if (!unlockedCats.includes(rolled.id)) setUnlockedCats(p => [...p, rolled.id]);
      setRolledCat(rolled);
      setGachaState('revealed');
      sfx.victory();
    }, 2500);
  };

  // ============================
  // Dictionary helpers
  // ============================
  const filteredDict = levelsData
    .flatMap(lvl => lvl.vocab.map(v => ({ ...v, levelId: lvl.id })))
    .filter(item => {
      const q = dictSearch.toLowerCase();
      const match = item.word.includes(q) || item.romaji.toLowerCase().includes(q) || item.meaningTh.includes(q) || item.meaningEn.toLowerCase().includes(q);
      return match && (dictFilterLevel === 0 || item.levelId === dictFilterLevel);
    });

  // Total stars
  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);

  // ============================
  // Render
  // ============================
  return (
    <>
      <SakuraPetals />

      {/* Header - always on top */}
      <div className="game-header">
        <div className="stats-group">
          <div className="stat-pill coins">
            <Coins size={14} />
            <span>{coins}</span>
          </div>
          <div className="stat-pill stars">
            <Star size={14} fill="currentColor" />
            <span>{totalStars}/{levelsData.length * 3}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* Desktop content wrapper */}
      <div className="desktop-content-wrapper">

      {screen === 'lobby' && (
        <div className="screen lobby-container">
          <div style={{ width: '100%' }}>
            <div className="lobby-banner-box">
              <img src={nekoCafeBanner} className="lobby-banner-img" alt="Neko Cafe Banner" />
            </div>
            <div className="lobby-title-container">
              <h1 className="lobby-title">Neko Vocab Cafe</h1>
              <p className="lobby-subtitle">ตะลุยด่านคำศัพท์ภาษาญี่ปุ่นแสนน่ารัก 🐾</p>
            </div>
            <div className="active-cat-display">
              <NekoSprite catId={activeCatId} mood="walk" size={70} showShadow={false} />
              <div className="active-cat-info">
                <div className="active-cat-name">{activeCat.name}</div>
                <div className="active-cat-bonus">{activeCat.bonus}</div>
              </div>
            </div>
          </div>
          <div className="lobby-buttons">
            <button className="btn btn-primary bounce-hover" onClick={() => changeScreen('map')}>
              <Trophy size={20} /> เริ่มการผจญภัย
            </button>
            <button
              className="btn bounce-hover"
              style={{ background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)', color: 'white', boxShadow: '0 4px 16px rgba(192,132,252,0.4)' }}
              onClick={() => changeScreen('battle')}
            >
              <Swords size={20} /> โหมดแข่งขัน ⚔️
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => changeScreen('collection')}>
                <Cat size={18} /> คลังแมว
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => changeScreen('dictionary')}>
                <BookMarked size={18} /> สมุดคำศัพท์
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ===== MAP ===== */}
      {screen === 'map' && (
        <div className="screen map-container">
          <div className="map-header">
            <button className="back-btn" onClick={() => changeScreen('lobby')}><ChevronLeft size={20} /></button>
            <h2>เลือกด่านตะลุยคำศัพท์</h2>
          </div>
          <div className="map-scroll-area custom-scroll">
            {levelsData.map((level, idx) => {
              const stars = levelStars[level.id] || 0;
              const IconComp = LEVEL_ICONS[idx % LEVEL_ICONS.length];
              const color = LEVEL_COLORS[idx % LEVEL_COLORS.length];
              const isCompleted = stars > 0;
              // Determine the "current" level (first uncompleted)
              const firstUncompleted = levelsData.findIndex(l => !(levelStars[l.id] > 0));
              const isCurrent = idx === firstUncompleted;

              return (
                <div key={level.id} className="level-node">
                  <div className={`level-node-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`} />
                  <div className="level-card pop-in" onClick={() => startLevel(level)} style={{ animationDelay: `${idx * 0.06}s` }}>
                    <div className="level-info">
                      <div className="level-icon-wrapper" style={{ background: color.bg, boxShadow: `0 4px 12px ${color.shadow}` }}>
                        <IconComp />
                      </div>
                      <div className="level-details">
                        <div className="level-title">{level.title}</div>
                        <div className="level-desc">{level.description}</div>
                      </div>
                    </div>
                    <div className="level-stars-display">
                      {[0, 1, 2].map(i => (
                        <Star key={i} className={`star-icon ${i < stars ? 'earned' : ''}`} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== GAME ===== */}
      {screen === 'game' && currentLevel && gameQuestions.length > 0 && (
        <div className={`screen game-container ${isFeverMode ? 'fever-mode' : ''}`}>
          
          {/* Floating Texts */}
          {floatingTexts.map(ft => (
            <div key={ft.id} className={`floating-text ${ft.type}`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
              {ft.text}
            </div>
          ))}

          <div>
            {/* Timer bar */}
            <div className="timer-bar-container">
              <div
                className={`timer-bar-fill ${timerValue < 30 ? 'warning' : ''}`}
                style={{ width: `${timerValue}%` }}
              />
            </div>

            {/* Progress bar */}
            <div className="game-progress-bar">
              <div className="game-progress-fill" style={{ width: `${(currentQIndex / gameQuestions.length) * 100}%` }} />
            </div>

            {/* Top bar: hearts, combo, score */}
            <div className="game-top-bar">
              <div className="hearts-display">
                {Array.from({ length: maxLivesForCat }).map((_, i) => (
                  <Heart key={i} className={`heart-icon ${i >= lives ? 'lost' : ''}`} />
                ))}
              </div>
              <div className="score-display">
                {combo >= 3 && (
                  <span className="combo-badge">
                    <Zap size={12} /> x{combo}
                  </span>
                )}
                <span className="question-counter">{currentQIndex + 1}/{gameQuestions.length}</span>
              </div>
            </div>
          </div>

          {/* Neko speech bubble */}
          <div className="neko-stage-area">
            <div className="neko-speech-bubble">
              <div className="vocab-emoji-display">{gameQuestions[currentQIndex]?.vocab.emoji}</div>
              <div className="neko-bubble-jp">{gameQuestions[currentQIndex]?.vocab.word}</div>
              <div className="neko-bubble-romaji">/ {gameQuestions[currentQIndex]?.vocab.romaji} /</div>
              <button className="neko-bubble-speaker" onClick={() => speakJapanese(gameQuestions[currentQIndex]?.vocab.word)}>
                <Volume2 size={14} /> ฟังเสียง
              </button>
            </div>
            <div className="neko-character-model">
              <NekoSprite catId={activeCatId} mood={nekoGameMood} size={90} label={activeCat.jpName} />
            </div>
          </div>

          {/* Conveyor + answers */}
          <div className="conveyor-belt-container">
            <div className="conveyor-track" />
            <div className="conveyor-plates-grid">
              {gameQuestions[currentQIndex]?.options.map((option, idx) => {
                const currentVocab = gameQuestions[currentQIndex].vocab;
                const isCorrectOption = option === currentVocab.meaningTh;
                
                // If 50/50 hint is used, hide 2 wrong options
                let isHiddenByHint = false;
                if (usedHint && !isCorrectOption) {
                  const wrongOptions = gameQuestions[currentQIndex].options.filter(o => o !== currentVocab.meaningTh);
                  // Hide the first two wrong options
                  if (option === wrongOptions[0] || option === wrongOptions[1]) {
                    isHiddenByHint = true;
                  }
                }

                // Find emoji for this option from the level vocab
                const matchingVocab = currentLevel?.vocab.find(v => v.meaningTh === option);
                const optionEmoji = matchingVocab?.emoji ?? ['🍣', '🍙', '🍡', '🍥'][idx];
                let cls = "";
                if (selectedAns) {
                  if (isCorrectOption) cls = "correct-choice";
                  else if (selectedAns === option) cls = "wrong-choice";
                }
                
                if (isHiddenByHint) return <div key={idx} className="sushi-plate-btn hidden-hint" />;

                return (
                  <button
                    key={idx}
                    className={`sushi-plate-btn ${cls}`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAns !== null}
                  >
                    <span className="sushi-plate-dish">{optionEmoji}</span>
                    <span className="sushi-plate-meaning">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback / Hint area */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {ansStatus === 'correct' && (
              <div className="feedback-overlay correct">
                ✨ ถูกต้อง! {combo >= 3 ? `x${combo} コンボ!` : 'อร่อยจังเหมียว~'}
              </div>
            )}
            {ansStatus === 'wrong' && (
              <>
                <div className="feedback-overlay wrong">😿 ผิดจ้า~</div>
                {showCorrectAnswer && (
                  <div className="answer-detail">
                    คำตอบที่ถูกต้องคือ: <strong>{showCorrectAnswer}</strong>
                  </div>
                )}
              </>
            )}
            {!ansStatus && !showingHint && (
              <div className="powerups-container">
                <button 
                  className={`btn btn-sm btn-powerup ${usedHint || coins < 10 ? 'disabled' : ''}`}
                  onClick={handleUseHint}
                  disabled={usedHint || coins < 10 || selectedAns !== null}
                >
                  <Info size={14} /> 50/50 (10🪙)
                </button>
                <button 
                  className={`btn btn-sm btn-powerup ${isFrozen || coins < 5 ? 'disabled' : ''}`}
                  onClick={handleUseFreeze}
                  disabled={isFrozen || coins < 5 || selectedAns !== null}
                >
                  ❄️ แช่แข็ง (5🪙)
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowingHint(true); sfx.click(); }}>
                  💡 ความหมาย
                </button>
              </div>
            )}
            {!ansStatus && showingHint && (
              <div className="answer-detail" style={{ marginTop: 0 }}>
                💡 {gameQuestions[currentQIndex]?.vocab.hint}
              </div>
            )}
          </div>

          {/* Victory */}
          {victoryStatus && (
            <div className="capsule-reveal-modal">
              <div className="reveal-card glass pop-in" style={{ backgroundColor: 'var(--bg-panel)' }}>
                <div className="reveal-emoji">🎉</div>
                <h2 className="victory-title">ผ่านด่านสำเร็จ!</h2>

                <div className="victory-stars-box">
                  {[0, 1, 2].map(i => (
                    <Star key={i} className={`victory-star-icon ${i < victoryStatus.stars ? 'active' : ''}`} />
                  ))}
                </div>

                <div className="victory-stat-row">
                  <div className="victory-stat-card">
                    <span className="victory-stat-value">{victoryStatus.finalScore}</span>
                    <span className="victory-stat-label">คะแนน</span>
                  </div>
                  <div className="victory-stat-card">
                    <span className="victory-stat-value">{victoryStatus.accuracy}%</span>
                    <span className="victory-stat-label">ความแม่นยำ</span>
                  </div>
                  <div className="victory-stat-card">
                    <span className="victory-stat-value">x{maxCombo}</span>
                    <span className="victory-stat-label">คอมโบ</span>
                  </div>
                </div>

                <div className="reward-card">
                  <Gift size={20} />
                  <span>+{victoryStatus.coinsGained} เหรียญ</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => changeScreen('map')}>
                    กลับแผนที่
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => startLevel(currentLevel)}>
                    <RefreshCw size={16} /> เล่นอีก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className="capsule-reveal-modal">
              <div className="reveal-card glass pop-in" style={{ backgroundColor: 'var(--bg-panel)' }}>
                <div className="sad-cat-emoji">😿</div>
                <h2 className="gameover-title">หัวใจหมดแล้ว!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  ตอบถูก {correctCount}/{currentQIndex + 1} ข้อ · คอมโบสูงสุด x{maxCombo}
                </p>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => changeScreen('map')}>
                    กลับแผนที่
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => startLevel(currentLevel)}>
                    <RefreshCw size={16} /> ลองอีกครั้ง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== COLLECTION ===== */}
      {screen === 'collection' && (
        <div className="screen collection-container">
          <div className="collection-header">
            <button className="back-btn" onClick={() => changeScreen('lobby')}><ChevronLeft size={20} /></button>
            <h2>ตู้กาชา & คลังน้องแมว</h2>
          </div>

          <div className="collection-tabs">
            <button className={`collection-tab-btn ${activeTab === 'gacha' ? 'active' : ''}`} onClick={() => { sfx.click(); setActiveTab('gacha'); }}>
              🎰 ตู้กาชา
            </button>
            <button className={`collection-tab-btn ${activeTab === 'cats' ? 'active' : ''}`} onClick={() => { sfx.click(); setActiveTab('cats'); }}>
              🐱 คลังแมว ({unlockedCats.length}/{catList.length})
            </button>
          </div>

          <div className="custom-scroll" style={{ flex: 1 }}>
            {activeTab === 'gacha' && (
              <div className={`gacha-machine-box ${gachaState === 'shaking' ? 'shaking' : ''}`}>
                <div className="gacha-dome">
                  <div className="gacha-capsules-inside">
                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="capsule-mini" />)}
                  </div>
                </div>
                
                {gachaState === 'shaking' ? (
                  <div className="gacha-lever-dial cranking">กำลังสุ่ม...</div>
                ) : (
                  <div className="gacha-lever-dial" onClick={rollGacha}>หมุน!</div>
                )}
                
                <div className="gacha-slot">
                  {gachaState === 'revealed' && <div className="gacha-slot-received" />}
                </div>
                <p className="gacha-cost-label">
                  สุ่มครั้งละ 80 🪙 · มี {catList.length - unlockedCats.length} ตัวที่ยังไม่ปลดล็อค
                </p>
                {collectionError && (
                  <p style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>{collectionError}</p>
                )}
              </div>
            )}

            {activeTab === 'cats' && (
              <div className="cat-collection-grid">
                {catList.map(cat => {
                  const isUnlocked = unlockedCats.includes(cat.id);
                  const isActive = activeCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`cat-collect-card ${!isUnlocked ? 'locked' : ''} ${isActive ? 'active-equipped' : ''}`}
                      onClick={() => { if (isUnlocked && !isActive) { sfx.click(); setActiveCatId(cat.id); } }}
                    >
                      {isActive && <div className="cat-active-badge"><Check size={12} /></div>}
                      <div className="cat-card-emoji">
                        <NekoSprite catId={cat.id} mood={isActive ? 'walk' : 'idle'} size={55} showShadow={false} />
                      </div>
                      <div className="cat-card-name">{cat.name}</div>
                      <div className="cat-card-jpname">{cat.jpName}</div>
                      <div
                        className="cat-card-rarity"
                        style={{
                          background: cat.rarity === 'Epic' ? 'var(--purple-light)' : cat.rarity === 'Rare' ? 'var(--secondary-light)' : 'var(--bg-app)',
                          color: cat.rarity === 'Epic' ? 'var(--purple)' : cat.rarity === 'Rare' ? 'var(--secondary-hover)' : 'var(--text-muted)',
                          border: `1px solid ${cat.rarity === 'Epic' ? 'var(--purple)' : cat.rarity === 'Rare' ? 'var(--secondary)' : 'var(--border)'}`,
                        }}
                      >
                        {cat.rarity}
                      </div>
                      {isUnlocked && <div className="cat-card-bonus">{cat.bonus}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gacha reveal */}
          {rolledCat && (
            <div className="capsule-reveal-modal">
              <div className="reveal-card pop-in" style={{ background: rolledCat.bgGradient, color: rolledCat.textColor }}>
                <div className="reveal-emoji">
                  <NekoSprite catId={rolledCat.id} mood="happy" size={90} showShadow={false} />
                </div>
                <div className={`reveal-rarity-badge ${rolledCat.rarity}`}>{rolledCat.rarity}</div>
                <h2 style={{ color: 'inherit', margin: '4px 0 0', fontSize: '20px', fontWeight: 900 }}>{rolledCat.name}</h2>
                <p style={{ color: 'inherit', opacity: 0.8, fontSize: '13px' }}>{rolledCat.jpName}</p>
                <p style={{ fontSize: '13px' }}>{rolledCat.description}</p>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 14px', borderRadius: '12px', width: '100%', fontSize: '12px', fontWeight: 700 }}>
                  ⚡ {rolledCat.bonus}
                </div>
                <button
                  className="btn"
                  style={{ width: '100%', backgroundColor: rolledCat.textColor, color: 'white' }}
                  onClick={() => { sfx.click(); setActiveCatId(rolledCat.id); setRolledCat(null); setGachaState('idle'); }}
                >
                  พาเหมียวไปด้วยกัน!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DICTIONARY ===== */}
      {screen === 'dictionary' && (
        <div className="screen dict-container">
          <div className="collection-header">
            <button className="back-btn" onClick={() => changeScreen('lobby')}><ChevronLeft size={20} /></button>
            <h2>สมุดคำศัพท์ญี่ปุ่น</h2>
          </div>

          <div className="search-box-container">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                className="search-input"
                placeholder="ค้นหาคำศัพท์..."
                value={dictSearch}
                onChange={e => setDictSearch(e.target.value)}
              />
            </div>
            <select className="dict-filter-select" value={dictFilterLevel} onChange={e => setDictFilterLevel(Number(e.target.value))}>
              <option value={0}>ทุกด่าน</option>
              {levelsData.map(l => <option key={l.id} value={l.id}>ด่าน {l.id}</option>)}
            </select>
          </div>

          <div className="dict-vocab-list custom-scroll">
            {filteredDict.length === 0 ? (
              <div className="dict-empty">
                <span className="dict-empty-emoji">😿</span>
                <p>ไม่พบคำศัพท์ที่ค้นหาจ้า</p>
              </div>
            ) : (
              filteredDict.map(item => {
                const stats = dictStats[item.word] || { correct: 0, total: 0 };
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : -1;
                const statClass = pct >= 70 ? 'good' : pct >= 0 ? 'bad' : '';
                return (
                  <div key={item.id} className="dict-item-card">
                    <div className="dict-item-emoji">{item.emoji}</div>
                    <div className="dict-item-info">
                      <div className="dict-item-japanese">
                        {item.word}
                        <button className="dict-speak-btn" onClick={() => speakJapanese(item.word)}>
                          <Volume2 size={14} />
                        </button>
                      </div>
                      <div className="dict-item-romaji">/{item.romaji}/</div>
                      <div className="dict-item-meaning">{item.meaningTh} · {item.meaningEn}</div>
                    </div>
                    <div className="dict-item-actions">
                      {pct >= 0 ? (
                        <div className={`dict-item-stats ${statClass}`}>
                          {stats.correct}/{stats.total} ({pct}%)
                        </div>
                      ) : (
                        <div className="dict-item-stats">ยังไม่เคยเจอ</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===== BATTLE MODE ===== */}
      {screen === 'battle' && (
        <BattleScreen onBack={() => changeScreen('lobby')} />
      )}

      {/* ===== BOTTOM NAV ===== */}
      {screen !== 'game' && screen !== 'battle' && (
        <nav className="bottom-nav">
          <button className={`bottom-nav-btn ${screen === 'lobby' ? 'active' : ''}`} onClick={() => changeScreen('lobby')}>
            <Home size={20} /> หน้าหลัก
          </button>
          <button className={`bottom-nav-btn ${screen === 'map' ? 'active' : ''}`} onClick={() => changeScreen('map')}>
            <Map size={20} /> ด่าน
          </button>
          <button className="bottom-nav-btn" onClick={() => changeScreen('battle')}>
            <Swords size={20} /> แข่ง
          </button>
          <button className={`bottom-nav-btn ${screen === 'collection' ? 'active' : ''}`} onClick={() => changeScreen('collection')}>
            <Cat size={20} /> กาชา
          </button>
          <button className={`bottom-nav-btn ${screen === 'dictionary' ? 'active' : ''}`} onClick={() => changeScreen('dictionary')}>
            <BookMarked size={20} /> คำศัพท์
          </button>
        </nav>
      )}
      </div>{/* end desktop-content-wrapper */}
    </>
  );
}

export default App;
