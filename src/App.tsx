import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import StoryGame from "./pages/StoryGame";
import PostGame from "./pages/PostGame";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import { useEffect } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsub();
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00f2ff]/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/story" element={<StoryGame />} />
          <Route path="/analysis" element={<PostGame />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

