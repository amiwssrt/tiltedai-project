import Board from "../components/Board";
import TiltDashboard from "../components/TiltDashboard";
import { useGameStore } from "../store/gameStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Game() {
  const { initGame, turn, winner, difficulty, myPlayer, isMultiplayer, syncFromFirebase } = useGameStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("match");
  const { user, loading } = useAuthStore();
  const [copyStatus, setCopyStatus] = useState("Copy Invite Link");
  const [matchStatus, setMatchStatus] = useState("waiting");
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    if (!matchId) {
      initGame("Medium", false);
      setMatchStatus("playing");
      return;
    }

    if (loading) return;

    if (!user) {
      setNeedsAuth(true);
      return;
    } else {
      setNeedsAuth(false);
    }

    let unsub: () => void = () => {};
    let isSubscribed = true;

    const joinMatch = async () => {
      const matchRef = doc(db, "matches", matchId);
      const snap = await getDoc(matchRef);
      if (snap.exists() && isSubscribed) {
        const data = snap.data();
        let myP: "P1" | "P2" = "P1";
        
        if (data.player1 === user.uid) {
           myP = "P1";
        } else if (!data.player2) {
           await updateDoc(matchRef, { player2: user.uid, status: "playing" });
           myP = "P2";
        } else if (data.player2 === user.uid) {
           myP = "P2";
        }
        
        initGame("Medium", true, myP, matchId);
        setMatchStatus(data.player2 ? "playing" : "waiting");

        unsub = onSnapshot(matchRef, (docSnap) => {
          if (docSnap.exists()) {
            const docData = docSnap.data();
            setMatchStatus(docData.status);
            if (docData.boardState) {
               try {
                 const stateData = JSON.parse(docData.boardState);
                 syncFromFirebase(stateData);
               } catch (e) {
                 console.error("Failed to parse boardState", e);
               }
            }
          }
        });
      }
    };
    joinMatch();

    return () => {
      isSubscribed = false;
      unsub();
    };
  }, [matchId, user, initGame, syncFromFirebase]);

  const opponentLabel = isMultiplayer ? "HUMAN OPPONENT" : `${difficulty} AI`;
  const turnLabel = matchStatus === "waiting" 
    ? "Waiting for Opponent..." 
    : (isMultiplayer 
      ? (turn === myPlayer ? "Your Turn" : "Opponent Computing...")
      : (turn === "P1" ? "Your Turn" : "AI Computing..."));

  const handleQuickLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", u.uid), {
          userId: u.uid,
          displayName: u.displayName || "Operator",
          email: u.email || "",
          winRate: 0
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Invite Link"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 overflow-hidden max-w-[1024px] mx-auto">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_#7000ff_0%,_transparent_40%)] opacity-10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_#00f2ff_0%,_transparent_40%)] opacity-5 blur-3xl" />
      </div>

      <header className="z-10 flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00f2ff] to-[#7000ff] rounded-lg flex items-center justify-center font-bold text-black text-2xl skew-x-[-12deg]">T</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white hover:text-white/80 transition-colors">
            Tilted <span className="text-[#00f2ff] text-xs font-normal tracking-[0.2em] ml-2 align-top">PREMIUM</span>
          </h1>
        </Link>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Match State</p>
            <p className="font-mono text-[#00f2ff]">{turnLabel}</p>
          </div>
          <div className="h-10 w-[1px] bg-white/20"></div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-[#00f2ff]"></div>
            <span className="font-semibold text-sm tracking-wide uppercase">{opponentLabel}</span>
          </div>
        </div>
      </header>

      <main className="z-10 flex gap-6 flex-1 items-start">
        {/* Left Side: Match Profile / Logs */}
        <aside className="w-64 flex flex-col gap-6 order-1 hidden lg:flex h-full">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3 className="text-[11px] uppercase tracking-widest text-[#00f2ff] mb-4">Match Profile</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Opponent</span>
                <span className="text-sm font-bold text-red-500">{opponentLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Elo Rating</span>
                <span className="text-sm font-bold">2840</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col">
            <h3 className="text-[11px] uppercase tracking-widest text-[#7000ff] mb-4">Match Protocol</h3>
            <div className="flex-1 flex flex-col justify-end gap-2">
              <p className="text-xs text-white/40 font-mono">Analyzing behavioral data...</p>
              {isMultiplayer && (
                 <button onClick={handleCopyLink} className="w-full text-xs font-bold uppercase tracking-widest py-2 rounded border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/10">
                   {copyStatus}
                 </button>
              )}
            </div>
          </div>
        </aside>

        {/* Center: Game Board */}
        <section className="flex-1 flex flex-col items-center justify-center relative order-2">
          {matchStatus === "waiting" && isMultiplayer && !needsAuth && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
               <h3 className="text-xl font-bold mb-4">Waiting for Opponent</h3>
               <p className="text-white/60 mb-6 text-sm">Share this link with your friend to play:</p>
               <div className="flex gap-2 items-center bg-[#111] border border-white/20 rounded p-2 mb-4 w-3/4 max-w-sm">
                 <input className="bg-transparent flex-1 text-[#00f2ff] text-xs font-mono outline-none truncate" readOnly value={window.location.href} />
                 <button onClick={handleCopyLink} className="px-3 py-1 bg-[#00f2ff]/20 text-[#00f2ff] text-xs font-bold rounded hover:bg-[#00f2ff]/40 transition">
                   {copyStatus === "Copied!" ? "Copied" : "Copy"}
                 </button>
               </div>
            </div>
          )}
          <div className={matchStatus === "waiting" ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
            <Board />
          </div>
          <div className="mt-8 flex gap-4">
            <Link to="/" className="px-8 py-3 bg-white/5 border border-white/20 rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-white/10">Resign</Link>
          </div>
        </section>

        {/* Right Side: Tilt Engine Dashboard */}
        <aside className="w-72 flex flex-col gap-6 order-3 hidden lg:flex h-full">
          {!isMultiplayer ? (
            <TiltDashboard />
          ) : (
            <div className="bg-[#7000ff]/10 border border-[#7000ff]/30 p-5 rounded-2xl">
              <h3 className="text-[11px] uppercase tracking-widest text-[#7000ff] mb-4">Tilt Engine Offline</h3>
              <p className="text-xs text-white/50">Tilt telemetry is disabled in multiplayer mode.</p>
            </div>
          )}
        </aside>
      </main>

      <AnimatePresence>
        {needsAuth && matchId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div className="text-center bg-[#111] p-8 rounded-3xl border border-white/10 max-w-sm">
              <h2 className="text-2xl font-black mb-4 uppercase italic">Auth Required</h2>
              <p className="text-white/50 text-sm mb-8">You must be authenticated to join this multiplayer match.</p>
              <button 
                onClick={handleQuickLogin} 
                className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform"
              >
                Sign In With Google
              </button>
            </motion.div>
          </motion.div>
        )}
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-6xl font-black tracking-tighter mb-4 text-white">
                {winner === myPlayer ? "VICTORY" : "DEFEAT"}
              </h2>
              <div className="flex justify-center gap-4 mt-8">
                <Link to="/analysis" className="px-6 py-2 rounded bg-white text-black uppercase tracking-widest text-xs font-bold hover:scale-105 transition-transform">
                  Generate Analysis
                </Link>
                <Link to="/" className="px-6 py-2 rounded bg-white/10 uppercase tracking-widest text-xs font-bold hover:bg-white/20 transition-colors">
                  Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
