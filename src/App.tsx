import "./App.css";
import BoardComponent from "./components/BoardComponent";
import GameOverModal from "./components/GameOverModal";
import { Board, FIFTY_MOVE_HALF_MOVE_LIMIT } from "./models/Board";
import { useState, useEffect, useRef, useCallback } from "react";
import { Colors } from "./models/Colors";
import { Player } from "./models/Player";
import Timer from "./components/Timer";
import { GameStatus } from "./models/GameStatus";
import { getGameOverModalCopy } from "./utils/getGameOverModalCopy";
import { buildRepetitionKey } from "./utils/positionRepetition";
import { isInsufficientMaterial } from "./utils/insufficientMaterial";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

function App() {
  const [board, setBoard] = useState(new Board());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  // the timer is not started until the first move is made
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const repetitionCounts = useRef(new Map<string, number>());

  function seedStartingPosition(board: Board) {
    repetitionCounts.current.clear();
    repetitionCounts.current.set(buildRepetitionKey(board, Colors.WHITE), 1);
  }

  function initBoard() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    seedStartingPosition(newBoard);
  }

  const handleMovePlayed = useCallback((san: string) => {
    setMovePlies((prev) => [...prev, san]);
  }, []);

  function restart() {
    initBoard();
    setBoardResetKey((k) => k + 1);
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

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  function swapPlayer() {
    setClocksStarted(true);
    const nextPlayer = currentPlayer?.color === Colors.WHITE ? PLAYER_BLACK : PLAYER_WHITE;

    const key = buildRepetitionKey(board, nextPlayer.color);
    const nextCount = (repetitionCounts.current.get(key) ?? 0) + 1;
    repetitionCounts.current.set(key, nextCount);

    setCurrentPlayer(nextPlayer);

    if (board.isCheckmate(nextPlayer.color)) {
      setGameStatus(nextPlayer.color === Colors.WHITE ? GameStatus.CHECKMATE_WHITE : GameStatus.CHECKMATE_BLACK);
      return;
    }
    if (board.isStalemate(nextPlayer.color)) {
      setGameStatus(GameStatus.STALEMATE);
      return;
    }
    if (isInsufficientMaterial(board)) {
      setGameStatus(GameStatus.INSUFFICIENT_MATERIAL);
      return;
    }
    if (board.halfMoveClock >= FIFTY_MOVE_HALF_MOVE_LIMIT) {
      setGameStatus(GameStatus.FIFTY_MOVE_DRAW);
      return;
    }
    if (nextCount >= 3) {
      setGameStatus(GameStatus.THREEFOLD_REPETITION);
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
          onOutOfTime={handleOutOfTime}
          capturedByWhite={board.lostBlackFigures}
          capturedByBlack={board.lostWhiteFigures}
          movePlies={movePlies}
        >
          <BoardComponent
            key={boardResetKey}
            board={board}
            setBoard={setBoard}
            currentPlayer={currentPlayer}
            swapPlayer={swapPlayer}
            gameStatus={gameStatus}
            checkKingCell={checkKingCell}
            onMovePlayed={handleMovePlayed}
          />
        </Timer>
      </div>
    </div>
  );
}

export default App;
