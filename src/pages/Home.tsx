import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Play, Activity, Target } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handlePlayFriend = async () => {
    if (!user) {
      alert("Authenticate via Profile to access multiplayer.");
      navigate("/profile");
      return;
    }
    const matchId = `match_${Date.now()}`;
    try {
      await setDoc(doc(db, "matches", matchId), {
        matchId,
        player1: user.uid,
        status: "waiting",
        boardState: ""
      });
      navigate(`/game?match=${matchId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create match instance.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent flex flex-col items-center justify-center">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#7000ff_0%,_transparent_50%)] opacity-30 blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_#00f2ff_0%,_transparent_50%)] opacity-20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center max-w-4xl mx-auto px-6"
      >
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-xs uppercase tracking-[0.2em] font-bold text-purple-300">
          Tilted Engine Offline
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
          EMOTIONALLY ADAPTIVE
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#7000ff]">CHECKERS</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 font-medium mb-10 max-w-2xl mx-auto">
          The first board game that analyzes your psychology in real-time. 
          The more pressured you feel, the more aggressive the AI becomes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          <Link
            to="/story"
            className="group relative px-8 py-4 bg-gradient-to-r from-[#7000ff] to-[#00f2ff] text-white font-black uppercase tracking-[0.3em] text-sm rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(112,0,255,0.4)]"
          >
            <span className="relative flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Story Mode
            </span>
          </Link>
          <Link
            to="/game"
            className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full overflow-hidden transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Play vs AI
            </span>
          </Link>
          <button
            onClick={handlePlayFriend}
            className="group relative px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full overflow-hidden hover:bg-white/5 transition-all text-center flex justify-center items-center gap-2"
          >
             <Target className="w-4 h-4" />
             Play vs Friend
          </button>
          <Link
            to="/profile"
            className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Profile
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
