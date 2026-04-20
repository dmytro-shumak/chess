import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import { StockfishClient } from "../engine/stockfishClient";
import { DEFAULT_ENGINE_PRESET_ID, ENGINE_PRESETS, type EnginePreset } from "../engine/enginePresets";
import { Board, newBoardWithStartingPosition } from "../models/Board";
import { useState, useEffect, useRef, useCallback } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import Timer from "./Timer";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { buildRepetitionKey } from "../utils/positionRepetition";
import { outcomeAfterMove } from "../game/outcomeAfterMove";
import { boardToFen, parseUciToBoardSquares, type BoardMoveSquares } from "../utils/fen";
import { sanForAppliedUci } from "../utils/san";

const PLAYER_WHITE = new Player(Colors.WHITE, "You");
const PLAYER_BLACK = new Player(Colors.BLACK, "Stockfish");

const GAME_OVER_MODAL_DELAY_MS = 500;

function fullMoveNumberFromPlyCount(plies: number): number {
  return 1 + Math.floor(plies / 2);
}

export default function VsComputerChessGame() {
  const [board, setBoard] = useState(() => newBoardWithStartingPosition());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const [presetId, setPresetId] = useState<string>(DEFAULT_ENGINE_PRESET_ID);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<BoardMoveSquares | null>(null);
  const repetitionCounts = useRef(new Map<string, number>());
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stockfishRef = useRef<StockfishClient | null>(null);
  const boardRef = useRef(board);
  const searchGeneration = useRef(0);

  boardRef.current = board;

  const preset: EnginePreset =
    ENGINE_PRESETS.find((p) => p.id === presetId) ?? ENGINE_PRESETS[1];

  function seedStartingPosition(b: Board) {
    repetitionCounts.current.clear();
    repetitionCounts.current.set(buildRepetitionKey(b, Colors.WHITE), 1);
  }

  function initBoard() {
    const newBoard = newBoardWithStartingPosition();
    setBoard(newBoard);
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    setLastMoveHighlight(null);
    seedStartingPosition(newBoard);
  }

  const handleMovePlayed = useCallback((san: string) => {
    setMovePlies((prev) => [...prev, san]);
  }, []);

  function restart() {
    stockfishRef.current?.stop();
    initBoard();
    setBoardResetKey((k) => k + 1);
    setGameStatus(GameStatus.ACTIVE);
    setGameOverDismissed(false);
    searchGeneration.current += 1;
  }

  useEffect(() => {
    initBoard();
    const client = new StockfishClient();
    stockfishRef.current = client;
    return () => {
      searchGeneration.current += 1;
      client.dispose();
      stockfishRef.current = null;
    };
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

  function swapPlayer() {
    const nextPlayer = currentPlayer?.color === Colors.WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    setCurrentPlayer(nextPlayer);
    const status = outcomeAfterMove(board, nextPlayer.color, repetitionCounts.current);
    if (status !== GameStatus.ACTIVE) {
      setGameStatus(status);
    }
  }

  useEffect(() => {
    if (gameStatus !== GameStatus.ACTIVE || currentPlayer?.color !== Colors.BLACK) return;
    const client = stockfishRef.current;
    if (!client) return;

    const gen = ++searchGeneration.current;
    let cancelled = false;

    void (async () => {
      try {
        const b = boardRef.current;
        const fen = boardToFen(b, Colors.BLACK, fullMoveNumberFromPlyCount(movePlies.length));
        const uci = await client.goBestMove(fen, { movetime: preset.movetime, depth: preset.depth });
        if (cancelled || gen !== searchGeneration.current) return;
        const squares = parseUciToBoardSquares(uci);
        const sanBlack = sanForAppliedUci(b, uci, Colors.BLACK);
        if (!sanBlack) {
          return;
        }
        if (squares) setLastMoveHighlight(squares);
        setBoard(b.getCopyBoard());
        setMovePlies((prev) => [...prev, sanBlack]);
        setCurrentPlayer(PLAYER_WHITE);
        const nextStatus = outcomeAfterMove(b, Colors.WHITE, repetitionCounts.current);
        if (nextStatus !== GameStatus.ACTIVE) {
          setGameStatus(nextStatus);
        }
      } catch (error) {
        console.error("Error searching for best move:", error);
      }
    })();

    return () => {
      cancelled = true;
      client.stop();
    };
  }, [currentPlayer?.color, gameStatus, movePlies.length, preset.movetime, preset.depth]);

  const isCheck = currentPlayer ? board.isKingInCheck(currentPlayer.color) : false;
  const checkKingCell =
    gameStatus === GameStatus.ACTIVE && isCheck && currentPlayer
      ? board.getKingCell(currentPlayer.color)
      : null;

  const gameOverCopy = getGameOverModalCopy(gameStatus);
  const inputLocked = currentPlayer?.color === Colors.BLACK;

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
        clocksStarted={false}
        gameStatus={gameStatus}
        onOutOfTime={() => {}}
        capturedByWhite={board.lostBlackFigures}
        capturedByBlack={board.lostWhiteFigures}
        movePlies={movePlies}
        clocked={false}
        sidePanelFooter={
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
              Engine strength
            </span>
            <select
              className="ui-engine-select"
              value={presetId}
              disabled={movePlies.length > 0}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {ENGINE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        }
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
          inputLocked={inputLocked}
          lastMoveHighlight={lastMoveHighlight}
          onLastMoveHighlight={setLastMoveHighlight}
        />
      </Timer>
    </div>
  );
}
