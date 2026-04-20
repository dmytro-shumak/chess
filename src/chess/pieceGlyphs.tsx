import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
  type Color,
  type PieceSymbol,
} from "chess.js";
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

const GLYPHS: Record<PieceSymbol, Record<Color, SvgComponent>> = {
  [PAWN]: { [WHITE]: pawnLight, [BLACK]: pawnDark },
  [KNIGHT]: { [WHITE]: knightLight, [BLACK]: knightDark },
  [BISHOP]: { [WHITE]: bishopLight, [BLACK]: bishopDark },
  [ROOK]: { [WHITE]: rookLight, [BLACK]: rookDark },
  [QUEEN]: { [WHITE]: queenLight, [BLACK]: queenDark },
  [KING]: { [WHITE]: kingLight, [BLACK]: kingDark },
};

export function pieceLogo(type: PieceSymbol, color: Color): SvgComponent {
  return GLYPHS[type][color];
}
