import { Chess, type Move, WHITE } from "chess.js";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Colors } from "../constants/chess/colors";
import { GameStatus } from "../constants/chess/gameStatus";
import { useCapturedPieces } from "../hooks/useCapturedPieces";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { ROUTES } from "../routes";
import type { Player } from "../types/chess/player";
import { activeCheckSquare } from "../utils/chess/activeCheckSquare";
import { getGameOverModalText } from "../utils/getGameOverModalText";
import BoardComponent from "./BoardComponent";
import ChessGameLayout from "./ChessGameLayout";
import GameOverModal from "./GameOverModal";

const PLAYER_WHITE: Player = { color: Colors.WHITE, name: "White" };
const PLAYER_BLACK: Player = { color: Colors.BLACK, name: "Black" };

export default function LocalChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  // SAN list per ply for side panel move history.
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [clocksStarted, setClocksStarted] = useState(false);
  const {
    capturedByWhite,
    capturedByBlack,
    reset: resetCaptures,
    appendFromMove,
  } = useCapturedPieces();
  const { gameOverModalReady, gameOverDismissed, setGameOverDismissed } =
    useDelayedGameOverModal(gameStatus);

  useGameStatusFromChess(chess, setGameStatus, { preserveTimeouts: true });

  function initBoard() {
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    resetCaptures();
  }

  // After a legal move on the board append SAN to history
  const handleBoardMove = useCallback(
    (move: Move) => {
      setMovePlies((prev) => [...prev, move.san]);
      appendFromMove(move);
    },
    [appendFromMove],
  );

  function restart() {
    initBoard();
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
  const gameOverText = getGameOverModalText(gameStatus);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
      {gameOverText && (
        <GameOverModal
          open={gameOverModalReady && !gameOverDismissed}
          onOpenChange={(open) => {
            if (!open) setGameOverDismissed(true);
          }}
          text={gameOverText}
          onRematch={restart}
        />
      )}
      <ChessGameLayout
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
        navColumn={
          <Link to={ROUTES.home} className="text-sm font-medium text-sky-800 hover:underline">
            ← Home
          </Link>
        }
      >
        <BoardComponent
          chess={chess}
          setChess={setChess}
          turnPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameStatus={gameStatus}
          checkSquare={checkSquare}
          onMove={handleBoardMove}
        />
      </ChessGameLayout>
    </div>
  );
}
