import { Board } from "../models/Board";
import { Fragment, useState, useLayoutEffect, useRef } from "react";
import CellComponent from "./CellComponent";
import PromotionModal, { type PromotionChoice } from "./PromotionModal";
import { Cell } from "../models/Cell";
import { Player } from "../models/Player";
import { GameStatus } from "../models/GameStatus";
import { Colors } from "../models/Colors";
import { FigureNames } from "../models/figures/Figure";
import type { BoardMoveSquares } from "../utils/fen";
import { uciFromSquares } from "../utils/fen";
import {
  appendCheckSuffix,
  buildPromotionSanBase,
  buildSanBase,
  promotionPieceLetter,
} from "../utils/san";

type LastMove = BoardMoveSquares;

function lastMoveRoleForCell(cell: Cell, lastMove: LastMove | null): "from" | "to" | null {
  if (!lastMove) return null;

  if (cell.x === lastMove.from.x && cell.y === lastMove.from.y) return "from";

  if (cell.x === lastMove.to.x && cell.y === lastMove.to.y) return "to";

  return null;
}

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  gameStatus: GameStatus;
  checkKingCell: Cell | null;
  onMovePlayed?: (san: string) => void;
  onMoveUci?: (uci: string) => void;
  inputLocked?: boolean;
  lastMoveHighlight?: LastMove | null;
  onLastMoveHighlight?: (move: LastMove | null) => void;
  /** When BLACK, the board is rotated so that black's pieces are toward the bottom edge. */
  viewFromColor?: Colors;
}

function promotionLetter(piece: PromotionChoice): "q" | "r" | "b" | "n" {
  switch (piece) {
    case FigureNames.QUEEN:
      return "q";
    case FigureNames.ROOK:
      return "r";
    case FigureNames.BISHOP:
      return "b";
    case FigureNames.KNIGHT:
      return "n";
  }
}

function BoardComponent({
  board,
  setBoard,
  swapPlayer,
  currentPlayer,
  gameStatus,
  checkKingCell,
  onMovePlayed,
  onMoveUci,
  inputLocked = false,
  lastMoveHighlight,
  onLastMoveHighlight,
  viewFromColor = Colors.WHITE,
}: BoardProps) {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [internalLastMove, setInternalLastMove] = useState<LastMove | null>(null);
  const promotionFromRef = useRef<{ x: number; y: number } | null>(null);

  const controlledHighlight = onLastMoveHighlight !== undefined;
  const displayLastMove = controlledHighlight ? (lastMoveHighlight ?? null) : internalLastMove;

  function setLastMoveDisplay(move: LastMove | null) {
    if (controlledHighlight) {
      onLastMoveHighlight?.(move);
    } else {
      setInternalLastMove(move);
    }
  }

  function selectFigure(cell: Cell) {
    if (inputLocked) return;
    if (gameStatus !== GameStatus.ACTIVE) return;
    if (board.pendingPromotion) return;

    if (
      selectedCell &&
      selectedCell !== cell &&
      board.canMoveConsideringCheck(selectedCell, cell, currentPlayer?.color ?? null)
    ) {
      const from = selectedCell;
      const moverColor = currentPlayer!.color;
      const baseSan = buildSanBase(board, from, cell, moverColor);
      from.moveFigure(cell);
      setSelectedCell(null);
      if (board.pendingPromotion) {
        promotionFromRef.current = { x: from.x, y: from.y };
        board.hightlightCells(null, currentPlayer?.color ?? null);
        updateBoard();
        return;
      }
      const san = baseSan + appendCheckSuffix(board, moverColor);
      setLastMoveDisplay({ from: { x: from.x, y: from.y }, to: { x: cell.x, y: cell.y } });
      onMoveUci?.(uciFromSquares({ x: from.x, y: from.y }, { x: cell.x, y: cell.y }));
      onMovePlayed?.(san);
      swapPlayer();
      updateBoard();
    } else if (selectedCell === cell) {
      board.hightlightCells(null, currentPlayer?.color ?? null);
      updateBoard();
      setSelectedCell(null);
    } else if (cell.figure) {
      if (cell.figure.color === currentPlayer?.color) {
        board.hightlightCells(cell, currentPlayer?.color ?? null);
        updateBoard();
        setSelectedCell(cell);
      }
    }
  }

  useLayoutEffect(() => {
    hightlightCells();
  }, [selectedCell]);

  function hightlightCells() {
    board.hightlightCells(selectedCell, currentPlayer?.color ?? null);
    updateBoard();
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  function handlePromotionSelect(piece: PromotionChoice) {
    if (inputLocked) return;
    const fromCoords = promotionFromRef.current;
    const to = board.pendingPromotion;
    if (!fromCoords || !to) return;
    const moverColor =
      board.getCell(to.x, to.y).figure?.color ?? currentPlayer?.color ?? Colors.WHITE;
    const base = buildPromotionSanBase(fromCoords, to) + "=" + promotionPieceLetter(piece);
    board.completePromotion(piece);
    const san = base + appendCheckSuffix(board, moverColor);
    promotionFromRef.current = null;
    board.hightlightCells(null, currentPlayer?.color ?? null);
    setLastMoveDisplay({ from: { x: fromCoords.x, y: fromCoords.y }, to: { x: to.x, y: to.y } });
    onMoveUci?.(uciFromSquares(fromCoords, to, promotionLetter(piece)));
    onMovePlayed?.(san);
    swapPlayer();
    updateBoard();
  }

  const promotionColor =
    board.pendingPromotion !== null
      ? (board.getCell(board.pendingPromotion.x, board.pendingPromotion.y).figure?.color ?? Colors.WHITE)
      : Colors.WHITE;

  const rowOrder =
    viewFromColor === Colors.BLACK ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colOrder =
    viewFromColor === Colors.BLACK ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="my-1">
      <PromotionModal
        open={board.pendingPromotion !== null}
        color={promotionColor}
        onSelect={handlePromotionSelect}
      />
      <div className="grid h-[640px] w-[640px] max-w-full grid-cols-8 grid-rows-8 border-2 border-slate-900 shadow-xl">
        {rowOrder.map((yi) => (
          <Fragment key={yi}>
            {colOrder.map((xi) => {
              const cell = board.getCell(xi, yi);
              return (
                <CellComponent
                  cell={cell}
                  key={cell.id}
                  selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                  kingInCheck={
                    checkKingCell !== null && cell.x === checkKingCell.x && cell.y === checkKingCell.y
                  }
                  lastMoveRole={lastMoveRoleForCell(cell, displayLastMove)}
                  selectFigure={selectFigure}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default BoardComponent;
