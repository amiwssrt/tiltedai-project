import { useTiltStore } from "../store/tiltStore";
import { useGameStore } from "../store/gameStore";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function TiltDashboard() {
  const { emotion, metrics } = useTiltStore();
  const { difficulty } = useGameStore();

  const emotionColor = {
    Calm: "text-blue-400",
    Focused: "text-[#00f2ff]",
    Pressured: "text-yellow-400",
    Panicking: "text-orange-400",
    Tilted: "text-red-500",
  }[emotion];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white/5 border border-[#00f2ff]/30 p-5 rounded-2xl flex flex-col gap-4 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#00f2ff]/10 rounded-full blur-2xl"></div>
        <h3 className="text-[11px] uppercase tracking-widest text-[#00f2ff] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping"></span>
          Live Tilt Analysis
        </h3>
        
        <div className="flex flex-col items-center py-4">
          <motion.div 
            key={emotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("text-4xl font-black italic tracking-tighter uppercase mb-1 drop-shadow-[0_0_10px_currentColor]", emotionColor)}
          >
            {emotion}
          </motion.div>
          <p className="text-[10px] text-white/50 tracking-widest uppercase">Stability Score: {Math.round(metrics.focus)}%</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5">
              <span className="text-white/60">Tilt Level</span>
              <span className="text-[#00f2ff]">{Math.round(metrics.tilt)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${metrics.tilt}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"></motion.div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5">
              <span className="text-white/60">Aggression</span>
              <span className={metrics.aggression > 70 ? "text-red-500" : "text-orange-400"}>
                {metrics.aggression > 70 ? "HIGH" : metrics.aggression > 40 ? "MED" : "LOW"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${metrics.aggression}%` }} className="h-full bg-gradient-to-r from-red-500 to-orange-500"></motion.div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5">
              <span className="text-white/60">Recovery</span>
              <span className="text-green-400">{Math.round(metrics.recovery)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${metrics.recovery}%` }} className="h-full bg-gradient-to-r from-green-500 to-emerald-500"></motion.div>
            </div>
          </div>
        </div>

        {emotion === "Tilted" && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs italic leading-relaxed text-red-400/80">
              "AI detection: Erratic sequence identified. Player is over-extending assets."
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#7000ff]/10 border border-[#7000ff]/30 p-5 rounded-2xl">
        <h3 className="text-[11px] uppercase tracking-widest text-[#7000ff] mb-4">Adaptive AI Status</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded bg-black flex items-center justify-center border border-[#7000ff]/50">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7000ff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold">{difficulty}_Engine</p>
            <p className="text-[10px] text-white/50 uppercase">Mode: {emotion === "Tilted" ? "Aggressive" : "Standard"}-Tilt</p>
          </div>
        </div>
        <div className="h-12 w-full bg-black/40 rounded flex items-end gap-1 p-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="flex-1 bg-[#7000ff]" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
