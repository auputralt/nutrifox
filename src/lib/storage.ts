import type { UserPreferences, ScanRecord } from "./types";

const PREFS_KEY = "nutrifox_preferences";
const HISTORY_KEY = "nutrifox_history";

export function getPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return null;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  localStorage.removeItem(PREFS_KEY);
}

export function getHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScanRecord[];
  } catch {
    return [];
  }
}

export function addScanRecord(record: ScanRecord): void {
  const history = getHistory();
  history.unshift(record);
  // Keep last 50 records
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, 50))
  );
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
