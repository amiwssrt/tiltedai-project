import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Activity, Brain, ShieldAlert, Target, TrendingUp } from "lucide-react";
import { useTiltStore } from "../store/tiltStore";
import { useGameStore } from "../store/gameStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PostGame() {
  const { metrics, emotion, timeline, moveHistory } = useTiltStore();
  const { winner, myPlayer } = useGameStore();

  const isVictory = winner === myPlayer;

  const getCommentary = () => {
    if (emotion === "Tilted" || emotion === "Panicking") {
       return "Our telemetry indicates your emotional state degraded significantly mid-match. You began to exhibit aggressive and rapid movement patterns, indicative of \"tilt\". The AI capitalized on this instability.";
    } else if (emotion === "Focused") {
       return "Superb mental stability. Your move times remained consistent regardless of board pressure or piece loss. You maintained a high focus score throughout the simulation.";
    } else {
       return "A balanced performance, but there is room for optimization. Your decision-making wavered during critical exchanges. Consider slowing down your pacing under pressure.";
    }
  };

  const getMatchSummary = () => {
    const totalMoves = moveHistory.length;
    const fastMoves = moveHistory.filter((m) => m.speedMs < 2000).length;
    const captures = moveHistory.filter((m) => m.isCapture).length;
    const losses = moveHistory.filter((m) => m.isLoss).length;
    
    return `In this ${totalMoves}-turn match, you played ${fastMoves} rapid moves under 2 seconds. You executed ${captures} captures while suffering ${losses} losses. Your ultimate outcome was a ${isVictory ? "victory, demonstrating strong tactical control" : "defeat, highlighting areas for psychological improvement"}.`;
  };

  // Find critical mistakes (losses that happened very quickly after the turn started)
  const criticalMistakes = moveHistory
    .map((m, index) => ({ ...m, turn: index + 1 }))
    .filter((m) => m.isLoss && m.speedMs < 3000);

  return (
    <div className="min-h-screen bg-transparent text-white relative flex flex-col items-center pt-20 pb-20 px-6 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 opacity-20 blur-[100px] ${isVictory ? "bg-[radial-gradient(circle_at_50%_0%,_#00f2ff_0%,_transparent_60%)]" : "bg-[radial-gradient(circle_at_50%_0%,_#e63946_0%,_transparent_60%)]"}`} />
      </div>

      <div className="z-10 w-full max-w-5xl space-y-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center"
        >
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs uppercase tracking-[0.2em] font-bold text-[#00f2ff]">
            Psychological Report
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">
            {isVictory ? "Simulation Cleared" : "Simulation Failed"}
          </h1>
          <p className="max-w-2xl mx-auto text-white/50 leading-relaxed">
            {getMatchSummary()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Cinematic Timeline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-8 p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden"
          >
             <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Emotional Timeline</h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={timeline.length ? timeline : [{turn: 0, tilt: 0, focus: 100, aggression: 10}]}>
                   <defs>
                     <linearGradient id="colorTilt" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#e63946" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#e63946" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                   <XAxis dataKey="turn" stroke="#ffffff30" tick={{fill: '#ffffff50', fontSize: 10}} tickLine={false} axisLine={false} />
                   <YAxis stroke="#ffffff30" tick={{fill: '#ffffff50', fontSize: 10}} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#000', borderColor: '#ffffff20', borderRadius: '8px' }}
                     itemStyle={{ color: '#fff', fontSize: '12px' }}
                     labelStyle={{ color: '#fff5', fontSize: '10px', marginBottom: '8px' }}
                   />
                   <Area type="monotone" dataKey="focus" stroke="#00f2ff" fillOpacity={1} fill="url(#colorFocus)" />
                   <Area type="monotone" dataKey="tilt" stroke="#e63946" fillOpacity={1} fill="url(#colorTilt)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-4 grid grid-cols-2 gap-4"
          >
            <StatCard label="Final Emotion" value={emotion || "Calm"} icon={<Brain className="w-4 h-4" />} />
            <StatCard label="Focus" value={`${Math.round(metrics.focus)}%`} icon={<Target className="w-4 h-4 text-[#00f2ff]" />} color="text-[#00f2ff]" />
            <StatCard label="Aggression" value={`${Math.round(metrics.aggression)}%`} icon={<ShieldAlert className="w-4 h-4 text-[#f72585]" />} color="text-[#f72585]"/>
            <StatCard label="Tilt" value={`${Math.round(metrics.tilt)}%`} icon={<Activity className="w-4 h-4 text-red-500" />} color="text-red-500" />
            <StatCard label="Recovery" value={`${Math.round(metrics.recovery)}%`} icon={<TrendingUp className="w-4 h-4 text-green-400" />} color="text-green-400" className="col-span-2" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Coaching Commentary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Brain className="w-32 h-32" />
            </div>
            <h3 className="text-xs uppercase tracking-widest text-[#7000ff] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Coaching Commentary
            </h3>
            <p className="text-white/80 leading-relaxed font-serif italic text-lg relative z-10 flex-1">
              "{getCommentary()}"
            </p>
          </motion.div>

          {/* Critical Mistakes List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col"
          >
            <h3 className="text-xs uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Critical Mistake Moments
            </h3>
            {criticalMistakes.length > 0 ? (
              <ul className="space-y-4 overflow-y-auto max-h-[200px] pr-2">
                {criticalMistakes.map((mistake, i) => (
                  <li key={i} className="flex flex-col p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-sm font-bold text-red-400">Turn {mistake.turn}</span>
                    <span className="text-xs text-white/60">Rapid play detected ({Math.round(mistake.speedMs)}ms). Insufficient calculation time resulted in a forced loss.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-white/30 italic">No critical rapid-loss mistakes detected.</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="flex justify-center gap-4 pt-8"
        >
          <Link to="/game" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform">
            Play Again
          </Link>
          <Link to="/" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/5 transition-colors">
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white", className = "" }: { label: string; value: string | number; icon: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 flex flex-col justify-between ${className}`}>
      <div className="text-white/40 flex items-center gap-2 mb-3">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
      </div>
    </div>
  );
}
