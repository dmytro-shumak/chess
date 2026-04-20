import {
  BLACK,
  Chess,
  type Color,
  DEFAULT_POSITION,
  type Move,
  type Square,
  WHITE,
} from "chess.js";
import { useEffect, useMemo, useState } from "react";
import { Colors } from "../constants/chess/colors";
import { GameStatus } from "../constants/chess/gameStatus";
import type { Player } from "../types/chess/player";
import type { PromotionChoice } from "../types/chess/promotion";
import type { SquareHighlight } from "../types/chess/squareHighlight";
import { squaresInDisplayOrder } from "../utils/chess/squares";
import PromotionModal from "./PromotionModal";
import SquareCell from "./SquareCell";

export type { SquareHighlight } from "../types/chess/squareHighlight";

interface BoardProps {
  chess: Chess;
  setChess: (updater: (prev: Chess) => Chess) => void;
  // the player whose turn it is
  turnPlayer: Player | null;
  gameStatus: GameStatus;
  checkSquare: Square | null;
  onMove?: (move: Move) => void;
  swapPlayer?: () => void;
  inputLocked?: boolean;
  lastMoveHighlight?: SquareHighlight | null;
  onLastMoveHighlight?: (h: SquareHighlight | null) => void;
  viewFromColor?: Colors;
}

function BoardComponent({
  chess,
  setChess,
  turnPlayer,
  gameStatus,
  checkSquare,
  onMove,
  swapPlayer,
  inputLocked = false,
  lastMoveHighlight,
  onLastMoveHighlight,
  viewFromColor = Colors.WHITE,
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [internalLastMove, setInternalLastMove] = useState<SquareHighlight | null>(null);
  const [promotionPick, setPromotionPick] = useState<{ from: Square; to: Square } | null>(null);

  // Clear internal last-move highlight when the board is reset
  useEffect(() => {
    const fen = chess.fen();
    setSelectedSquare(null);
    setPromotionPick(null);
    if (fen === DEFAULT_POSITION) {
      setInternalLastMove(null);
    }
  }, [chess]);

  const controlledHighlight = onLastMoveHighlight !== undefined;
  const displayLastMove = controlledHighlight ? (lastMoveHighlight ?? null) : internalLastMove;

  function setLastMoveDisplay(move: SquareHighlight | null): void {
    if (controlledHighlight) {
      onLastMoveHighlight?.(move);
    } else {
      setInternalLastMove(move);
    }
  }

  const turnColor: Color | null = useMemo(() => {
    if (!turnPlayer) return null;

    return turnPlayer.color === Colors.WHITE ? WHITE : BLACK;
  }, [turnPlayer]);

  const legalTargets = useMemo(() => {
    if (!selectedSquare || inputLocked || gameStatus !== GameStatus.ACTIVE)
      return new Set<Square>();

    if (turnColor !== null && chess.turn() !== turnColor) {
      return new Set<Square>();
    }
    const piece = chess.get(selectedSquare);

    if (!piece || piece.color !== chess.turn()) {
      return new Set<Square>();
    }

    const moves = chess.moves({ square: selectedSquare, verbose: true });

    return new Set(moves.map((move) => move.to));
  }, [chess, selectedSquare, turnColor, inputLocked, gameStatus]);

  const displaySquares = useMemo(() => squaresInDisplayOrder(viewFromColor), [viewFromColor]);

  function finishMove(from: Square, to: Square, promotion?: PromotionChoice): void {
    const result = chess.move({ from, to, promotion });
    if (!result) return;
    setChess((prev) => new Chess(prev.fen()));
    setLastMoveDisplay({ from, to });
    setSelectedSquare(null);
    setPromotionPick(null);
    onMove?.(result);
    swapPlayer?.();
  }

  function handlePromotionSelect(piece: PromotionChoice): void {
    if (!promotionPick) return;
    finishMove(promotionPick.from, promotionPick.to, piece);
  }

  function trySelectDestination(to: Square): void {
    if (!selectedSquare || inputLocked || gameStatus !== GameStatus.ACTIVE) return;
    if (turnColor !== null && chess.turn() !== turnColor) return;

    const candidates = chess
      .moves({ square: selectedSquare, verbose: true })
      .filter((move) => move.to === to);
    if (candidates.length === 0) return;

    // if there are multiple candidates, we need to prompt the user to choose a promotion
    if (candidates.length > 1) {
      setPromotionPick({ from: selectedSquare, to: to });
      return;
    }
    finishMove(selectedSquare, to);
  }

  function onSquareClick(square: Square): void {
    if (inputLocked || gameStatus !== GameStatus.ACTIVE) return;
    if (turnColor !== null && chess.turn() !== turnColor) return;

    const piece = chess.get(square);

    if (selectedSquare && selectedSquare !== square) {
      if (legalTargets.has(square)) {
        trySelectDestination(square);
        return;
      }
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }

  const promotionColor = chess.turn() === WHITE ? Colors.WHITE : Colors.BLACK;

  return (
    <div className="my-1">
      <PromotionModal
        open={promotionPick !== null}
        color={promotionColor}
        onSelect={handlePromotionSelect}
      />
      <div className="grid h-[640px] w-[640px] max-w-full grid-cols-8 grid-rows-8 border-2 border-slate-900 shadow-xl">
        {displaySquares.map((square) => (
          <SquareCell
            key={square}
            square={square}
            chess={chess}
            viewFromColor={viewFromColor}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            checkSquare={checkSquare}
            lastMove={displayLastMove}
            onClick={() => onSquareClick(square)}
          />
        ))}
      </div>
    </div>
  );
}

export default BoardComponent;
