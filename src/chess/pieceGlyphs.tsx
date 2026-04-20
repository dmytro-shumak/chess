import type { Color, PieceSymbol } from "chess.js";
import type { SvgComponent } from "../types/svg";
import bishopDark from "../assets/bishop-dark.svg?react";
import bishopLight from "../assets/bishop-white.svg?react";
import knightDark from "../assets/knight-dark.svg?react";
import knightLight from "../assets/knight-white.svg?react";
import queenDark from "../assets/queen-dark.svg?react";
import queenLight from "../assets/queen-white.svg?react";
import rookDark from "../assets/rook-dark.svg?react";
import rookLight from "../assets/rook-white.svg?react";
import kingDark from "../assets/king-dark.svg?react";
import kingLight from "../assets/king-white.svg?react";
import pawnDark from "../assets/pawn-dark.svg?react";
import pawnLight from "../assets/pawn-white.svg?react";

const GLYPHS: Record<PieceSymbol, { w: SvgComponent; b: SvgComponent }> = {
  p: { w: pawnLight, b: pawnDark },
  n: { w: knightLight, b: knightDark },
  b: { w: bishopLight, b: bishopDark },
  r: { w: rookLight, b: rookDark },
  q: { w: queenLight, b: queenDark },
  k: { w: kingLight, b: kingDark },
};

export function pieceLogo(type: PieceSymbol, color: Color): SvgComponent {
  return GLYPHS[type][color];
}
