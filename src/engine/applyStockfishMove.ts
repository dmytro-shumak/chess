import { Chess, type Move } from "chess.js";
import type { SquareHighlight } from "../types/chess/squareHighlight";
import { parseUci } from "../utils/chess/uci";
import type { EnginePreset } from "./enginePresets";
import type { StockfishClient } from "./stockfishClient";

export type StockfishMoveResult = {
  nextFen: string;
  san: string;
  highlight: SquareHighlight;
  move: Move;
};

export async function applyStockfishBestMove(
  client: StockfishClient,
  fen: string,
  preset: Pick<EnginePreset, "movetime" | "depth">,
): Promise<StockfishMoveResult | null> {
  const uciBest = await client.goBestMove(fen, {
    movetime: preset.movetime,
    depth: preset.depth,
  });

  const parsed = parseUci(uciBest);

  if (!parsed) {
    return null;
  }

  const board = new Chess(fen);

  const appliedMove = board.move({
    from: parsed.from,
    to: parsed.to,
    promotion: parsed.promotion,
  });

  if (!appliedMove) {
    return null;
  }

  return {
    nextFen: board.fen(),
    san: appliedMove.san,
    highlight: { from: parsed.from, to: parsed.to },
    move: appliedMove,
  };
}
