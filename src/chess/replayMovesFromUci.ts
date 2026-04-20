import { Chess, WHITE } from "chess.js";
import { capturedDisplayFromMove } from "./capturedFromMove";
import type { CapturedDisplay } from "./capturedFromMove";
import { parseUci } from "./uci";
import type { SquareHighlight } from "./types";

export function replayMovesFromUci(
  moves: readonly { uci: string; san: string }[],
  captureKeyPrefix: string,
): {
  chess: Chess;
  movePlies: string[];
  capturedByWhite: CapturedDisplay[];
  capturedByBlack: CapturedDisplay[];
  lastHighlight: SquareHighlight | null;
} {
  const c = new Chess();
  const wc: CapturedDisplay[] = [];
  const bc: CapturedDisplay[] = [];
  let lastHl: SquareHighlight | null = null;

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i]!;
    const p = parseUci(mv.uci);
    if (!p) continue;
    const m = c.move({ from: p.from, to: p.to, promotion: p.promotion });
    if (!m) continue;
    lastHl = { from: p.from, to: p.to };
    const cap = capturedDisplayFromMove(m, `${captureKeyPrefix}-c${i}`);
    if (cap) {
      if (m.color === WHITE) wc.push(cap);
      else bc.push(cap);
    }
  }

  return {
    chess: new Chess(c.fen()),
    movePlies: moves.map((m) => m.san),
    capturedByWhite: wc,
    capturedByBlack: bc,
    lastHighlight: lastHl,
  };
}
