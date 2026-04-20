import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import { Board, newBoardWithStartingPosition } from "../models/Board";
import { useState, useEffect, useRef, useCallback } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import Timer from "./Timer";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { buildRepetitionKey } from "../utils/positionRepetition";
import { outcomeAfterMove } from "../game/outcomeAfterMove";

const PLAYER_WHITE = new Player(Colors.WHITE, "White");
const PLAYER_BLACK = new Player(Colors.BLACK, "Black");

const GAME_OVER_MODAL_DELAY_MS = 500;

export default function LocalChessGame() {
  const [board, setBoard] = useState(() => newBoardWithStartingPosition());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  // the timer is not started until the first move is made
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const repetitionCounts = useRef(new Map<string, number>());
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function seedStartingPosition(board: Board) {
    repetitionCounts.current.clear();
    repetitionCounts.current.set(buildRepetitionKey(board, Colors.WHITE), 1);
  }

  function initBoard() {
    const newBoard = newBoardWithStartingPosition();
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

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  function swapPlayer() {
    setClocksStarted(true);
    const nextPlayer = currentPlayer?.color === Colors.WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    setCurrentPlayer(nextPlayer);
    const status = outcomeAfterMove(board, nextPlayer.color, repetitionCounts.current);
    if (status !== GameStatus.ACTIVE) {
      setGameStatus(status);
    }
  }

  const isCheck = currentPlayer ? board.isKingInCheck(currentPlayer.color) : false;
  const checkKingCell =
    gameStatus === GameStatus.ACTIVE && isCheck && currentPlayer
      ? board.getKingCell(currentPlayer.color)
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
  );
}
