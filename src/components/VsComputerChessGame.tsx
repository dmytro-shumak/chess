import BoardComponent, { type SquareHighlight } from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import { StockfishClient } from "../engine/stockfishClient";
import { DEFAULT_ENGINE_PRESET_ID, ENGINE_PRESETS, type EnginePreset } from "../engine/enginePresets";
import { Chess, type Move } from "chess.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import Timer from "./Timer";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { gameStatusFromChess } from "../chess/gameStatusFromChess";
import { kingSquareForColor } from "../chess/kingSquare";
import { parseUci } from "../chess/uci";
import {
  capturedDisplayFromMove,
  resetCapturedDisplayKeyCounter,
  type CapturedDisplay,
} from "../chess/capturedFromMove";

const PLAYER_WHITE = new Player(Colors.WHITE, "You");
const PLAYER_BLACK = new Player(Colors.BLACK, "Stockfish");

const GAME_OVER_MODAL_DELAY_MS = 500;

export default function VsComputerChessGame() {
  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(PLAYER_WHITE);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const [presetId, setPresetId] = useState<string>(DEFAULT_ENGINE_PRESET_ID);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<SquareHighlight | null>(null);
  const [capturedByWhite, setCapturedByWhite] = useState<CapturedDisplay[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<CapturedDisplay[]>([]);
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stockfishRef = useRef<StockfishClient | null>(null);
  const chessRef = useRef(chess);
  const searchGeneration = useRef(0);

  chessRef.current = chess;

  const preset: EnginePreset =
    ENGINE_PRESETS.find((p) => p.id === presetId) ?? ENGINE_PRESETS[1];

  function initBoard() {
    resetCapturedDisplayKeyCounter();
    setChess(new Chess());
    setCurrentPlayer(PLAYER_WHITE);
    setMovePlies([]);
    setLastMoveHighlight(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  }

  const handleBoardMove = useCallback(({ san, move }: { san: string; uci: string; move: Move }) => {
    setMovePlies((prev) => [...prev, san]);
    const cap = capturedDisplayFromMove(move);
    if (cap) {
      if (move.color === "w") setCapturedByWhite((prev) => [...prev, cap]);
      else setCapturedByBlack((prev) => [...prev, cap]);
    }
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

  useEffect(() => {
    setGameStatus(() => gameStatusFromChess(chess));
  }, [chess]);

  function swapPlayer() {
    setCurrentPlayer(chess.turn() === "w" ? PLAYER_WHITE : PLAYER_BLACK);
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
        const fen = base.fen();
        const uci = await client.goBestMove(fen, { movetime: preset.movetime, depth: preset.depth });
        if (cancelled || gen !== searchGeneration.current) return;
        const p = parseUci(uci);
        if (!p) return;
        const next = new Chess(base.fen());
        const m = next.move({ from: p.from, to: p.to, promotion: p.promotion });
        if (!m) return;
        setChess(() => new Chess(next.fen()));
        setLastMoveHighlight({ from: p.from, to: p.to });
        setMovePlies((prev) => [...prev, m.san]);
        setCurrentPlayer(PLAYER_WHITE);
        const cap = capturedDisplayFromMove(m);
        if (cap) {
          if (m.color === "w") setCapturedByWhite((prev) => [...prev, cap]);
          else setCapturedByBlack((prev) => [...prev, cap]);
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

  const checkSquare =
    gameStatus === GameStatus.ACTIVE && chess.inCheck()
      ? kingSquareForColor(chess, chess.turn())
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
