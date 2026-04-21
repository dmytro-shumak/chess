import { Chess, type Move, WHITE } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Colors } from "../constants/chess/colors";
import { GameStatus } from "../constants/chess/gameStatus";
import { applyStockfishBestMove } from "../engine/applyStockfishMove";
import { DEFAULT_ENGINE_PRESET, ENGINE_PRESETS, type EnginePreset } from "../engine/enginePresets";
import { StockfishClient } from "../engine/stockfishClient";
import { useCapturedPieces } from "../hooks/useCapturedPieces";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { ROUTES } from "../routes";
import type { Player } from "../types/chess/player";
import type { SquareHighlight } from "../types/chess/squareHighlight";
import { activeCheckSquare } from "../utils/chess/activeCheckSquare";
import { getGameOverModalText } from "../utils/getGameOverModalText";
import BoardComponent from "./BoardComponent";
import ChessGameLayout from "./ChessGameLayout";
import GameOverModal from "./GameOverModal";

const PLAYER_WHITE: Player = { color: Colors.WHITE, name: "You" };
const PLAYER_BLACK: Player = { color: Colors.BLACK, name: "Stockfish" };

export default function VsComputerChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [presetId, setPresetId] = useState<string>(DEFAULT_ENGINE_PRESET.id);
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

  const preset: EnginePreset =
    ENGINE_PRESETS.find((p) => p.id === presetId) ?? DEFAULT_ENGINE_PRESET;

  const initBoard = useCallback(() => {
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    setLastMoveHighlight(null);
    resetCaptures();
  }, [resetCaptures]);

  const handleBoardMove = useCallback(
    (move: Move) => {
      setMovePlies((prev) => [...prev, move.san]);
      appendFromMove(move);
    },
    [appendFromMove],
  );

  function restart() {
    stockfishRef.current?.stop();
    initBoard();
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
    const stockfish = stockfishRef.current;
    if (!stockfish) return;

    const gen = ++searchGeneration.current;
    let cancelled = false;

    async function runEngineMove(): Promise<void> {
      const engine = stockfishRef.current;
      if (engine === null) return;

      try {
        const base = chessRef.current;
        const result = await applyStockfishBestMove(engine, base.fen(), preset);
        if (cancelled || gen !== searchGeneration.current || !result) return;
        setChess(() => new Chess(result.nextFen));
        setLastMoveHighlight(result.highlight);
        setMovePlies((prev) => [...prev, result.san]);
        setCurrentPlayer(PLAYER_WHITE);
        appendFromMove(result.move);
      } catch (error) {
        console.error("Error searching for best move:", error);
      }
    }

    runEngineMove();

    return () => {
      cancelled = true;
      stockfish.stop();
    };
  }, [currentPlayer?.color, gameStatus, preset, appendFromMove]);

  const checkSquare = activeCheckSquare(chess, gameStatus);
  const gameOverText = getGameOverModalText(gameStatus);
  const inputLocked = currentPlayer?.color === Colors.BLACK;

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
        clocksStarted={false}
        gameStatus={gameStatus}
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        movePlies={movePlies}
        clocked={false}
        navColumn={
          <Link to={ROUTES.home} className="text-sm font-medium text-sky-800 hover:underline">
            ← Home
          </Link>
        }
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
      </ChessGameLayout>
    </div>
  );
}
