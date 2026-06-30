// Shared types between server and client

export interface Player {
  id: string;        // socket.id
  nickname: string;
  score: number;
  streak: number;    // consecutive correct answers
  lastAnswerTime?: number;
  answered: boolean;
  isCorrect?: boolean;
  pointsGained?: number;
}

export interface Room {
  code: string;
  hostId: string;
  levelId: number;
  players: Record<string, Player>;
  state: 'waiting' | 'playing' | 'question_result' | 'finished';
  currentQuestionIndex: number;
  questionStartTime?: number;
  questions: BattleQuestion[];
  totalQuestions: number;
}

export interface BattleQuestion {
  word: string;
  kana: string;
  romaji: string;
  emoji: string;
  options: string[];   // 4 choices (Thai)
  correctAnswer: string;
}

// Socket event payloads (server → client)
export interface S2C_RoomCreated {
  code: string;
  room: RoomSnapshot;
}

export interface S2C_PlayerJoined {
  player: Player;
  players: Player[];
}

export interface S2C_PlayerLeft {
  playerId: string;
  players: Player[];
}

export interface S2C_GameStarted {
  question: BattleQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;  // seconds
}

export interface S2C_QuestionResult {
  correctAnswer: string;
  players: Player[];          // updated scores
  fastestPlayerId?: string;   // who answered fastest correctly
}

export interface S2C_NextQuestion {
  question: BattleQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
}

export interface S2C_GameFinished {
  players: Player[];   // final leaderboard sorted by score
}

export interface S2C_Error {
  message: string;
}

// Client snapshot of room (no sensitive data)
export interface RoomSnapshot {
  code: string;
  hostId: string;
  levelId: number;
  players: Player[];
  state: Room['state'];
  currentQuestionIndex: number;
  totalQuestions: number;
}
