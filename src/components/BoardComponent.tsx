import { Board } from "../models/Board";
import { Fragment, useState, useLayoutEffect } from "react";
import CellComponent from "./CellComponent";
import PromotionModal, { type PromotionChoice } from "./PromotionModal";
import { Cell } from "../models/Cell";
import { Player } from "../models/Player";
import { GameStatus } from "../models/GameStatus";
import { Colors } from "../models/Colors";
interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  gameStatus: GameStatus;
}

function BoardComponent({ board, setBoard, swapPlayer, currentPlayer, gameStatus }: BoardProps) {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  function selectFigure(cell: Cell) {
    if (gameStatus !== GameStatus.ACTIVE) return;
    if (board.pendingPromotion) return;

    if (
      selectedCell &&
      selectedCell !== cell &&
      board.canMoveConsideringCheck(selectedCell, cell, currentPlayer?.color ?? null)
    ) {
      selectedCell.moveFigure(cell);
      setSelectedCell(null);
      if (board.pendingPromotion) {
        board.hightlightCells(null, currentPlayer?.color ?? null);
        updateBoard();
        return;
      }
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
    board.completePromotion(piece);
    board.hightlightCells(null, currentPlayer?.color ?? null);
    updateBoard();
    swapPlayer();
  }

  const promotionColor =
    board.pendingPromotion !== null
      ? (board.getCell(board.pendingPromotion.x, board.pendingPromotion.y).figure?.color ?? Colors.WHITE)
      : Colors.WHITE;

  return (
    <div className="my-1">
      <PromotionModal
        open={board.pendingPromotion !== null}
        color={promotionColor}
        onSelect={handlePromotionSelect}
      />
      <div className="grid h-[640px] w-[640px] max-w-full grid-cols-8 grid-rows-8 border-2 border-slate-900 shadow-xl">
        {board.cells.map((row, index) => (
          <Fragment key={index}>
            {row.map((cell) => (
              <CellComponent
                cell={cell}
                key={cell.id}
                selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                selectFigure={selectFigure}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default BoardComponent;
