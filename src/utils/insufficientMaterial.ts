import type { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import { FigureNames } from "../models/figures/Figure";

type PieceInfo = { name: FigureNames; color: Colors; x: number; y: number };

function collectPieces(board: Board): PieceInfo[] {
  const out: PieceInfo[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const f = board.getCell(x, y).figure;
      if (f) out.push({ name: f.name, color: f.color, x, y });
    }
  }
  return out;
}

function isLightSquare(x: number, y: number): boolean {
  return (x + y) % 2 === 0;
}

// FIDE-style dead position: no checkmate is possible with any legal sequence.
export function isInsufficientMaterial(board: Board): boolean {
  const pieces = collectPieces(board);
  if (
    pieces.some(
      (p) =>
        p.name === FigureNames.PAWN ||
        p.name === FigureNames.ROOK ||
        p.name === FigureNames.QUEEN
    )
  ) {
    return false;
  }

  const whiteNonKing = pieces.filter(
    (p) => p.color === Colors.WHITE && p.name !== FigureNames.KING
  );
  const blackNonKing = pieces.filter(
    (p) => p.color === Colors.BLACK && p.name !== FigureNames.KING
  );

  if (whiteNonKing.length > 1 || blackNonKing.length > 1) {
    return false;
  }

  if (pieces.length === 2) {
    return true;
  }

  if (whiteNonKing.length === 0 && blackNonKing.length === 1) return true;
  if (blackNonKing.length === 0 && whiteNonKing.length === 1) return true;

  if (
    whiteNonKing.length === 1 &&
    blackNonKing.length === 1 &&
    whiteNonKing[0].name === FigureNames.KNIGHT &&
    blackNonKing[0].name === FigureNames.KNIGHT
  ) {
    return true;
  }

  if (
    whiteNonKing.length === 1 &&
    blackNonKing.length === 1 &&
    whiteNonKing[0].name === FigureNames.BISHOP &&
    blackNonKing[0].name === FigureNames.BISHOP
  ) {
    const wLight = isLightSquare(whiteNonKing[0].x, whiteNonKing[0].y);
    const bLight = isLightSquare(blackNonKing[0].x, blackNonKing[0].y);
    return wLight === bLight;
  }

  return false;
}
