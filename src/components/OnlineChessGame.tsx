import { Chess } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { activeCheckSquare } from "../chess/activeCheckSquare";
import { replayMovesFromUci } from "../chess/replayMovesFromUci";
import type { SquareHighlight } from "../chess/types";
import { useCapturedPieces } from "../hooks/useCapturedPieces";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import { Player } from "../models/Player";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { myColorInRoom, roomGameStarted } from "../online/roomState";
import { ROUTES } from "../routes";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import Timer from "./Timer";

export default function OnlineChessGame() {
  const { playerId, transport } = useOnlineRuntime();
  const { room, roomId } = useOnlineRoom();

  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [clocksStarted, setClocksStarted] = useState(false);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<SquareHighlight | null>(null);
  const lastSyncedV = useRef(-1);
  const {
    capturedByWhite,
    capturedByBlack,
    reset: resetCaptures,
    replaceAll,
  } = useCapturedPieces();
  const { gameOverModalReady, gameOverDismissed, setGameOverDismissed } =
    useDelayedGameOverModal(gameStatus);

  useGameStatusFromChess(chess, setGameStatus, { preserveTimeouts: true });

  const myColor = useMemo(() => myColorInRoom(room, playerId), [room, playerId]);

  const whitePlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) return new Player(Colors.WHITE, "White");
    const nick = room.whitePlayerId === room.hostId ? room.hostNick : (room.guestNick ?? "Guest");
    return new Player(Colors.WHITE, nick);
  }, [room]);

  const blackPlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) return new Player(Colors.BLACK, "Black");
    const nick = room.blackPlayerId === room.hostId ? room.hostNick : (room.guestNick ?? "Guest");
    return new Player(Colors.BLACK, nick);
  }, [room]);

  useEffect(() => {
    if (!room || !roomGameStarted(room)) return;
    if (room.v === lastSyncedV.current) return;
    lastSyncedV.current = room.v;

    const replay = replayMovesFromUci(room.moves, `room-${room.v}`);
    setChess(replay.chess);
    replaceAll(replay.capturedByWhite, replay.capturedByBlack);
    setLastMoveHighlight(replay.lastHighlight);
    setMovePlies(replay.movePlies);

    const nextColor = room.moves.length % 2 === 0 ? Colors.WHITE : Colors.BLACK;
    setCurrentPlayer(nextColor === Colors.WHITE ? whitePlayer : blackPlayer);
    if (room.moves.length > 0) {
      setClocksStarted(true);
    }
  }, [room, whitePlayer, blackPlayer, replaceAll]);

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
    setChess(new Chess());
    setBoardResetKey((k) => k + 1);
    setMovePlies([]);
    resetCaptures();
    setLastMoveHighlight(null);
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
    setCurrentPlayer(whitePlayer);
  }

  const checkSquare = activeCheckSquare(chess, gameStatus);
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
          <p className="text-center text-xs text-slate-600">
            Online game via Socket.IO (see docs/online-protocol.md).
          </p>
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
