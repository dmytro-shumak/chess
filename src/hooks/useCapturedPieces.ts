import { type Move, WHITE } from "chess.js";
import { useCallback, useRef, useState } from "react";
import { type CapturedDisplay, capturedDisplayFromMove } from "../chess/capturedFromMove";

export function useCapturedPieces(): {
  capturedByWhite: CapturedDisplay[];
  capturedByBlack: CapturedDisplay[];
  reset: () => void;
  appendFromMove: (move: Move) => void;
  replaceAll: (white: CapturedDisplay[], black: CapturedDisplay[]) => void;
} {
  const [capturedByWhite, setCapturedByWhite] = useState<CapturedDisplay[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<CapturedDisplay[]>([]);
  const seqRef = useRef(0);

  const reset = useCallback(() => {
    seqRef.current = 0;
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }, []);

  const appendFromMove = useCallback((move: Move) => {
    const id = `live-${++seqRef.current}`;
    const cap = capturedDisplayFromMove(move, id);
    if (!cap) return;
    if (move.color === WHITE) setCapturedByWhite((prev) => [...prev, cap]);
    else setCapturedByBlack((prev) => [...prev, cap]);
  }, []);

  const replaceAll = useCallback((white: CapturedDisplay[], black: CapturedDisplay[]) => {
    seqRef.current = 0;
    setCapturedByWhite(white);
    setCapturedByBlack(black);
  }, []);

  return { capturedByWhite, capturedByBlack, reset, appendFromMove, replaceAll };
}
