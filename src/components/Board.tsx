import { motion } from "motion/react";
import { useGameStore } from "../store/gameStore";
import { Move, Position } from "../game/types";
import { cn } from "../lib/utils";
import PieceUI from "./Piece";
import { getAvailableMoves } from "../game/logic";
import { useState } from "react";

export default function Board({ isStoryMode = false }: { isStoryMode?: boolean }) {
  const { board, turn, winner, playerMove, mandatoryPiece, myPlayer } = useGameStore();
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const availableMoves = turn === myPlayer ? getAvailableMoves(board, myPlayer, mandatoryPiece) : [];

  const validMovesForSelected = selectedPos
    ? availableMoves.filter(
        (m) => m.from.r === selectedPos.r && m.from.c === selectedPos.c
      )
    : [];

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== myPlayer || winner) return;

    // Is it a valid destination?
    const move = validMovesForSelected.find((m) => m.to.r === r && m.to.c === c);
    if (move) {
      playerMove(move);
      setSelectedPos(null);
      return;
    }

    // Is it selecting a piece?
    const piece = board[r][c];
    if (piece && piece.player === myPlayer) {
      // Check if we are restricted to a mandatory piece
      if (mandatoryPiece && (mandatoryPiece.r !== r || mandatoryPiece.c !== c)) {
        return;
      }
      setSelectedPos({ r, c });
    } else {
      setSelectedPos(null);
    }
  };

  return (
    <div className="relative bg-[#111] p-4 rounded-lg shadow-[0_0_50px_rgba(0,242,255,0.15)] border border-white/10 w-[500px] h-[500px] flex items-center justify-center max-w-full">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full border border-white/20">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = selectedPos?.r === r && selectedPos?.c === c;
            const isTarget = validMovesForSelected.some(
              (m) => m.to.r === r && m.to.c === c
            );

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={cn(
                  "relative flex justify-center items-center transition-colors",
                  isDark ? "bg-[#222]" : "bg-[#111]",
                  isDark && turn === myPlayer && "hover:bg-white/5 cursor-pointer",
                  isSelected && "ring-2 ring-inset ring-[#00f2ff] bg-[#00f2ff]/10",
                  isTarget && "ring-2 ring-inset ring-green-400 bg-green-500/10 cursor-pointer"
                )}
              >
                {isTarget && !piece && (
                  <motion.div
                    layoutId="target"
                    className="absolute inset-0 border-2 border-[#00f2ff] bg-[#00f2ff11] animate-pulse"
                  />
                )}
                {piece && <PieceUI piece={piece} isStoryMode={isStoryMode} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
