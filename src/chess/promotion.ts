import { BISHOP, KNIGHT, QUEEN, ROOK } from "chess.js";

export type PromotionChoice = typeof QUEEN | typeof ROOK | typeof BISHOP | typeof KNIGHT;
