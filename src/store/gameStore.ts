import { create } from "zustand";
import { BoardState, Move, Player, Position } from "../game/types";
import { applyMove, createInitialBoard, getAvailableMoves } from "../game/logic";
import { Difficulty, getBestMove } from "../game/ai";
import { useTiltStore } from "./tiltStore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface GameState {
  board: BoardState;
  turn: Player;
  difficulty: Difficulty;
  winner: Player | "Draw" | null;
  mandatoryPiece: Position | undefined;
  movesList: Move[];
  
  isMultiplayer: boolean;
  isStoryMode: boolean;
  matchId: string | null;
  myPlayer: Player;

  initGame: (difficulty: Difficulty, isMultiplayer?: boolean, myPlayer?: Player, matchId?: string | null, isStoryMode?: boolean) => void;
  playerMove: (move: Move) => void;
  triggerAI: () => void;
  syncFromFirebase: (data: { board: BoardState, turn: Player, winner: Player | "Draw" | null, mandatoryPiece?: Position | null }) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createInitialBoard(),
  turn: "P1",
  difficulty: "Medium",
  winner: null,
  mandatoryPiece: undefined,
  movesList: [],
  isMultiplayer: false,
  isStoryMode: false,
  matchId: null,
  myPlayer: "P1",

  initGame: (difficulty, isMultiplayer = false, myPlayer = "P1", matchId = null, isStoryMode = false) => {
    set({ board: createInitialBoard(isStoryMode), turn: "P1", winner: null, mandatoryPiece: undefined, movesList: [], difficulty, isMultiplayer, myPlayer, matchId, isStoryMode });
    if (!isMultiplayer) {
      useTiltStore.getState().reset();
      useTiltStore.getState().startTurn();
    }
  },

  syncFromFirebase: (data) => {
    set({
      board: data.board,
      turn: data.turn,
      winner: data.winner,
      mandatoryPiece: data.mandatoryPiece || undefined
    });
  },

  playerMove: async (move: Move) => {
    const state = get();
    if (state.turn !== state.myPlayer || state.winner) return;

    const { newBoard, canJumpAgain, capturedPieces } = applyMove(state.board, move);
    const isCapture = move.captures.length > 0;
    
    // Calculate if user lost piece (compare counts). But actually, AI doesn't move during player's turn.
    // Loss is when AI takes piece. So we just record capture.
    useTiltStore.getState().recordMove(isCapture, false);

    if (state.isStoryMode && isCapture && capturedPieces.length > 0) {
      const { useStoryStore } = await import("./storyStore");
      capturedPieces.forEach(p => {
        const char = p.character;
        if (char) {
           const texts = [
             `${char.name} has fallen! Their ${char.personality} spirit couldn't save them.`,
             `A decisive strike! You have destroyed ${char.name}.`,
             `The enemy's ${char.personality} defense cracks! ${char.name} is eliminated.`
           ];
           const text = texts[Math.floor(Math.random() * texts.length)];
           useStoryStore.getState().addEvent({
             text,
             type: "enemy_capture",
             character: char.name
           });
        }
      });
    }

    const nextTurn = canJumpAgain ? state.myPlayer : (state.myPlayer === "P1" ? "P2" : "P1");
    const nextMandatory = canJumpAgain ? move.to : undefined;

    set({ 
      board: newBoard, 
      movesList: [...state.movesList, move],
      turn: nextTurn,
      mandatoryPiece: nextMandatory
    });

    if (state.isMultiplayer && state.matchId) {
      try {
        await updateDoc(doc(db, "matches", state.matchId), {
          boardState: JSON.stringify({
            board: newBoard,
            turn: nextTurn,
            winner: state.winner,
            mandatoryPiece: nextMandatory
          }),
          status: "playing"
        });
      } catch (e) {
        console.error("Failed to sync move to Firebase:", e);
      }
    } else {
      if (canJumpAgain) {
        useTiltStore.getState().startTurn();
      } else {
        setTimeout(() => get().triggerAI(), 500); 
      }
    }
  },

  triggerAI: () => {
    const state = get();
    if (state.isMultiplayer || state.turn !== "P2" || state.winner) return;

    const tiltEmotion = useTiltStore.getState().emotion;
    let currentDifficulty = state.difficulty;
    
    if (tiltEmotion === "Tilted" || tiltEmotion === "Panicking") {
      currentDifficulty = "Nightmare"; 
    }

    const aiMove = getBestMove(state.board, "P2", currentDifficulty, state.mandatoryPiece);
    if (!aiMove) {
      set({ winner: "P1" }); 
      return;
    }

    const { newBoard, canJumpAgain, capturedPieces } = applyMove(state.board, aiMove);
    const isAiCapture = aiMove.captures.length > 0;
    
    if (isAiCapture) {
       const metrics = useTiltStore.getState().metrics;
       useTiltStore.setState({ metrics: { ...metrics, tilt: Math.min(100, metrics.tilt + 20) }});
       useTiltStore.getState().recordMove(false, true);

       if (state.isStoryMode && capturedPieces.length > 0) {
         import("./storyStore").then(({ useStoryStore }) => {
           capturedPieces.forEach(p => {
             const char = p.character;
             if (char) {
               const texts = [
                 `We lost ${char.name}! The enemy AI shows no mercy.`,
                 `${char.name} has been assimilated. Their ${char.personality} nature was not enough.`,
                 `Critical Loss: ${char.name} was isolated and destroyed.`
               ];
               const text = texts[Math.floor(Math.random() * texts.length)];
               useStoryStore.getState().addEvent({
                 text,
                 type: "capture",
                 character: char.name
               });
             }
           });
         });
       }
    }

    set({ board: newBoard, movesList: [...state.movesList, aiMove] });

    if (canJumpAgain) {
      set({ mandatoryPiece: aiMove.to });
      setTimeout(() => get().triggerAI(), 500);
    } else {
      const p1Moves = getAvailableMoves(newBoard, "P1", undefined);
      if (p1Moves.length === 0) {
        set({ turn: "P1", mandatoryPiece: undefined, winner: "P2" });
      } else {
        set({ turn: "P1", mandatoryPiece: undefined });
        useTiltStore.getState().startTurn();
      }
    }
  }
}));
