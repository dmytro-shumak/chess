import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import { Chess, WHITE, type Move } from "chess.js";
import { useState, useCallback } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import Timer from "./Timer";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { activeCheckSquare } from "../chess/activeCheckSquare";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { useCapturedPieces } from "../hooks/useCapturedPieces";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

export default function LocalChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [clocksStarted, setClocksStarted] = useState(false);
  const { capturedByWhite, capturedByBlack, reset: resetCaptures, appendFromMove } = useCapturedPieces();
  const { gameOverModalReady, gameOverDismissed, setGameOverDismissed } = useDelayedGameOverModal(gameStatus);

  useGameStatusFromChess(chess, setGameStatus, { preserveTimeouts: true });

  function initBoard() {
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    resetCaptures();
  }

  const handleBoardMove = useCallback(
    ({ san, move }: { san: string; uci: string; move: Move }) => {
      setMovePlies((prev) => [...prev, san]);
      appendFromMove(move);
    },
    [appendFromMove],
  );

  function restart() {
    initBoard();
    setBoardResetKey((k) => k + 1);
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
  }

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  function swapPlayer() {
    setClocksStarted(true);
    setCurrentPlayer(chess.turn() === WHITE ? PLAYER_WHITE : PLAYER_BLACK);
  }

  const checkSquare = activeCheckSquare(chess, gameStatus);
  const gameOverCopy = getGameOverModalCopy(gameStatus);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
      {gameOverCopy && (
        <GameOverModal
          open={gameOverModalReady && !gameOverDismissed}
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
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        movePlies={movePlies}
      >
        <BoardComponent
          key={boardResetKey}
          chess={chess}
          setChess={setChess}
          turnPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameStatus={gameStatus}
          checkSquare={checkSquare}
          onMove={handleBoardMove}
        />
      </Timer>
    </div>
  );
}
