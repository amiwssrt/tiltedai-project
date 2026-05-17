import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Crown, Zap, Brain, Hexagon, ArrowRight } from "lucide-react";

export default function Premium() {
  return (
    <div className="min-h-screen bg-transparent relative flex flex-col items-center pt-20 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#7000ff_0%,_transparent_50%)] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10 flex flex-col items-center"
      >
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-[rgb(247,37,133)]/30 bg-[rgb(247,37,133)]/10 text-xs uppercase tracking-[0.2em] font-bold text-[rgb(247,37,133)]">
          Tilted Pro
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-center">
          UNLOCK YOUR <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">FULL COGNITIVE POTENTIAL</span>
        </h1>
        <p className="text-white/50 max-w-xl text-center mb-12">
          Gain unrestricted access to the Tilt Engine's raw API, deeply analyze your micro-expressions through gameplay, and customize your operator interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-pink-500" />} 
            title="Deeper Reports" 
            desc="Access move-by-move psychological timeline and prediction models." 
          />
          <FeatureCard 
            icon={<Hexagon className="w-8 h-8 text-purple-500" />} 
            title="Custom Boards" 
            desc="Equip exclusive neon glassmorphism boards and 3D animated pieces." 
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-orange-400" />} 
            title="Nightmare Engine" 
            desc="Unrestricted minimax depth search. The true AI challenge." 
          />
        </div>

        <button className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-lg rounded-full overflow-hidden hover:scale-105 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2 group-hover:text-white transition-colors">
            <Crown className="w-5 h-5 fill-current" />
            Upgrade Now - $9.99/mo
            <ArrowRight className="w-5 h-5 ml-2" />
          </span>
        </button>

        <Link to="/" className="mt-8 text-white/40 uppercase text-xs tracking-widest font-bold hover:text-white transition">
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors backdrop-blur-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}
