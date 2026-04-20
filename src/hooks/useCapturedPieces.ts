import { type Move, WHITE } from "chess.js";
import { useCallback, useRef, useState } from "react";
import type { CapturedDisplay } from "../types/chess/capturedDisplay";
import { capturedDisplayFromMove } from "../utils/chess/capturedFromMove";

export function useCapturedPieces(): {
  capturedByWhite: CapturedDisplay[];
  capturedByBlack: CapturedDisplay[];
  reset: () => void;
  appendFromMove: (move: Move) => void;
  replaceAll: (white: CapturedDisplay[], black: CapturedDisplay[]) => void;
} {
  const [capturedByWhite, setCapturedByWhite] = useState<CapturedDisplay[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<CapturedDisplay[]>([]);

  const nextLiveCaptureRowIdRef = useRef(0);

  const reset = useCallback(() => {
    nextLiveCaptureRowIdRef.current = 0;
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }, []);

  // If this move captured, add that piece to the mover's captured list
  const appendFromMove = useCallback((move: Move) => {
    const rowId = `live-${++nextLiveCaptureRowIdRef.current}`;
    const captured = capturedDisplayFromMove(move, rowId);
    if (!captured) return;

    if (move.color === WHITE) {
      setCapturedByWhite((prev) => [...prev, captured]);
    } else {
      setCapturedByBlack((prev) => [...prev, captured]);
    }
  }, []);

  const replaceAll = useCallback((white: CapturedDisplay[], black: CapturedDisplay[]) => {
    nextLiveCaptureRowIdRef.current = 0;
    setCapturedByWhite(white);
    setCapturedByBlack(black);
  }, []);

  return { capturedByWhite, capturedByBlack, reset, appendFromMove, replaceAll };
}
