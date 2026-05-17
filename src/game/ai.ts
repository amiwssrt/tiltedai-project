import { applyMove, evaluateBoard, getAvailableMoves } from "./logic";
import { BoardState, Move, Player, Position } from "./types";

export type Difficulty = "Easy" | "Medium" | "Nightmare";

const getDepth = (diff: Difficulty) => {
  switch (diff) {
    case "Easy": return 2;
    case "Medium": return 4;
    case "Nightmare": return 6;
    default: return 4; // safe fallback
  }
};

interface EvaluatedMove {
  move: Move;
  score: number;
}

export function getBestMove(board: BoardState, player: Player, difficulty: Difficulty, mandatoryPiece?: Position): Move | null {
  const depth = getDepth(difficulty);
  const moves = getAvailableMoves(board, player, mandatoryPiece);
  
  if (moves.length === 0) return null;
  // If only one move, return immediately (optimization)
  if (moves.length === 1 && depth > 2) return moves[0];

  let bestMove: Move | null = null;
  let maxScore = -Infinity;

  for (const move of moves) {
    const { newBoard, canJumpAgain } = applyMove(board, move);
    let score;
    
    if (canJumpAgain) {
      // AI extends search for multi-jumps without reducing depth
      score = minimax(newBoard, depth, -Infinity, Infinity, player, move.to);
    } else {
      score = minimax(newBoard, depth - 1, -Infinity, Infinity, "P1", undefined);
    }

    // Add some noise for Easy/Medium so it doesn't play perfectly
    if (difficulty === "Easy") score += (Math.random() - 0.5) * 1.5;
    if (difficulty === "Medium") score += (Math.random() - 0.5) * 0.5;

    if (score > maxScore) {
      maxScore = score;
      bestMove = move;
    }
  }

  // Fallback
  return bestMove || moves[0];
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  currentPlayer: Player,
  mandatoryPiece?: Position
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const moves = getAvailableMoves(board, currentPlayer, mandatoryPiece);
  if (moves.length === 0) {
    // Current player has no moves, they lose
    return currentPlayer === "P2" ? -1000 : 1000;
  }

  if (currentPlayer === "P2") {
    let maxEval = -Infinity;
    for (const move of moves) {
      const { newBoard, canJumpAgain } = applyMove(board, move);
      const evalScore = canJumpAgain
        ? minimax(newBoard, depth, alpha, beta, currentPlayer, move.to)
        : minimax(newBoard, depth - 1, alpha, beta, "P1", undefined);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const { newBoard, canJumpAgain } = applyMove(board, move);
      const evalScore = canJumpAgain
        ? minimax(newBoard, depth, alpha, beta, currentPlayer, move.to)
        : minimax(newBoard, depth - 1, alpha, beta, "P2", undefined);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
