import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { Room, Player, BattleQuestion, RoomSnapshot } from './types.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ============================
// In-memory room store
// ============================
const rooms: Record<string, Room> = {};

// Vocab data inline (mirrors vocabData.ts)
const VOCAB_BY_LEVEL: Record<number, Array<{ word: string; kana: string; romaji: string; emoji: string; meaningTh: string }>> = {
  1: [
    { word: 'あさ', kana: 'あさ', romaji: 'asa', emoji: '🌅', meaningTh: 'เช้า' },
    { word: 'いぬ', kana: 'いぬ', romaji: 'inu', emoji: '🐕', meaningTh: 'สุนัข' },
    { word: 'ねこ', kana: 'ねこ', romaji: 'neko', emoji: '🐱', meaningTh: 'แมว' },
    { word: 'うみ', kana: 'うみ', romaji: 'umi', emoji: '🌊', meaningTh: 'ทะเล' },
    { word: 'えき', kana: 'えき', romaji: 'eki', emoji: '🚉', meaningTh: 'สถานีรถไฟ' },
    { word: 'おいしい', kana: 'おいしい', romaji: 'oishii', emoji: '😋', meaningTh: 'อร่อย' },
    { word: 'かさ', kana: 'かさ', romaji: 'kasa', emoji: '☂️', meaningTh: 'ร่ม' },
    { word: 'こころ', kana: 'こころ', romaji: 'kokoro', emoji: '💖', meaningTh: 'หัวใจ / จิตใจ' },
    { word: 'くつ', kana: 'くつ', romaji: 'kutsu', emoji: '👟', meaningTh: 'รองเท้า' },
    { word: 'かお', kana: 'かお', romaji: 'kao', emoji: '😊', meaningTh: 'ใบหน้า' },
  ],
  2: [
    { word: 'カメラ', kana: 'かめら', romaji: 'kamera', emoji: '📷', meaningTh: 'กล้องถ่ายรูป' },
    { word: 'ケーキ', kana: 'けーき', romaji: 'kēki', emoji: '🎂', meaningTh: 'เค้ก' },
    { word: 'ココア', kana: 'ここあ', romaji: 'kokoa', emoji: '🍫', meaningTh: 'โกโก้' },
    { word: 'アイス', kana: 'あいす', romaji: 'aisu', emoji: '🍦', meaningTh: 'ไอศกรีม' },
    { word: 'イチゴ', kana: 'いちご', romaji: 'ichigo', emoji: '🍓', meaningTh: 'สตรอว์เบอร์รี' },
    { word: 'カレー', kana: 'かれー', romaji: 'karē', emoji: '🍛', meaningTh: 'แกงกะหรี่' },
    { word: 'カップ', kana: 'かっぷ', romaji: 'kappu', emoji: '☕', meaningTh: 'ถ้วย / แก้วมีหู' },
    { word: 'エアコン', kana: 'えあこん', romaji: 'eakon', emoji: '❄️', meaningTh: 'เครื่องปรับอากาศ' },
    { word: 'コップ', kana: 'こっぷ', romaji: 'koppu', emoji: '🥤', meaningTh: 'แก้วน้ำ' },
    { word: 'アニメ', kana: 'あにめ', romaji: 'anime', emoji: '✨', meaningTh: 'อนิเมะ / การ์ตูน' },
  ],
  3: [
    { word: 'すし', kana: 'すし', romaji: 'sushi', emoji: '🍣', meaningTh: 'ซูชิ' },
    { word: 'らーめん', kana: 'らーめん', romaji: 'rāmen', emoji: '🍜', meaningTh: 'ราเมน' },
    { word: 'てんぷら', kana: 'てんぷら', romaji: 'tenpura', emoji: '🍤', meaningTh: 'เทมปุระ' },
    { word: 'たこやき', kana: 'たこやき', romaji: 'takoyaki', emoji: '🐙', meaningTh: 'ทาโกะยากิ' },
    { word: 'おにぎり', kana: 'おにぎり', romaji: 'onigiri', emoji: '🍙', meaningTh: 'ข้าวปั้นสามเหลี่ยม' },
    { word: 'みそしる', kana: 'みそしる', romaji: 'misoshiru', emoji: '🍵', meaningTh: 'ซุปมิโซะ' },
    { word: 'さしみ', kana: 'さしみ', romaji: 'sashimi', emoji: '🐟', meaningTh: 'ปลาดิบ' },
    { word: 'うどん', kana: 'うどん', romaji: 'udon', emoji: '🍢', meaningTh: 'อูด้ง' },
    { word: 'まっちゃ', kana: 'まっちゃ', romaji: 'maccha', emoji: '🍵', meaningTh: 'ชาเขียวมัทฉะ' },
    { word: 'もち', kana: 'もち', romaji: 'mochi', emoji: '🍡', meaningTh: 'โมจิ' },
  ],
  4: [
    { word: 'うさぎ', kana: 'うさぎ', romaji: 'usagi', emoji: '🐰', meaningTh: 'กระต่าย' },
    { word: 'くま', kana: 'くま', romaji: 'kuma', emoji: '🐻', meaningTh: 'หมี' },
    { word: 'ぱんだ', kana: 'ぱんだ', romaji: 'panda', emoji: '🐼', meaningTh: 'แพนด้า' },
    { word: 'さる', kana: 'さる', romaji: 'saru', emoji: '🐒', meaningTh: 'ลิง' },
    { word: 'とり', kana: 'とり', romaji: 'tori', emoji: '🐦', meaningTh: 'นก' },
    { word: 'きつね', kana: 'きつね', romaji: 'kitsune', emoji: '🦊', meaningTh: 'สุนัขจิ้งจอก' },
    { word: 'ぺんぎん', kana: 'ぺんぎん', romaji: 'pengin', emoji: '🐧', meaningTh: 'เพนกวิน' },
    { word: 'はむすたー', kana: 'はむすたー', romaji: 'hamusutā', emoji: '🐹', meaningTh: 'แฮมสเตอร์' },
    { word: 'しばいぬ', kana: 'しばいぬ', romaji: 'shibainu', emoji: '🐕', meaningTh: 'สุนัขชิบะ' },
    { word: 'かえる', kana: 'かえる', romaji: 'kaeru', emoji: '🐸', meaningTh: 'กบ' },
  ],
  5: [
    { word: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', emoji: '👋', meaningTh: 'สวัสดี (ช่วงกลางวัน)' },
    { word: 'ありがとう', kana: 'ありがとう', romaji: 'arigatou', emoji: '🙏', meaningTh: 'ขอบคุณ' },
    { word: 'おはよう', kana: 'おはよう', romaji: 'ohayou', emoji: '🌞', meaningTh: 'สวัสดีตอนเช้า' },
    { word: 'こんばんは', kana: 'こんばんは', romaji: 'konbanwa', emoji: '🌙', meaningTh: 'สวัสดีตอนเย็น' },
    { word: 'さようなら', kana: 'さようなら', romaji: 'sayounara', emoji: '👋', meaningTh: 'ลาก่อน' },
    { word: 'すみません', kana: 'すみません', romaji: 'sumimasen', emoji: '🙇', meaningTh: 'ขอโทษ / ขออนุญาต' },
    { word: 'はい', kana: 'はい', romaji: 'hai', emoji: '✅', meaningTh: 'ใช่ / ครับ / ค่ะ' },
    { word: 'いいえ', kana: 'いいえ', romaji: 'iie', emoji: '❌', meaningTh: 'ไม่ / ไม่ใช่' },
    { word: 'いただきます', kana: 'いただきます', romaji: 'itadakimasu', emoji: '🍱', meaningTh: 'จะทานแล้วนะครับ/ค่ะ' },
    { word: 'ごちそうさま', kana: 'ごちそうさま', romaji: 'gochisousama', emoji: '😌', meaningTh: 'ขอบคุณสำหรับอาหารมื้อนี้' },
  ],
  6: [
    { word: 'いち', kana: 'いち', romaji: 'ichi', emoji: '1️⃣', meaningTh: 'หนึ่ง' },
    { word: 'に', kana: 'に', romaji: 'ni', emoji: '2️⃣', meaningTh: 'สอง' },
    { word: 'さん', kana: 'さん', romaji: 'san', emoji: '3️⃣', meaningTh: 'สาม' },
    { word: 'よん', kana: 'よん', romaji: 'yon', emoji: '4️⃣', meaningTh: 'สี่' },
    { word: 'ご', kana: 'ご', romaji: 'go', emoji: '5️⃣', meaningTh: 'ห้า' },
    { word: 'あか', kana: 'あか', romaji: 'aka', emoji: '🔴', meaningTh: 'สีแดง' },
    { word: 'あお', kana: 'あお', romaji: 'ao', emoji: '🔵', meaningTh: 'สีฟ้า / สีน้ำเงิน' },
    { word: 'きいろ', kana: 'きいろ', romaji: 'kiiro', emoji: '🌕', meaningTh: 'สีเหลือง' },
    { word: 'みどり', kana: 'みどり', romaji: 'midori', emoji: '🟢', meaningTh: 'สีเขียว' },
    { word: 'しろ', kana: 'しろ', romaji: 'shiro', emoji: '⬜', meaningTh: 'สีขาว' },
  ],
};

// ============================
// Helpers
// ============================
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function buildQuestions(levelId: number): BattleQuestion[] {
  const vocab = VOCAB_BY_LEVEL[levelId] ?? VOCAB_BY_LEVEL[1];
  const shuffled = [...vocab].sort(() => 0.5 - Math.random());
  const allAnswers = vocab.map(v => v.meaningTh);

  return shuffled.map(item => {
    const others = allAnswers
      .filter(a => a !== item.meaningTh)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [item.meaningTh, ...others].sort(() => 0.5 - Math.random());
    return {
      word: item.word,
      kana: item.kana,
      romaji: item.romaji,
      emoji: item.emoji,
      options,
      correctAnswer: item.meaningTh,
    };
  });
}

function roomSnapshot(room: Room): RoomSnapshot {
  return {
    code: room.code,
    hostId: room.hostId,
    levelId: room.levelId,
    players: Object.values(room.players),
    state: room.state,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.totalQuestions,
  };
}

const QUESTION_TIME_LIMIT = 15; // seconds
const RESULT_DISPLAY_TIME = 4000; // ms between questions

// ============================
// Socket.io Events
// ============================
io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // HOST: Create a room
  socket.on('create-room', ({ levelId, nickname }: { levelId: number; nickname: string }) => {
    let code = generateCode();
    while (rooms[code]) code = generateCode(); // ensure unique

    const host: Player = {
      id: socket.id,
      nickname: nickname || 'ครู',
      score: 0,
      streak: 0,
      answered: false,
    };

    const questions = buildQuestions(levelId);
    const room: Room = {
      code,
      hostId: socket.id,
      levelId,
      players: { [socket.id]: host },
      state: 'waiting',
      currentQuestionIndex: 0,
      questions,
      totalQuestions: questions.length,
    };

    rooms[code] = room;
    socket.join(code);
    console.log(`[Room] Created: ${code} (Level ${levelId}) by ${nickname}`);

    socket.emit('room-created', { code, room: roomSnapshot(room) });
  });

  // PLAYER: Join a room
  socket.on('join-room', ({ code, nickname }: { code: string; nickname: string }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) { socket.emit('error', { message: 'ไม่พบห้องนี้ กรุณาตรวจสอบรหัสอีกครั้ง' }); return; }
    if (room.state !== 'waiting') { socket.emit('error', { message: 'เกมเริ่มไปแล้ว ไม่สามารถเข้าร่วมได้' }); return; }
    if (Object.keys(room.players).length >= 30) { socket.emit('error', { message: 'ห้องเต็มแล้ว (สูงสุด 30 คน)' }); return; }

    const player: Player = {
      id: socket.id,
      nickname: nickname || `ผู้เล่น${Object.keys(room.players).length + 1}`,
      score: 0,
      streak: 0,
      answered: false,
    };

    room.players[socket.id] = player;
    socket.join(code.toUpperCase());
    console.log(`[Room] ${nickname} joined ${code}`);

    socket.emit('room-joined', { room: roomSnapshot(room) });
    io.to(code.toUpperCase()).emit('player-joined', {
      player,
      players: Object.values(room.players),
    });
  });

  // HOST: Start the game
  socket.on('start-game', ({ code }: { code: string }) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    if (room.state !== 'waiting') return;
    if (Object.keys(room.players).length < 1) {
      socket.emit('error', { message: 'ต้องมีผู้เล่นอย่างน้อย 1 คนก่อนเริ่ม' });
      return;
    }

    room.state = 'playing';
    room.currentQuestionIndex = 0;
    sendQuestion(room);
  });

  // PLAYER: Submit answer
  socket.on('answer', ({ code, answer }: { code: string; answer: string }) => {
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const player = room.players[socket.id];
    if (!player || player.answered) return;

    const now = Date.now();
    const elapsed = now - (room.questionStartTime ?? now);
    const timeLimit = QUESTION_TIME_LIMIT * 1000;
    const question = room.questions[room.currentQuestionIndex];

    player.answered = true;
    player.lastAnswerTime = elapsed;

    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      // Speed scoring: max 1000, min 100, linear based on time left
      const timeLeft = Math.max(0, timeLimit - elapsed);
      const speedBonus = Math.round((timeLeft / timeLimit) * 900);
      const streakBonus = Math.min(player.streak, 5) * 50;
      const points = 100 + speedBonus + streakBonus;
      player.score += points;
      player.streak += 1;
      player.isCorrect = true;
      player.pointsGained = points;
    } else {
      player.streak = 0;
      player.isCorrect = false;
      player.pointsGained = 0;
    }

    // Notify this player their answer was received
    socket.emit('answer-received', { isCorrect, pointsGained: player.pointsGained });

    // Check if all players answered → reveal results early
    const allAnswered = Object.values(room.players).every(p => p.answered);
    if (allAnswered) {
      revealResults(room);
    }
  });

  // Disconnect: remove from room
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);

    for (const [code, room] of Object.entries(rooms)) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];

        // If host left, dissolve room
        if (room.hostId === socket.id) {
          io.to(code).emit('room-dissolved', { message: 'ครูออกจากห้องแล้ว' });
          delete rooms[code];
        } else {
          io.to(code).emit('player-left', {
            playerId: socket.id,
            players: Object.values(room.players),
          });
        }
        break;
      }
    }
  });
});

// ============================
// Game flow helpers
// ============================
function sendQuestion(room: Room) {
  const q = room.questions[room.currentQuestionIndex];
  room.state = 'playing';
  room.questionStartTime = Date.now();

  // Reset answered state for all players
  for (const p of Object.values(room.players)) {
    p.answered = false;
    p.isCorrect = undefined;
    p.pointsGained = undefined;
  }

  const payload = {
    question: {
      word: q.word,
      kana: q.kana,
      romaji: q.romaji,
      emoji: q.emoji,
      options: q.options,
      // Don't send correctAnswer to clients!
    },
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.totalQuestions,
    timeLimit: QUESTION_TIME_LIMIT,
  };

  io.to(room.code).emit('question-started', payload);

  // Auto-reveal after time limit
  setTimeout(() => {
    const current = rooms[room.code];
    if (!current || current.currentQuestionIndex !== room.currentQuestionIndex) return;
    if (current.state === 'playing') {
      revealResults(current);
    }
  }, QUESTION_TIME_LIMIT * 1000 + 200);
}

function revealResults(room: Room) {
  room.state = 'question_result';
  const q = room.questions[room.currentQuestionIndex];

  const sorted = Object.values(room.players).sort((a, b) => b.score - a.score);
  const fastestCorrect = Object.values(room.players)
    .filter(p => p.isCorrect)
    .sort((a, b) => (a.lastAnswerTime ?? Infinity) - (b.lastAnswerTime ?? Infinity))[0];

  io.to(room.code).emit('question-result', {
    correctAnswer: q.correctAnswer,
    players: sorted,
    fastestPlayerId: fastestCorrect?.id,
  });

  // Advance to next question or finish
  setTimeout(() => {
    const current = rooms[room.code];
    if (!current) return;

    const nextIdx = current.currentQuestionIndex + 1;
    if (nextIdx < current.totalQuestions) {
      current.currentQuestionIndex = nextIdx;
      sendQuestion(current);
    } else {
      current.state = 'finished';
      const finalPlayers = Object.values(current.players).sort((a, b) => b.score - a.score);
      io.to(current.code).emit('game-finished', { players: finalPlayers });
      // Clean up room after 10 min
      setTimeout(() => { delete rooms[current.code]; }, 10 * 60 * 1000);
    }
  }, RESULT_DISPLAY_TIME);
}

// ============================
// Start
// ============================
const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🐱 Battle Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Students connect via your local IP + :${PORT}`);
});
