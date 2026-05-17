import { create } from "zustand";
import { Piece } from "../game/types";

export interface StoryEvent {
  id: string;
  text: string;
  character?: string;
  type: "info" | "action" | "capture" | "enemy_capture" | "panic" | "comeback";
}

export interface StoryState {
  events: StoryEvent[];
  chapterTitle: string;
  addEvent: (event: Omit<StoryEvent, "id">) => void;
  setChapterTitle: (title: string) => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  events: [],
  chapterTitle: "Chapter 1: The Gathering",
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Date.now().toString() + Math.random() }]
  })),
  setChapterTitle: (title) => set({ chapterTitle: title }),
  reset: () => set({ events: [], chapterTitle: "Chapter 1: The Gathering" }),
}));
