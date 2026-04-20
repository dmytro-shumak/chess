import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import { Chess, WHITE, type Move } from "chess.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import Timer from "./Timer";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { gameStatusFromChess } from "../chess/gameStatusFromChess";
import { kingSquareForColor } from "../chess/kingSquare";
import {
  capturedDisplayFromMove,
  resetCapturedDisplayKeyCounter,
  type CapturedDisplay,
} from "../chess/capturedFromMove";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

const GAME_OVER_MODAL_DELAY_MS = 500;

export default function LocalChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [capturedByWhite, setCapturedByWhite] = useState<CapturedDisplay[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<CapturedDisplay[]>([]);
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function initBoard() {
    resetCapturedDisplayKeyCounter();
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }

  const handleBoardMove = useCallback(
    ({ san, move }: { san: string; uci: string; move: Move }) => {
      setMovePlies((prev) => [...prev, san]);
      const cap = capturedDisplayFromMove(move);
      if (cap) {
        if (move.color === WHITE) setCapturedByWhite((prev) => [...prev, cap]);
        else setCapturedByBlack((prev) => [...prev, cap]);
      }
    },
    [],
  );

  function restart() {
    initBoard();
    setBoardResetKey((k) => k + 1);
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
    setGameOverDismissed(false);
  }

  useEffect(() => {
    if (gameStatus === GameStatus.ACTIVE) {
      setGameOverDismissed(false);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameOverModalDelayRef.current) {
      clearTimeout(gameOverModalDelayRef.current);
      gameOverModalDelayRef.current = null;
    }

    if (gameStatus === GameStatus.ACTIVE) {
      setGameOverModalReady(false);
      return;
    }

    setGameOverModalReady(false);
    gameOverModalDelayRef.current = setTimeout(() => {
      gameOverModalDelayRef.current = null;
      setGameOverModalReady(true);
    }, GAME_OVER_MODAL_DELAY_MS);

    return () => {
      if (gameOverModalDelayRef.current) {
        clearTimeout(gameOverModalDelayRef.current);
        gameOverModalDelayRef.current = null;
      }
    };
  }, [gameStatus]);

  useEffect(() => {
    setGameStatus((prev) => {
      if (prev === GameStatus.TIMEOUT_WHITE || prev === GameStatus.TIMEOUT_BLACK) return prev;
      return gameStatusFromChess(chess);
    });
  }, [chess]);

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  function swapPlayer() {
    setClocksStarted(true);
    setCurrentPlayer(chess.turn() === WHITE ? PLAYER_WHITE : PLAYER_BLACK);
  }

  const checkSquare =
    gameStatus === GameStatus.ACTIVE && chess.inCheck()
      ? kingSquareForColor(chess, chess.turn())
      : null;

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
