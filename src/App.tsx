import "./App.css";
import BoardComponent from "./components/BoardComponent";
import { Board } from "./models/Board";
import { useState, useEffect } from "react";
import { Colors } from "./models/Colors";
import { Player } from "./models/Player";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";
import { GameStatus } from "./models/GameStatus";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

function App() {
  const [board, setBoard] = useState(new Board());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);

  useEffect(() => {
    restart();
    setCurrentPlayer(PLAYER_WHITE);
  }, []);

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(PLAYER_WHITE);
    setGameStatus(GameStatus.ACTIVE);
  }

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

  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
        {gameStatus === GameStatus.ACTIVE && isCheck && (
          <div className="mb-3 text-center text-xl font-bold text-yellow-500">
            Check! Current side under attack.
          </div>
        )}
        {gameStatus !== GameStatus.ACTIVE && (
          <div className="mb-3 text-center text-xl font-bold text-red-500">
            {gameStatus === GameStatus.CHECKMATE_WHITE && "Checkmate! White side lost."}
            {gameStatus === GameStatus.CHECKMATE_BLACK && "Checkmate! Black side lost."}
            {gameStatus === GameStatus.STALEMATE && "Stalemate! Draw."}
          </div>
        )}
        <Timer
          currentPlayer={currentPlayer}
          whitePlayer={PLAYER_WHITE}
          blackPlayer={PLAYER_BLACK}
          restart={restart}
          gameStatus={gameStatus}
        >
          <BoardComponent
            board={board}
            setBoard={setBoard}
            currentPlayer={currentPlayer}
            swapPlayer={swapPlayer}
            gameStatus={gameStatus}
          />
        </Timer>
        <div className="mt-6 flex flex-wrap justify-center gap-8">
          <LostFigures figures={board.lostBlackFigures} title="black" />
          <LostFigures figures={board.lostWhiteFigures} title="white" />
        </div>
      </div>
    </div>
  );
}

export default App;
