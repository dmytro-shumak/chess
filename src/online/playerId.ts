const STORAGE_KEY = "chess-online-player-id";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `p_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    
    const id = randomId();
    localStorage.setItem(STORAGE_KEY, id);

    return id;
  } catch {
    return randomId();
  }
}
