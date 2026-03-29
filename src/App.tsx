import "./App.css";
import BoardComponent from "./components/BoardComponent";
import { Board } from "./models/Board";
import { useState, useEffect } from "react";
import { Colors } from "./models/Colors";
import { Player } from "./models/Player";
import Timer from "./components/Timer";
import { GameStatus } from "./models/GameStatus";
import { getGameOverMessage } from "./utils/getGameOverMessage";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

function App() {
  const [board, setBoard] = useState(new Board());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.NOT_STARTED);

  function initBoard() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(PLAYER_WHITE);
  }

  function startGame() {
    setGameStatus(GameStatus.ACTIVE);
  }

  function restart() {
    initBoard();
    setGameStatus(GameStatus.ACTIVE);
  }

  useEffect(() => {
    initBoard();
  }, []);

  function swapPlayer() {
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

  const gameOverMessage = getGameOverMessage(gameStatus);

  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
        {gameStatus === GameStatus.ACTIVE && isCheck && (
          <div className="mb-3 text-center text-xl font-bold text-yellow-500">
            Check! Current side under attack.
          </div>
        )}
        {gameOverMessage && (
          <div className="mb-3 text-center text-xl font-bold text-red-500">{gameOverMessage}</div>
        )}
        <Timer
          currentPlayer={currentPlayer}
          whitePlayer={PLAYER_WHITE}
          blackPlayer={PLAYER_BLACK}
          restart={restart}
          startGame={startGame}
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
          />
        </Timer>
      </div>
    </div> 
  );
}

export default App;
