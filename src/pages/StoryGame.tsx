import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useStoryStore } from "../store/storyStore";
import { useTiltStore } from "../store/tiltStore";
import Board from "../components/Board";
import { Brain, Sparkles, AlertTriangle, Music } from "lucide-react";

export default function StoryGame() {
  const { initGame, turn, winner, myPlayer } = useGameStore();
  const { events, chapterTitle } = useStoryStore();
  const { emotion, metrics } = useTiltStore();
  const navigate = useNavigate();
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const prevEmotion = useRef(emotion);
  const [soundtrackIntensity, setSoundtrackIntensity] = useState(1);

  useEffect(() => {
    initGame("Nightmare", false, "P1", null, true);
    useStoryStore.getState().reset();
    useStoryStore.getState().addEvent({
      text: "The simulation has initialized. The enemy AI (Purple) is ruthless. Your squad looks to you for command.",
      type: "info"
    });
  }, [initGame]);

  useEffect(() => {
    if (prevEmotion.current !== emotion) {
      if (emotion === "Panicking") {
        useStoryStore.getState().addEvent({
          text: "[Soundtrack: Chaotic synths swell] The commander's resolve is fracturing...",
          type: "panic"
        });
        setSoundtrackIntensity(3);
      } else if (emotion === "Tilted") {
        useStoryStore.getState().addEvent({
          text: "[Soundtrack: Heavy bass drops] Aggression detected. The narrative turns violent.",
          type: "action"
        });
        setSoundtrackIntensity(2);
      } else if (emotion === "Focused" && prevEmotion.current !== "Calm") {
        useStoryStore.getState().addEvent({
          text: "[Soundtrack: Steady futuristic hum] Control regained. A strategic comeback unfolds.",
          type: "comeback"
        });
        setSoundtrackIntensity(1);
      }
      prevEmotion.current = emotion;
    }
  }, [emotion]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
           animate={{ 
             scale: [1, 1 + soundtrackIntensity * 0.1, 1],
             opacity: [0.3, 0.3 + soundtrackIntensity * 0.1, 0.3]
           }}
           transition={{ repeat: Infinity, duration: 2 / soundtrackIntensity, ease: "easeInOut" }}
           className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#6000ff]/10 rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
           animate={{ 
             scale: [1, 1 + soundtrackIntensity * 0.1, 1],
             opacity: [0.3, 0.3 + soundtrackIntensity * 0.1, 0.3]
           }}
           transition={{ repeat: Infinity, duration: 2.5 / soundtrackIntensity, ease: "easeInOut" }}
           className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#00f2ff]/10 rounded-full blur-[150px] mix-blend-screen" 
        />
      </div>

      <header className="relative z-10 w-full p-6 flex justify-between items-center border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#00f2ff] mb-1">Interactive Narrative</div>
          <h1 className="text-xl font-bold tracking-tight">{chapterTitle}</h1>
        </div>
        <div className="text-sm font-bold bg-white/10 px-4 py-2 rounded-full border border-white/5">
          {turn === myPlayer ? "YOUR COMMAND" : "ENEMY COMPUTING..."}
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 relative z-10">
        
        {/* Story Log */}
        <div className="lg:col-span-4 flex flex-col pt-8 space-y-6 max-h-[70vh] overflow-hidden">
          <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest px-4">
            <Brain className="w-4 h-4" /> AI NARRATOR
          </div>
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {events.map((ev, idx) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className={`p-4 rounded-xl border backdrop-blur-sm ${
                    ev.type === 'capture' ? 'bg-[#ff003c]/10 border-[#ff003c]/30 text-[#ff003c]' :
                    ev.type === 'enemy_capture' ? 'bg-[#f72585]/10 border-[#f72585]/30 text-[#ff99cc]' :
                    ev.type === 'panic' ? 'bg-[#7000ff]/10 border-[#7000ff]/30 text-[#b580ff]' :
                    ev.type === 'comeback' ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#a0ffff]' :
                    ev.type === 'action' ? 'bg-[#ff9900]/10 border-[#ff9900]/30 text-[#ffd580]' :
                    ev.type === 'info' ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]' :
                    'bg-white/5 border-white/10 text-white/80'
                  }`}
                >
                  {ev.character && (
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mb-1 flex items-center gap-1">
                      {ev.type === 'capture' || ev.type === 'enemy_capture' ? <AlertTriangle className="w-3 h-3"/> : <Sparkles className="w-3 h-3" />}
                      {ev.character}
                    </div>
                  )}
                  {['panic', 'comeback', 'action'].includes(ev.type) && (
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-70 mb-1 flex items-center gap-1">
                       <Music className="w-3 h-3" /> NARRATOR
                    </div>
                  )}
                  <p className="text-sm leading-relaxed font-serif italic">"{ev.text}"</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* Board */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          <Board isStoryMode={true} />
        </div>

      </div>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center p-12 max-w-2xl bg-[#0a0a0a] rounded-3xl border border-white/10"
            >
               <h2 className="text-sm font-bold tracking-[0.3em] text-[#00f2ff] uppercase mb-4">Chapter Concluded</h2>
               <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter italic">
                 {winner === myPlayer ? "The Resistance Survives" : "Total Assimmilation"}
               </h1>
               <p className="text-white/60 text-lg font-serif italic mb-8">
                 {winner === myPlayer ? "You have commanded your forces with emotional clarity. The AI's tactical advantage was shattered." : "Your forces have been overwhelmed. The cold calculus of the machine prevailed."}
               </p>
               <div className="flex justify-center gap-4">
                 <Link to="/analysis" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform">
                   Generate Analysis
                 </Link>
                 <button onClick={() => { initGame("Nightmare", false, "P1", null, true); useStoryStore.getState().reset(); }} className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/5 transition-colors">
                   Restart Story
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
