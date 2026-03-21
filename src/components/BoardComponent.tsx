import { Board } from "../models/Board";
import { Fragment, useState, useLayoutEffect } from "react";
import CellComponent from "./CellComponent";
import { Cell } from "../models/Cell";
import { Player } from "../models/Player";
import { GameStatus } from "../models/GameStatus";
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
    if (gameStatus !== GameStatus.ACTIVE) return; // Block moves if game over
    if (
      selectedCell &&
      selectedCell !== cell &&
      board.canMoveConsideringCheck(selectedCell, cell, currentPlayer?.color ?? null)
    ) {
      selectedCell.moveFigure(cell);
      swapPlayer();
      setSelectedCell(null);
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

  return (
    <div>
      <h3 className="text-center mb-5 text-2xl font-bold">
        Current player is {currentPlayer?.color}
      </h3>
      <div className="grid grid-cols-8 grid-rows-8 w-[640px] h-[640px] border-2 border-slate-900 shadow-xl">
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
