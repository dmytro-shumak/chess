import { Chess, WHITE } from "chess.js";
import type { CapturedDisplay } from "../../types/chess/capturedDisplay";
import type { SquareHighlight } from "../../types/chess/squareHighlight";
import { capturedDisplayFromMove } from "./capturedFromMove";
import { parseUci } from "./uci";

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
  const chess = new Chess();
  const capturedByWhite: CapturedDisplay[] = [];
  const capturedByBlack: CapturedDisplay[] = [];
  let lastHighlight: SquareHighlight | null = null;

  for (let plyIndex = 0; plyIndex < moves.length; plyIndex++) {
    const moveRecord = moves[plyIndex];
    if (!moveRecord) continue;

    const parsedUci = parseUci(moveRecord.uci);
    if (!parsedUci) continue;

    const appliedMove = chess.move({
      from: parsedUci.from,
      to: parsedUci.to,
      promotion: parsedUci.promotion,
    });
    if (!appliedMove) continue;

    lastHighlight = { from: parsedUci.from, to: parsedUci.to };

    const captureDisplay = capturedDisplayFromMove(appliedMove, `${captureKeyPrefix}-c${plyIndex}`);
    if (captureDisplay) {
      if (appliedMove.color === WHITE) capturedByWhite.push(captureDisplay);
      else capturedByBlack.push(captureDisplay);
    }
  }

  return {
    chess: new Chess(chess.fen()),
    movePlies: moves.map((moveRecord) => moveRecord.san),
    capturedByWhite,
    capturedByBlack,
    lastHighlight,
  };
}
