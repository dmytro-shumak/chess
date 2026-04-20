import type { Square } from "chess.js";
import { BISHOP, KNIGHT, QUEEN, ROOK } from "chess.js";
import type { PromotionChoice } from "./promotion";

export type { PromotionChoice } from "./promotion";

export function uciFromParts(from: Square, to: Square, promotion?: PromotionChoice): string {
  return from + to + (promotion ?? "");
}

export function parseUci(
  uci: string,
): { from: Square; to: Square; promotion?: PromotionChoice } | null {
  const trimmed = uci.trim().toLowerCase();
  const m = trimmed.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!m) return null;
  const from = m[1] as Square;
  const to = m[2] as Square;
  const p = m[3];
  if (p === QUEEN || p === ROOK || p === BISHOP || p === KNIGHT) return { from, to, promotion: p };
  if (p) return null;
  return { from, to };
}
