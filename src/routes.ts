export const ROUTES = {
  home: "/",
  local: "/local",
  vsComputer: "/vs-computer",
  online: "/online",
} as const;

export function onlineRoomPath(roomId: string): string {
  return `${ROUTES.online}/room/${roomId.toUpperCase()}`;
}

export function onlinePlayPath(roomId: string): string {
  return `${ROUTES.online}/play/${roomId.toUpperCase()}`;
}
