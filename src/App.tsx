import "./App.css";
import BoardComponent from "./components/BoardComponent";
import { Board } from "./models/Board";
import { useState, useEffect } from "react";
import { Colors } from "./models/Colors";
import { Player } from "./models/Player";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";
import { GameStatus } from "./models/GameStatus";
function App() {
  const [board, setBoard] = useState(new Board());
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);

  useEffect(() => {
    restart();
    setCurrentPlayer(whitePlayer);
  }, []);

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(whitePlayer);
    setGameStatus(GameStatus.ACTIVE);
  }

  function swapPlayer() {
    const nextPlayer = currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer;
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center box-border p-4">
      <div className="max-w-7xl mx-auto p-4">
        <Timer currentPlayer={currentPlayer} restart={restart} />
        {gameStatus === GameStatus.ACTIVE && isCheck && (
          <div className="text-center text-xl font-bold text-yellow-500 mb-4">
            Check! Current side under attack.
          </div>
        )}
        {gameStatus !== GameStatus.ACTIVE && (
          <div className="text-center text-xl font-bold text-red-600 mb-4">
            {gameStatus === GameStatus.CHECKMATE_WHITE && "Checkmate! White side lost."}
            {gameStatus === GameStatus.CHECKMATE_BLACK && "Checkmate! Black side lost."}
            {gameStatus === GameStatus.STALEMATE && "Stalemate! Draw."}
          </div>
        )}
      </div>
      <BoardComponent
        board={board}
        setBoard={setBoard}
        currentPlayer={currentPlayer}
        swapPlayer={swapPlayer}
        gameStatus={gameStatus}
      />
      <div>
        <LostFigures figures={board.lostBlackFigures} title="black" />
        <LostFigures figures={board.lostWhiteFigures} title="white" />
      </div>
    </div>
  );
}

export default App;
