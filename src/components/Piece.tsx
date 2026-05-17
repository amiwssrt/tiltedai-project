import { motion } from "motion/react";
import { Piece as IPiece } from "../game/types";
import { cn } from "../lib/utils";

export default function Piece({ piece, isStoryMode = false }: { piece: IPiece; isStoryMode?: boolean }) {
  const isP1 = piece.player === "P1";

  // Using layoutId based on piece.id ensures smooth animation across cells
  return (
    <motion.div
      layoutId={piece.id}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "w-[80%] h-[80%] rounded-full flex items-center justify-center relative group",
        isP1
          ? "bg-gradient-to-br from-[#00f2ff] to-[#006066] shadow-[0_0_15px_#00f2ff66] border border-white/20"
          : "bg-gradient-to-br from-[#7000ff] to-[#300070] shadow-[0_0_15px_#7000ff66] border border-white/20"
      )}
    >
      {isStoryMode && piece.character && (
        <div className="absolute -top-6 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-white/90 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-white/10">
          {piece.character.name}
        </div>
      )}
      <div 
        className={cn(
          "w-1/2 h-1/2 rounded-full border border-white/40 opacity-80"
        )}
      />
      {piece.isKing && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <svg className="w-1/2 h-1/2 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
