import type { Board } from "../models/Board";
import type { Cell } from "../models/Cell";
import { Colors } from "../models/Colors";
import { FigureNames } from "../models/figures/Figure";
import { applyUciMove, parseUciToBoardSquares } from "./fen";

export function fileRank(x: number, y: number): string {
  return `${String.fromCharCode(97 + x)}${8 - y}`;
}

function fileChar(x: number): string {
  return String.fromCharCode(97 + x);
}

function rankChar(y: number): string {
  return String(8 - y);
}

const PIECE_LETTER: Partial<Record<FigureNames, string>> = {
  [FigureNames.KNIGHT]: "N",
  [FigureNames.BISHOP]: "B",
  [FigureNames.ROOK]: "R",
  [FigureNames.QUEEN]: "Q",
  [FigureNames.KING]: "K",
};

function pieceLetter(name: FigureNames): string {
  return PIECE_LETTER[name] ?? "";
}

function candidateSources(
  board: Board,
  to: Cell,
  pieceName: FigureNames,
  color: Colors
): Cell[] {
  const out: Cell[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const c = board.getCell(x, y);
      if (!c.figure) continue;
      if (c.figure.name !== pieceName || c.figure.color !== color) continue;
      if (board.canMoveConsideringCheck(c, to, color)) out.push(c);
    }
  }
  return out;
}

function disambiguate(board: Board, from: Cell, to: Cell, pieceName: FigureNames, color: Colors): string {
  const candidates = candidateSources(board, to, pieceName, color);
  if (candidates.length <= 1) return "";

  const fileMatches = candidates.filter((c) => c.x === from.x);
  if (fileMatches.length === 1) return fileChar(from.x);

  const rankMatches = candidates.filter((c) => c.y === from.y);
  if (rankMatches.length === 1) return rankChar(from.y);

  return fileChar(from.x) + rankChar(from.y);
}

// Base SAN before move; no +/#. Board must be pre-move. 
export function buildSanBase(board: Board, from: Cell, to: Cell, movingColor: Colors): string {
  const fig = from.figure;
  if (!fig) return "";

  if (fig.name === FigureNames.KING && Math.abs(to.x - from.x) === 2) {
    return to.x > from.x ? "O-O" : "O-O-O";
  }

  const isEnPassant =
    fig.name === FigureNames.PAWN &&
    board.enPassantTarget === to &&
    !to.figure;

  const isCapture = to.figure !== null || isEnPassant;
  const dest = fileRank(to.x, to.y);

  if (fig.name === FigureNames.PAWN) {
    if (isCapture) {
      return fileChar(from.x) + "x" + dest;
    }
    return dest;
  }

  const letter = pieceLetter(fig.name);
  const dis = disambiguate(board, from, to, fig.name, movingColor);
  return letter + dis + (isCapture ? "x" : "") + dest;
}

export function appendCheckSuffix(board: Board, moverColor: Colors): string {
  const opponent = moverColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
  if (board.isCheckmate(opponent)) return "#";
  if (board.isKingInCheck(opponent)) return "+";
  return "";
}

// After pawn moved to last rank; board still has pawn on `to` until completePromotion. 
export function buildPromotionSanBase(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dest = fileRank(to.x, to.y);
  const capture = from.x !== to.x;
  if (capture) {
    return fileChar(from.x) + "x" + dest;
  }
  return dest;
}

export function promotionPieceLetter(
  piece: FigureNames.QUEEN | FigureNames.ROOK | FigureNames.BISHOP | FigureNames.KNIGHT
): string {
  return pieceLetter(piece);
}

const PROMO_FROM_UCI: Record<
  string,
  FigureNames.QUEEN | FigureNames.ROOK | FigureNames.BISHOP | FigureNames.KNIGHT
> = {
  q: FigureNames.QUEEN,
  r: FigureNames.ROOK,
  b: FigureNames.BISHOP,
  n: FigureNames.KNIGHT,
};

/**
 * Builds SAN for a UCI move, applies it to `board`, and returns the full SAN (with +/#) or null if illegal.
 */
export function sanForAppliedUci(board: Board, uci: string, moverColor: Colors): string | null {
  const trimmed = uci.trim().toLowerCase();
  const squares = parseUciToBoardSquares(trimmed);
  if (!squares) return null;
  const fromCell = board.getCell(squares.from.x, squares.from.y);
  const toCell = board.getCell(squares.to.x, squares.to.y);
  const promoChar = trimmed.length >= 5 ? trimmed[4] : null;

  if (promoChar && PROMO_FROM_UCI[promoChar]) {
    const piece = PROMO_FROM_UCI[promoChar];
    const base = buildPromotionSanBase(squares.from, squares.to) + "=" + promotionPieceLetter(piece);
    if (!applyUciMove(board, trimmed, moverColor)) return null;
    return base + appendCheckSuffix(board, moverColor);
  }

  const baseSan = buildSanBase(board, fromCell, toCell, moverColor);
  if (!applyUciMove(board, trimmed, moverColor)) return null;
  return baseSan + appendCheckSuffix(board, moverColor);
}
