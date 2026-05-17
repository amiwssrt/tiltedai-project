import { BoardState, Move, Piece, Player, Position } from "./types";

export const BOARD_SIZE = 8;

const PERSONALITIES: ("fearless" | "strategic" | "emotional" | "loyal" | "reckless" | "calm")[] = [
  "fearless", "strategic", "emotional", "loyal", "reckless", "calm"
];

const NAMES = [
  "Aeon", "Brix", "Cyros", "Dawn", "Echo", "Flux", "Grit", "Halo", "Ion", "Jinx",
  "Kael", "Lyra", "Mute", "Nova", "Orion", "Pax", "Quark", "Raze", "Sage", "Tess"
];

export function createInitialBoard(isStory: boolean = false): BoardState {
  const board: BoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  let idCounter = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          const piece: Piece = { id: `P2-${idCounter++}`, player: "P2", isKing: false };
          if (isStory) {
            piece.character = {
              name: NAMES[Math.floor(Math.random() * NAMES.length)] + (r*8+c),
              personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
            };
          }
          board[r][c] = piece;
        } else if (r > 4) {
          const piece: Piece = { id: `P1-${idCounter++}`, player: "P1", isKing: false };
          if (isStory) {
            piece.character = {
              name: NAMES[Math.floor(Math.random() * NAMES.length)] + (r*8+c),
              personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
            };
          }
          board[r][c] = piece;
        }
      }
    }
  }
  return board;
}

export function getPiece(board: BoardState, r: number, c: number): Piece | null {
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
  return board[r][c];
}

function isValidPos(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// Generate all simple moves and all single-step captures
export function getAvailableMoves(
  board: BoardState,
  player: Player,
  mandatoryPiece?: Position // if a piece is mid-jump, it must continue
): Move[] {
  let moves: Move[] = [];
  let captures: Move[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) continue;

      if (mandatoryPiece && (mandatoryPiece.r !== r || mandatoryPiece.c !== c)) {
        continue;
      }

      const forward = player === "P1" ? -1 : 1;
      const dirs = [[forward, -1], [forward, 1]];
      if (piece.isKing) {
        dirs.push([-forward, -1], [-forward, 1]);
      }

      for (const [dr, dc] of dirs) {
        // Normal move
        const nr = r + dr;
        const nc = c + dc;
        if (isValidPos(nr, nc) && !board[nr][nc]) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, captures: [] });
        }

        // Capture move
        const cr = r + dr * 2;
        const cc = c + dc * 2;
        if (isValidPos(cr, cc) && !board[cr][cc]) {
          const midPiece = board[r + dr][c + dc];
          if (midPiece && midPiece.player !== player) {
            captures.push({
              from: { r, c },
              to: { r: cr, c: cc },
              captures: [{ r: r + dr, c: c + dc }],
            });
          }
        }
      }
    }
  }

  // Mandatory capture rule
  return captures.length > 0 ? captures : moves;
}

export function applyMove(
  board: BoardState,
  move: Move
): { newBoard: BoardState; kinged: boolean; canJumpAgain: boolean; capturedPieces: Piece[] } {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[move.from.r][move.from.c]!;

  newBoard[move.from.r][move.from.c] = null;
  newBoard[move.to.r][move.to.c] = piece;

  const capturedPieces: Piece[] = [];
  for (const cap of move.captures) {
    if (newBoard[cap.r][cap.c]) {
      capturedPieces.push(newBoard[cap.r][cap.c]!);
    }
    newBoard[cap.r][cap.c] = null;
  }

  let kinged = false;
  if (!piece.isKing) {
    if ((piece.player === "P1" && move.to.r === 0) || (piece.player === "P2" && move.to.r === BOARD_SIZE - 1)) {
      piece.isKing = true;
      kinged = true;
    }
  }

  let canJumpAgain = false;
  if (move.captures.length > 0 && !kinged) {
    // Check if this piece has MORE jumps
    // If it was just kinged, its turn ends. (Standard checkers rule).
    const nextJumps = getAvailableMoves(newBoard, piece.player, move.to);
    if (nextJumps.length > 0 && nextJumps[0].captures.length > 0) {
      canJumpAgain = true;
    }
  }

  return { newBoard, kinged, canJumpAgain, capturedPieces };
}

export function evaluateBoard(board: BoardState): number {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p) {
        const val = p.isKing ? 3 : 1;
        if (p.player === "P2") score += val; // AI is positive
        else score -= val; // Player is negative
      }
    }
  }
  return score;
}
