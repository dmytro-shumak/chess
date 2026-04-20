import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Chess, WHITE } from "chess.js";
import BoardComponent, { type SquareHighlight } from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import Timer from "./Timer";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
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
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { myColorInRoom, roomGameStarted } from "../online/roomState";
import { ROUTES } from "../routes";

const GAME_OVER_MODAL_DELAY_MS = 500;

export default function OnlineChessGame() {
  const { playerId, transport } = useOnlineRuntime();
  const { room, roomId } = useOnlineRoom();

  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const [capturedByWhite, setCapturedByWhite] = useState<CapturedDisplay[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<CapturedDisplay[]>([]);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<SquareHighlight | null>(null);
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedV = useRef(-1);

  const myColor = useMemo(() => myColorInRoom(room, playerId), [room, playerId]);

  const whitePlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) return new Player(Colors.WHITE, "White");
    const nick =
      room.whitePlayerId === room.hostId ? room.hostNick : room.guestNick ?? "Guest";
    return new Player(Colors.WHITE, nick);
  }, [room]);

  const blackPlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) return new Player(Colors.BLACK, "Black");
    const nick =
      room.blackPlayerId === room.hostId ? room.hostNick : room.guestNick ?? "Guest";
    return new Player(Colors.BLACK, nick);
  }, [room]);

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
    if (!room || !roomGameStarted(room)) return;
    if (room.v === lastSyncedV.current) return;
    lastSyncedV.current = room.v;

    resetCapturedDisplayKeyCounter();
    const c = new Chess();
    const wc: CapturedDisplay[] = [];
    const bc: CapturedDisplay[] = [];
    let lastHl: SquareHighlight | null = null;

    for (const mv of room.moves) {
      const p = parseUci(mv.uci);
      if (!p) continue;
      const m = c.move({ from: p.from, to: p.to, promotion: p.promotion });
      if (!m) continue;
      lastHl = { from: p.from, to: p.to };
      const cap = capturedDisplayFromMove(m);
      if (cap) {
        if (m.color === WHITE) wc.push(cap);
        else bc.push(cap);
      }
    }

    setChess(new Chess(c.fen()));
    setCapturedByWhite(wc);
    setCapturedByBlack(bc);
    setLastMoveHighlight(lastHl);
    setMovePlies(room.moves.map((m) => m.san));

    const nextColor = room.moves.length % 2 === 0 ? Colors.WHITE : Colors.BLACK;
    setCurrentPlayer(nextColor === Colors.WHITE ? whitePlayer : blackPlayer);
    if (room.moves.length > 0) {
      setClocksStarted(true);
    }
  }, [room?.v, room?.moves, whitePlayer, blackPlayer]);

  useEffect(() => {
    setGameStatus((prev) => {
      if (prev === GameStatus.TIMEOUT_WHITE || prev === GameStatus.TIMEOUT_BLACK) return prev;
      return gameStatusFromChess(chess);
    });
  }, [chess]);

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  const swapPlayer = useCallback(() => {
    setClocksStarted(true);
    setCurrentPlayer((p) => {
      if (!p) return p;
      return p.color === Colors.WHITE ? blackPlayer : whitePlayer;
    });
  }, [whitePlayer, blackPlayer]);

  const commitNetworkMove = useCallback(
    (san: string, uci: string) => {
      const plyIndex = (room?.moves.length ?? 0) + 1;
      transport.sendMove(roomId, uci, san, plyIndex);
    },
    [room?.moves.length, roomId, transport],
  );

  function restart() {
    lastSyncedV.current = -1;
    resetCapturedDisplayKeyCounter();
    setChess(new Chess());
    setBoardResetKey((k) => k + 1);
    setMovePlies([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setLastMoveHighlight(null);
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
    setGameOverDismissed(false);
    setCurrentPlayer(whitePlayer);
  }

  const checkSquare =
    gameStatus === GameStatus.ACTIVE && chess.inCheck()
      ? kingSquareForColor(chess, chess.turn())
      : null;

  const gameOverCopy = getGameOverModalCopy(gameStatus);

  const inputLocked =
    gameStatus !== GameStatus.ACTIVE ||
    !myColor ||
    !currentPlayer ||
    currentPlayer.color !== myColor;

  const viewFromColor = myColor ?? Colors.WHITE;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center p-4">
      <div className="mb-4 flex w-full max-w-7xl items-center justify-between gap-2">
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          ← Lobby
        </Link>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Room {roomId} · {myColor === Colors.WHITE ? "White" : "Black"}
        </span>
      </div>
      {gameOverCopy && (
        <GameOverModal
          open={gameOverModalReady && !gameOverDismissed}
          onOpenChange={(open) => {
            if (!open) setGameOverDismissed(true);
          }}
          copy={gameOverCopy}
          onRematch={restart}
          showRematch={false}
        />
      )}
      <Timer
        currentPlayer={currentPlayer}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        restart={restart}
        clocksStarted={clocksStarted}
        gameStatus={gameStatus}
        onOutOfTime={handleOutOfTime}
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        movePlies={movePlies}
        invertPlayerBars={myColor === Colors.BLACK}
        initialClockSeconds={room?.timeControlSeconds}
        lockRestart
        sidePanelFooter={
          <p className="text-center text-xs text-slate-600">Online game via Socket.IO (see docs/online-protocol.md).</p>
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
          onMove={({ san, uci }) => {
            commitNetworkMove(san, uci);
          }}
          inputLocked={inputLocked}
          viewFromColor={viewFromColor}
          lastMoveHighlight={lastMoveHighlight}
          onLastMoveHighlight={setLastMoveHighlight}
        />
      </Timer>
    </div>
  );
}
