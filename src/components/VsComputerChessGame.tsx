import { Chess, type Move, WHITE } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { activeCheckSquare } from "../chess/activeCheckSquare";
import type { SquareHighlight } from "../chess/types";
import { applyStockfishBestMove } from "../engine/applyStockfishMove";
import {
  DEFAULT_ENGINE_PRESET_ID,
  ENGINE_PRESETS,
  type EnginePreset,
} from "../engine/enginePresets";
import { StockfishClient } from "../engine/stockfishClient";
import { useCapturedPieces } from "../hooks/useCapturedPieces";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import { Player } from "../models/Player";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import Timer from "./Timer";

const PLAYER_WHITE = new Player(Colors.WHITE, "You");
const PLAYER_BLACK = new Player(Colors.BLACK, "Stockfish");

export default function VsComputerChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [presetId, setPresetId] = useState<string>(DEFAULT_ENGINE_PRESET_ID);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<SquareHighlight | null>(null);
  const {
    capturedByWhite,
    capturedByBlack,
    reset: resetCaptures,
    appendFromMove,
  } = useCapturedPieces();
  const stockfishRef = useRef<StockfishClient | null>(null);
  const chessRef = useRef(chess);
  const searchGeneration = useRef(0);

  const { gameOverModalReady, gameOverDismissed, setGameOverDismissed } =
    useDelayedGameOverModal(gameStatus);

  useGameStatusFromChess(chess, setGameStatus, { preserveTimeouts: false });

  chessRef.current = chess;

  const preset: EnginePreset = ENGINE_PRESETS.find((p) => p.id === presetId) ?? ENGINE_PRESETS[1];

  const initBoard = useCallback(() => {
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    setLastMoveHighlight(null);
    resetCaptures();
  }, [resetCaptures]);

  const handleBoardMove = useCallback(
    ({ san, move }: { san: string; uci: string; move: Move }) => {
      setMovePlies((prev) => [...prev, san]);
      appendFromMove(move);
    },
    [appendFromMove],
  );

  function restart() {
    stockfishRef.current?.stop();
    initBoard();
    setBoardResetKey((k) => k + 1);
    setGameStatus(GameStatus.ACTIVE);
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
  }, [initBoard]);

  function swapPlayer() {
    setCurrentPlayer(chess.turn() === WHITE ? PLAYER_WHITE : PLAYER_BLACK);
  }

  useEffect(() => {
    if (gameStatus !== GameStatus.ACTIVE || currentPlayer?.color !== Colors.BLACK) return;
    const client = stockfishRef.current;
    if (!client) return;

    const gen = ++searchGeneration.current;
    let cancelled = false;

    void (async () => {
      try {
        const base = chessRef.current;
        const result = await applyStockfishBestMove(client, base.fen(), preset);
        if (cancelled || gen !== searchGeneration.current || !result) return;
        setChess(() => new Chess(result.nextFen));
        setLastMoveHighlight(result.highlight);
        setMovePlies((prev) => [...prev, result.san]);
        setCurrentPlayer(PLAYER_WHITE);
        appendFromMove(result.move);
      } catch (error) {
        console.error("Error searching for best move:", error);
      }
    })();

    return () => {
      cancelled = true;
      client.stop();
    };
  }, [currentPlayer?.color, gameStatus, preset, appendFromMove]);

  const checkSquare = activeCheckSquare(chess, gameStatus);
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
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
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
          chess={chess}
          setChess={setChess}
          turnPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameStatus={gameStatus}
          checkSquare={checkSquare}
          onMove={handleBoardMove}
          inputLocked={inputLocked}
          lastMoveHighlight={lastMoveHighlight}
          onLastMoveHighlight={setLastMoveHighlight}
        />
      </Timer>
    </div>
  );
}
