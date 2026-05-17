import { create } from "zustand";
import { EmotionState } from "../game/types";

export interface TiltMetrics {
  focus: number; // 0-100
  aggression: number; // 0-100
  tilt: number; // 0-100
  recovery: number; // 0-100
}

interface TiltState {
  emotion: EmotionState;
  metrics: TiltMetrics;
  moveHistory: { speedMs: number; isCapture: boolean; isLoss: boolean; timestamp: number }[];
  timeline: { turn: number; tilt: number; focus: number; aggression: number }[];
  turnStartTime: number | null;
  startTurn: () => void;
  recordMove: (isCapture: boolean, isLoss: boolean) => void;
  reset: () => void;
}

export const useTiltStore = create<TiltState>((set, get) => ({
  emotion: "Calm",
  metrics: {
    focus: 100,
    aggression: 10,
    tilt: 0,
    recovery: 50,
  },
  moveHistory: [],
  timeline: [],
  turnStartTime: null,

  startTurn: () => set({ turnStartTime: Date.now() }),
  
  recordMove: (isCapture, isLoss) => {
    const { turnStartTime, moveHistory, metrics } = get();
    if (!turnStartTime) return;
    
    const speedMs = Date.now() - turnStartTime;
    const newHistory = [...moveHistory, { speedMs, isCapture, isLoss, timestamp: Date.now() }];
    
    let newMetrics = { ...metrics };
    
    // Logic for Tilt Engine
    // 1. Move Speed: fast moves (< 2000ms) might mean confidence or tilt.
    if (speedMs < 1500) {
      newMetrics.aggression = Math.min(100, newMetrics.aggression + 5);
      if (isLoss) {
        newMetrics.tilt = Math.min(100, newMetrics.tilt + 10); // Fast move after loss = panicking/tilt
      }
    } else if (speedMs > 10000) {
      // Hesitation
      newMetrics.focus = Math.max(0, newMetrics.focus - 5);
      newMetrics.tilt = Math.max(0, newMetrics.tilt - 2); // Slows down, maybe calming down or confused
    }

    // 2. Losses increment Tilt
    if (isLoss) {
      newMetrics.tilt = Math.min(100, newMetrics.tilt + 15);
      newMetrics.focus = Math.max(0, newMetrics.focus - 10);
    }

    if (isCapture) {
      newMetrics.aggression = Math.min(100, newMetrics.aggression + 8);
      // Good outcome, lowers tilt, increases recovery
      newMetrics.tilt = Math.max(0, newMetrics.tilt - 10);
      newMetrics.recovery = Math.min(100, newMetrics.recovery + 5);
    }

    // Deriving Emotion
    let newEmotion: EmotionState = "Calm";
    if (newMetrics.tilt > 80) newEmotion = "Tilted";
    else if (newMetrics.tilt > 50 && newMetrics.focus < 40) newEmotion = "Panicking";
    else if (newMetrics.tilt > 40) newEmotion = "Pressured";
    else if (newMetrics.focus > 80) newEmotion = "Focused";

    const newTimeline = [...get().timeline, { 
      turn: newHistory.length, 
      tilt: newMetrics.tilt, 
      focus: newMetrics.focus, 
      aggression: newMetrics.aggression 
    }];

    set({
      moveHistory: newHistory,
      timeline: newTimeline,
      metrics: newMetrics,
      emotion: newEmotion,
      turnStartTime: null,
    });
  },

  reset: () => set({
    emotion: "Calm",
    metrics: { focus: 100, aggression: 10, tilt: 0, recovery: 50 },
    moveHistory: [],
    timeline: [],
    turnStartTime: null
  })
}));
