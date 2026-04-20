export const ROUTES = {
  home: "/",
  local: "/local",
  vsComputer: "/vs-computer",
  online: "/online",
} as const;

export const ONLINE_ROUTES = {
  room: "room/:roomId",
  play: "play/:roomId",
} as const;

export function onlineRoomPath(roomId: string): string {
  return `${ROUTES.online}/room/${roomId.toUpperCase()}`;
}

export function onlinePlayPath(roomId: string): string {
  return `${ROUTES.online}/play/${roomId.toUpperCase()}`;
}
