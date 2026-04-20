function pad2(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}

// Seconds => MM:SS
export function formatMinutesSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}
