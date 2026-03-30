import { FigureNames } from "../models/figures/Figure";

// Single-letter codes for piece types (FEN-style), used when serializing board state.
export const PIECE_CODE: Record<FigureNames, string> = {
  [FigureNames.KING]: "K",
  [FigureNames.QUEEN]: "Q",
  [FigureNames.ROOK]: "R",
  [FigureNames.BISHOP]: "B",
  [FigureNames.KNIGHT]: "N",
  [FigureNames.PAWN]: "P",
  [FigureNames.FIGURE]: "X",
};
