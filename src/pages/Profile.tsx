import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { LogIn, User, Crown, Shield } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Profile() {
  const { user, loading } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      try {
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", u.uid), {
            userId: u.uid,
            displayName: u.displayName || "Unknown",
            email: u.email || "",
            winRate: 0
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative flex flex-col pt-20 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_#7000ff_0%,_transparent_50%)] opacity-20 blur-3xl" />
      
      <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-black mb-12 tracking-tighter">OPERATOR PROFILE</h1>

        {loading ? (
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white/10" />
            <div className="h-6 w-32 bg-white/10 rounded" />
          </div>
        ) : user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center"
          >
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 w-full md:w-2/3 flex flex-col items-center">
              <img src={user.photoURL || ""} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-6" />
              <h2 className="text-2xl font-bold mb-2">{user.displayName}</h2>
              <p className="text-white/50 text-sm font-mono mb-8">{user.email}</p>

              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 text-center">
                  <div className="text-xs uppercase text-white/50 tracking-wider mb-1">Win Rate</div>
                  <div className="text-xl font-bold text-[#4cc9f0]">52.4%</div>
                </div>
                <div className="p-4 rounded-xl bg-black/50 border border-white/5 text-center">
                  <div className="text-xs uppercase text-white/50 tracking-wider mb-1">Status</div>
                  <div className="text-xl font-bold text-green-400">ACTIVE</div>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Link to="/premium" className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-center font-bold uppercase tracking-widest text-sm transform transition hover:scale-105 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" /> Go Pro
                </Link>
                <button onClick={handleLogout} className="py-3 px-6 rounded-lg border border-white/20 text-white/50 text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition">
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <p className="text-white/50 max-w-md">Authenticate to synchronize your psychological telemetry across devices and access competitive matchmaking.</p>
            
            <button 
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <LogIn className="w-5 h-5" /> Initialize Access
            </button>
            {errorMsg && (
              <div className="mt-4 p-4 text-sm bg-red-500/20 text-red-300 border border-red-500/50 rounded-xl">
                {errorMsg}
                <div className="mt-2 text-xs opacity-80">
                  If you encounter a popup error or "unauthorized domain", make sure to add this app's URL to your Firebase Authorized Domains, or try opening the app in a new tab.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Link to="/" className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition z-10">
        Return to Protocol
      </Link>
    </div>
  );
}
