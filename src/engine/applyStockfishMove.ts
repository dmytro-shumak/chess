import { Chess, type Move } from "chess.js";
import type { StockfishClient } from "./stockfishClient";
import type { EnginePreset } from "./enginePresets";
import { parseUci } from "../chess/uci";
import type { SquareHighlight } from "../chess/types";

export type StockfishMoveResult = {
  nextFen: string;
  san: string;
  highlight: SquareHighlight;
  move: Move;
};

/**
 * Runs engine search from `fen` and applies best UCI on a copy; returns data for React state updates.
 */
export async function applyStockfishBestMove(
  client: StockfishClient,
  fen: string,
  preset: Pick<EnginePreset, "movetime" | "depth">,
): Promise<StockfishMoveResult | null> {
  const uci = await client.goBestMove(fen, { movetime: preset.movetime, depth: preset.depth });
  const p = parseUci(uci);
  if (!p) return null;
  const next = new Chess(fen);
  const m = next.move({ from: p.from, to: p.to, promotion: p.promotion });
  if (!m) return null;
  return {
    nextFen: next.fen(),
    san: m.san,
    highlight: { from: p.from, to: p.to },
    move: m,
  };
}
