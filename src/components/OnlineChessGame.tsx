import { Chess } from "chess.js";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Colors } from "../constants/chess/colors";
import { GameStatus } from "../constants/chess/gameStatus";
import { useCapturedPieces } from "../hooks/useCapturedPieces";
import { useDelayedGameOverModal } from "../hooks/useDelayedGameOverModal";
import { useGameStatusFromChess } from "../hooks/useGameStatusFromChess";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { myColorInRoom, roomGameStarted } from "../online/roomState";
import { ROUTES } from "../routes";
import type { Player } from "../types/chess/player";
import type { SquareHighlight } from "../types/chess/squareHighlight";
import { activeCheckSquare } from "../utils/chess/activeCheckSquare";
import { replayMovesFromUci } from "../utils/chess/replayMovesFromUci";
import { getGameOverModalText } from "../utils/getGameOverModalText";
import BoardComponent from "./BoardComponent";
import ChessGameLayout from "./ChessGameLayout";
import GameOverModal from "./GameOverModal";

export default function OnlineChessGame() {
  const { playerId, transport } = useOnlineRuntime();
  const { room, roomId, actionError, clearActionError } = useOnlineRoom();

  const [chess, setChess] = useState(() => new Chess());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [clocksStarted, setClocksStarted] = useState(false);
  const [lastMoveHighlight, setLastMoveHighlight] = useState<SquareHighlight | null>(null);
  const replaySerialRef = useRef(0);

  const { capturedByWhite, capturedByBlack, replaceAll } = useCapturedPieces();
  const { gameOverModalReady, gameOverDismissed, setGameOverDismissed } =
    useDelayedGameOverModal(gameStatus);

  useGameStatusFromChess(chess, setGameStatus, { preserveTimeouts: true });

  const myColor = useMemo(() => myColorInRoom(room, playerId), [room, playerId]);

  const whitePlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) {
      return { color: Colors.WHITE, name: "White" };
    }

    const nick = room.whitePlayerId === room.hostId ? room.hostNick : (room.guestNick ?? "Guest");
    return { color: Colors.WHITE, name: nick };
  }, [room]);

  const blackPlayer = useMemo(() => {
    if (!room?.whitePlayerId || !room.blackPlayerId) {
      return { color: Colors.BLACK, name: "Black" };
    }

    const nick = room.blackPlayerId === room.hostId ? room.hostNick : (room.guestNick ?? "Guest");
    return { color: Colors.BLACK, name: nick };
  }, [room]);

  useLayoutEffect(() => {
    if (!room || !roomGameStarted(room)) return;

    replaySerialRef.current += 1;
    const replayed = replayMovesFromUci(
      room.moves,
      `room-${room.v}-sync-${replaySerialRef.current}`,
    );
    setChess(replayed.chess);
    replaceAll(replayed.capturedByWhite, replayed.capturedByBlack);
    setLastMoveHighlight(replayed.lastHighlight);
    setMovePlies(replayed.movePlies);

    const sideToMove = room.moves.length % 2 === 0 ? Colors.WHITE : Colors.BLACK;
    setCurrentPlayer(sideToMove === Colors.WHITE ? whitePlayer : blackPlayer);

    if (room.moves.length > 0) {
      setClocksStarted(true);
    } else {
      setClocksStarted(false);
    }
  }, [room, whitePlayer, blackPlayer, replaceAll]);

  const handleOutOfTime = useCallback((loser: Colors) => {
    setGameStatus(loser === Colors.WHITE ? GameStatus.TIMEOUT_WHITE : GameStatus.TIMEOUT_BLACK);
  }, []);

  const swapPlayer = useCallback(() => {
    setClocksStarted(true);
    setCurrentPlayer((turnPlayer) => {
      if (!turnPlayer) return turnPlayer;

      return turnPlayer.color === Colors.WHITE ? blackPlayer : whitePlayer;
    });
  }, [whitePlayer, blackPlayer]);

  // Send local move to the server
  const commitNetworkMove = useCallback(
    (san: string, uci: string) => {
      const plyIndex = (room?.moves.length ?? 0) + 1;
      transport.sendMove(roomId, uci, san, plyIndex);
    },
    [room?.moves.length, roomId, transport],
  );

  const requestRestart = useCallback(() => {
    transport.requestRestart(roomId);
  }, [transport, roomId]);

  const checkSquare = activeCheckSquare(chess, gameStatus);
  const gameOverText = getGameOverModalText(gameStatus);

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
      {gameOverText && (
        <GameOverModal
          open={gameOverModalReady && !gameOverDismissed}
          onOpenChange={(open) => {
            if (!open) setGameOverDismissed(true);
          }}
          text={gameOverText}
          onRematch={requestRestart}
          showRematch={false}
        />
      )}
      <ChessGameLayout
        currentPlayer={currentPlayer}
        whitePlayer={whitePlayer}
        blackPlayer={blackPlayer}
        restart={requestRestart}
        clocksStarted={clocksStarted}
        gameStatus={gameStatus}
        onOutOfTime={handleOutOfTime}
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        movePlies={movePlies}
        invertPlayerBars={myColor === Colors.BLACK}
        initialClockSeconds={room?.timeControlSeconds}
        lockRestart={gameStatus === GameStatus.ACTIVE}
      >
        <BoardComponent
          chess={chess}
          setChess={setChess}
          turnPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameStatus={gameStatus}
          checkSquare={checkSquare}
          onMove={(move) => {
            commitNetworkMove(move.san, move.lan);
          }}
          inputLocked={inputLocked}
          viewFromColor={viewFromColor}
          lastMoveHighlight={lastMoveHighlight}
          onLastMoveHighlight={setLastMoveHighlight}
        />
      </ChessGameLayout>
    </div>
  );
}
