import type { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import type { Cell } from "../models/Cell";
import { FigureNames } from "../models/figures/Figure";
import { PIECE_CODE } from "./chessPieceCodes";
import { fenCastlingRights } from "./positionRepetition";

export function squareToAlgebraic(x: number, y: number): string {
  return String.fromCharCode(97 + x) + String(8 - y);
}

export type BoardMoveSquares = { from: { x: number; y: number }; to: { x: number; y: number } };

/** UCI like e2e4 or e7e8q → board coordinates (promotion letter ignored for squares). */
export function parseUciToBoardSquares(uci: string): BoardMoveSquares | null {
  const trimmed = uci.trim().toLowerCase();
  const m = trimmed.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!m) return null;
  const from = algebraicToCoords(m[1]);
  const to = algebraicToCoords(m[2]);
  if (!from || !to) return null;
  return { from, to };
}

export function algebraicToCoords(algebraic: string): { x: number; y: number } | null {
  const m = algebraic.trim().toLowerCase().match(/^([a-h])([1-8])$/);
  if (!m) return null;
  const x = m[1].charCodeAt(0) - 97;
  const rank = parseInt(m[2], 10);
  if (rank < 1 || rank > 8) return null;
  const y = 8 - rank;
  return { x, y };
}

function fenPieceChar(fig: NonNullable<Cell["figure"]>): string {
  const letter = PIECE_CODE[fig.name];
  if (fig.color === Colors.WHITE) return letter;
  return letter.toLowerCase();
}

function fenPlacement(board: Board): string {
  const ranks: string[] = [];
  for (let y = 0; y < 8; y++) {
    let row = "";
    let emptyRun = 0;
    for (let x = 0; x < 8; x++) {
      const fig = board.getCell(x, y).figure;
      if (!fig) {
        emptyRun += 1;
      } else {
        if (emptyRun > 0) {
          row += String(emptyRun);
          emptyRun = 0;
        }
        row += fenPieceChar(fig);
      }
    }
    if (emptyRun > 0) row += String(emptyRun);
    ranks.push(row);
  }
  return ranks.join("/");
}

function fenEnPassant(board: Board): string {
  const ep = board.enPassantTarget;
  if (!ep) return "-";
  return squareToAlgebraic(ep.x, ep.y);
}

/**
 * Full FEN for the current board. Do not call while `pendingPromotion` is set.
 */
export function boardToFen(board: Board, sideToMove: Colors, fullMoveNumber: number): string {
  if (board.pendingPromotion) {
    throw new Error("boardToFen: pending promotion must be resolved first");
  }
  const placement = fenPlacement(board);
  const side = sideToMove === Colors.WHITE ? "w" : "b";
  const castling = fenCastlingRights(board);
  const ep = fenEnPassant(board);
  const half = board.halfMoveClock;
  const full = Math.max(1, fullMoveNumber);
  return `${placement} ${side} ${castling} ${ep} ${half} ${full}`;
}

const PROMO_MAP: Record<string, FigureNames.QUEEN | FigureNames.ROOK | FigureNames.BISHOP | FigureNames.KNIGHT> = {
  q: FigureNames.QUEEN,
  r: FigureNames.ROOK,
  b: FigureNames.BISHOP,
  n: FigureNames.KNIGHT,
};

/**
 * Applies a UCI move (e.g. e2e4, e7e8q) for the given side. Mutates `board`.
 */
export function applyUciMove(board: Board, uci: string, moverColor: Colors): boolean {
  if (board.pendingPromotion) return false;

  const trimmed = uci.trim().toLowerCase();
  const m = trimmed.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!m) return false;

  const from = algebraicToCoords(m[1]);
  const to = algebraicToCoords(m[2]);
  const promoLetter = m[3];
  if (!from || !to) return false;

  const fromCell = board.getCell(from.x, from.y);
  const toCell = board.getCell(to.x, to.y);
  if (!fromCell.figure || fromCell.figure.color !== moverColor) return false;

  if (promoLetter && !PROMO_MAP[promoLetter]) return false;

  if (!board.canMoveConsideringCheck(fromCell, toCell, moverColor)) return false;

  fromCell.moveFigure(toCell);

  if (board.pendingPromotion) {
    if (!promoLetter) return false;
    const piece = PROMO_MAP[promoLetter];
    if (!piece) return false;
    board.completePromotion(piece);
  }

  return true;
}
