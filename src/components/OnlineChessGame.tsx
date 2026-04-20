import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BoardComponent from "./BoardComponent";
import GameOverModal from "./GameOverModal";
import Timer from "./Timer";
import { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import { Player } from "../models/Player";
import { GameStatus } from "../models/GameStatus";
import { getGameOverModalCopy } from "../utils/getGameOverModalCopy";
import { buildRepetitionKey } from "../utils/positionRepetition";
import { outcomeAfterMove } from "../game/outcomeAfterMove";
import { applyUciMove } from "../utils/fen";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { myColorInRoom, roomGameStarted } from "../online/roomState";
import { ROUTES } from "../routes";

const GAME_OVER_MODAL_DELAY_MS = 500;

function newBoardWithPieces(): Board {
  const b = new Board();
  b.initCells();
  b.addFigures();
  return b;
}

export default function OnlineChessGame() {
  const { playerId, transport } = useOnlineRuntime();
  const { room, roomId } = useOnlineRoom();

  const [board, setBoard] = useState(() => newBoardWithPieces());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState(GameStatus.ACTIVE);
  const [movePlies, setMovePlies] = useState<string[]>([]);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [clocksStarted, setClocksStarted] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const repetitionCounts = useRef(new Map<string, number>());
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedV = useRef(-1);
  const pendingUciRef = useRef<string | null>(null);

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

    const b = new Board();
    b.initCells();
    b.addFigures();
    repetitionCounts.current.clear();
    repetitionCounts.current.set(buildRepetitionKey(b, Colors.WHITE), 1);

    let status = GameStatus.ACTIVE;
    for (let i = 0; i < room.moves.length; i++) {
      const mv = room.moves[i]!;
      const moverColor = i % 2 === 0 ? Colors.WHITE : Colors.BLACK;
      applyUciMove(b, mv.uci, moverColor);
      const sideToMoveNext = moverColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
      status = outcomeAfterMove(b, sideToMoveNext, repetitionCounts.current);
      if (status !== GameStatus.ACTIVE) break;
    }

    setBoard(b.getCopyBoard());
    setMovePlies(room.moves.map((m) => m.san));

    const nextColor = room.moves.length % 2 === 0 ? Colors.WHITE : Colors.BLACK;
    setCurrentPlayer(nextColor === Colors.WHITE ? whitePlayer : blackPlayer);
    setGameStatus(status);
    if (room.moves.length > 0) {
      setClocksStarted(true);
    }
  }, [room?.v, room?.moves, whitePlayer, blackPlayer]);

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
    const b = newBoardWithPieces();
    setBoard(b);
    setBoardResetKey((k) => k + 1);
    setMovePlies([]);
    repetitionCounts.current.clear();
    repetitionCounts.current.set(buildRepetitionKey(b, Colors.WHITE), 1);
    setGameStatus(GameStatus.ACTIVE);
    setClocksStarted(false);
    setGameOverDismissed(false);
    setCurrentPlayer(whitePlayer);
  }

  const isCheck = currentPlayer ? board.isKingInCheck(currentPlayer.color) : false;
  const checkKingCell =
    gameStatus === GameStatus.ACTIVE && isCheck && currentPlayer
      ? board.getKingCell(currentPlayer.color)
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
        capturedByWhite={board.lostBlackFigures}
        capturedByBlack={board.lostWhiteFigures}
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
          board={board}
          setBoard={setBoard}
          currentPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameStatus={gameStatus}
          checkKingCell={checkKingCell}
          onMoveUci={(uci) => {
            pendingUciRef.current = uci;
          }}
          onMovePlayed={(san) => {
            const uci = pendingUciRef.current;
            pendingUciRef.current = null;
            if (uci) commitNetworkMove(san, uci);
          }}
          inputLocked={inputLocked}
          viewFromColor={viewFromColor}
        />
      </Timer>
    </div>
  );
}
