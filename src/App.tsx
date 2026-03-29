import "./App.css";
import BoardComponent from "./components/BoardComponent";
import GameOverModal from "./components/GameOverModal";
import { Board } from "./models/Board";
import { useState, useEffect } from "react";
import { Colors } from "./models/Colors";
import { Player } from "./models/Player";
import Timer from "./components/Timer";
import { GameStatus } from "./models/GameStatus";
import { getGameOverModalCopy } from "./utils/getGameOverModalCopy";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

function App() {
  const [board, setBoard] = useState(new Board());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  // the timer is not started until the first move is made
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);

  function initBoard() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(PLAYER_WHITE);
  }

  function restart() {
    initBoard();
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
    setGameOverDismissed(false);
  }

  useEffect(() => {
    initBoard();
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.ACTIVE) {
      setGameOverDismissed(false);
    }
  }, [gameStatus]);

  function swapPlayer() {
    setClocksStarted(true);
    const nextPlayer = currentPlayer?.color === Colors.WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    setCurrentPlayer(nextPlayer);

    // Check for checkmate or stalemate
    if (board.isCheckmate(nextPlayer.color)) {
      setGameStatus(nextPlayer.color === Colors.WHITE ? GameStatus.CHECKMATE_WHITE : GameStatus.CHECKMATE_BLACK);
    } else if (board.isStalemate(nextPlayer.color)) {
      setGameStatus(GameStatus.STALEMATE);
    }
  }

  const isCheck = currentPlayer ? board.isKingInCheck(currentPlayer.color) : false;
  const checkKingCell =
    gameStatus === GameStatus.ACTIVE && isCheck && currentPlayer
      ? board.getKingCell(currentPlayer.color)
      : null;

  const gameOverCopy = getGameOverModalCopy(gameStatus);

  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
        {gameOverCopy && (
          <GameOverModal
            open={!gameOverDismissed}
            onOpenChange={(open) => {
              if (!open) setGameOverDismissed(true);
            }}
            copy={gameOverCopy}
            onRematch={restart}
          />
        )}
        <Timer
          currentPlayer={currentPlayer}
          whitePlayer={PLAYER_WHITE}
          blackPlayer={PLAYER_BLACK}
          restart={restart}
          clocksStarted={clocksStarted}
          gameStatus={gameStatus}
          capturedByWhite={board.lostBlackFigures}
          capturedByBlack={board.lostWhiteFigures}
        >
          <BoardComponent
            board={board}
            setBoard={setBoard}
            currentPlayer={currentPlayer}
            swapPlayer={swapPlayer}
            gameStatus={gameStatus}
            checkKingCell={checkKingCell}
          />
        </Timer>
      </div>
    </div>
  );
}

export default App;
