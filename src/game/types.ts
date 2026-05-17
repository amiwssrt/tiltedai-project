export type Player = "P1" | "P2"; // P1 is the user (Blue), P2 is the AI (Purple)

export interface StoryCharacter {
  name: string;
  personality: "fearless" | "strategic" | "emotional" | "loyal" | "reckless" | "calm";
}

export interface Piece {
  id: string;
  player: Player;
  isKing: boolean;
  character?: StoryCharacter;
}

export type BoardState = (Piece | null)[][];

export interface Position {
  r: number;
  c: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
}

export type EmotionState = "Calm" | "Focused" | "Pressured" | "Panicking" | "Tilted";
