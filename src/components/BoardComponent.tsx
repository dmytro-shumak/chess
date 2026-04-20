import { Chess, type Color, type Move, type Square } from "chess.js";
import { useMemo, useState } from "react";
import SquareCell from "./SquareCell";
import PromotionModal, { type PromotionChoice } from "./PromotionModal";
import { Player } from "../models/Player";
import { GameStatus } from "../models/GameStatus";
import { Colors } from "../models/Colors";
import { squaresInDisplayOrder } from "../chess/squares";
import { pieceLogo } from "../chess/pieceGlyphs";
import { uciFromParts } from "../chess/uci";

export type SquareHighlight = { from: Square; to: Square };

function parseSquareCoords(square: Square): { fileIndex: number; rankNumber: number } {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankNumber = parseInt(square[1]!, 10);
  return { fileIndex, rankNumber };
}

interface BoardProps {
  chess: Chess;
  setChess: (updater: (prev: Chess) => Chess) => void;
  turnPlayer: Player | null;
  gameStatus: GameStatus;
  checkSquare: Square | null;
  onMove?: (payload: { san: string; uci: string; move: Move }) => void;
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
    return turnPlayer.color === Colors.WHITE ? "w" : "b";
  }, [turnPlayer]);

  const legalTargets = useMemo(() => {
    if (!selectedSquare || inputLocked || gameStatus !== GameStatus.ACTIVE) return new Set<Square>();
    if (turnColor !== null && chess.turn() !== turnColor) return new Set<Square>();
    const piece = chess.get(selectedSquare);
    if (!piece || piece.color !== chess.turn()) return new Set<Square>();
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [chess, selectedSquare, turnColor, inputLocked, gameStatus]);

  const displaySquares = useMemo(() => squaresInDisplayOrder(viewFromColor), [viewFromColor]);

  function lastMoveRoleForSquare(square: Square): "from" | "to" | null {
    if (!displayLastMove) return null;
    if (square === displayLastMove.from) return "from";
    if (square === displayLastMove.to) return "to";
    return null;
  }

  function finishMove(from: Square, to: Square, promotion?: PromotionChoice): void {
    const result = chess.move({ from, to, promotion });
    if (!result) return;
    const uci = uciFromParts(from, to, promotion);
    setChess((prev) => new Chess(prev.fen()));
    setLastMoveDisplay({ from, to });
    setSelectedSquare(null);
    setPromotionPick(null);
    onMove?.({ san: result.san, uci, move: result });
    swapPlayer?.();
  }

  function handlePromotionSelect(piece: PromotionChoice): void {
    if (!promotionPick) return;
    finishMove(promotionPick.from, promotionPick.to, piece);
  }

  function trySelectDestination(toSq: Square): void {
    if (!selectedSquare || inputLocked || gameStatus !== GameStatus.ACTIVE) return;
    if (turnColor !== null && chess.turn() !== turnColor) return;

    const candidates = chess.moves({ square: selectedSquare, verbose: true }).filter((m) => m.to === toSq);
    if (candidates.length === 0) return;

    const promoOptions: PromotionChoice[] = [];
    for (const m of candidates) {
      const p = m.promotion;
      if (p !== "q" && p !== "r" && p !== "b" && p !== "n") continue;
      if (!promoOptions.includes(p)) promoOptions.push(p);
    }
    if (promoOptions.length > 1) {
      setPromotionPick({ from: selectedSquare, to: toSq });
      return;
    }
    finishMove(selectedSquare, toSq, promoOptions[0]);
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

  const promotionColor = chess.turn() === "w" ? Colors.WHITE : Colors.BLACK;

  return (
    <div className="my-1">
      <PromotionModal
        open={promotionPick !== null}
        color={promotionColor}
        onSelect={handlePromotionSelect}
      />
      <div className="grid h-[640px] w-[640px] max-w-full grid-cols-8 grid-rows-8 border-2 border-slate-900 shadow-xl">
        {displaySquares.map((square) => {
          const sqColor = chess.squareColor(square);
          const isLight = sqColor === "light";
          const piece = chess.get(square);
          const Logo = piece ? pieceLogo(piece.type, piece.color) : null;
          const { fileIndex, rankNumber } = parseSquareCoords(square);
          const selected = square === selectedSquare;
          const hint = legalTargets.has(square);
          const cap = hint && chess.get(square) != null;

          return (
            <SquareCell
              key={square}
              fileIndex={fileIndex}
              rankNumber={rankNumber}
              isLightSquare={isLight}
              Logo={Logo}
              selected={selected}
              kingInCheck={checkSquare !== null && square === checkSquare}
              lastMoveRole={lastMoveRoleForSquare(square)}
              showMoveHint={hint}
              isCaptureHint={cap}
              onClick={() => onSquareClick(square)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default BoardComponent;
