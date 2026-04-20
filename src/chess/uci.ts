import type { Square } from "chess.js";

export function uciFromParts(from: Square, to: Square, promotion?: string): string {
  return from + to + (promotion ?? "");
}

export function parseUci(uci: string): { from: Square; to: Square; promotion?: "q" | "r" | "b" | "n" } | null {
  const trimmed = uci.trim().toLowerCase();
  const m = trimmed.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!m) return null;
  const from = m[1] as Square;
  const to = m[2] as Square;
  const p = m[3];
  if (p === "q" || p === "r" || p === "b" || p === "n") return { from, to, promotion: p };
  if (p) return null;
  return { from, to };
}
