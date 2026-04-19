import type { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import { FigureNames } from "../models/figures/Figure";
import { PIECE_CODE } from "./chessPieceCodes";

// One cell: empty ".", or "wK"/"bP" (color + type letter from PIECE_CODE).
function encodeSquare(board: Board, x: number, y: number): string {
  const f = board.getCell(x, y).figure;
  if (!f) return ".";
  const c = f.color === Colors.WHITE ? "w" : "b";
  return c + PIECE_CODE[f.name];
}

// Castling rights like FEN (KQkq): only if king still unmoved on e-file start and corner rook unmoved.
// Uppercase = white (K kingside h-file, Q queenside a-file); lowercase = black on rank 8.
export function fenCastlingRights(board: Board): string {
  let s = "";
  const wk = board.getCell(4, 7).figure;
  if (wk?.name === FigureNames.KING && wk.color === Colors.WHITE && wk.isFirstMove) {
    const wrh = board.getCell(7, 7).figure;
    const wrq = board.getCell(0, 7).figure;
    if (wrh?.name === FigureNames.ROOK && wrh.color === Colors.WHITE && wrh.isFirstMove) s += "K";
    if (wrq?.name === FigureNames.ROOK && wrq.color === Colors.WHITE && wrq.isFirstMove) s += "Q";
  }
  const bk = board.getCell(4, 0).figure;
  if (bk?.name === FigureNames.KING && bk.color === Colors.BLACK && bk.isFirstMove) {
    const brh = board.getCell(7, 0).figure;
    const brq = board.getCell(0, 0).figure;
    if (brh?.name === FigureNames.ROOK && brh.color === Colors.BLACK && brh.isFirstMove) s += "k";
    if (brq?.name === FigureNames.ROOK && brq.color === Colors.BLACK && brq.isFirstMove) s += "q";
  }
  return s || "-";
}

// Builds a stable string for "same position" under FIDE-style threefold repetition:
// full board, side to move, en passant square (if any), castling rights.
// Two positions match iff this string matches.
export function buildRepetitionKey(board: Board, sideToMove: Colors): string {
  const rows: string[] = [];
  for (let y = 0; y < 8; y++) {
    let row = "";
    for (let x = 0; x < 8; x++) {
      row += encodeSquare(board, x, y);
    }
    rows.push(row);
  }
  const ep = board.enPassantTarget;
  // Coords of the ep capture square; "-" if no en passant this turn.
  const epPart = ep ? `${ep.x},${ep.y}` : "-";
  return `${rows.join("/")}|t:${sideToMove}|ep:${epPart}|c:${fenCastlingRights(board)}`;
}
