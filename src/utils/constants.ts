export const STORAGE_VERSION = 'v1';
export const SWIPE_THRESHOLD = 0.33;
export const UNDO_TIMEOUT_MS = 5000;
export const CARDS_TO_PRELOAD = 3;
export const PHOTOS_PER_PAGE = 100;
export const TRASH_AUTO_PURGE_DAYS = 30;

export const STORAGE_KEYS = {
  SESSION: (monthKey: string) => `rinse:${STORAGE_VERSION}:session:${monthKey}`,
  TRASH: `rinse:${STORAGE_VERSION}:trash`,
  STATS: `rinse:${STORAGE_VERSION}:stats`,
  COMPLETED_MONTHS: `rinse:${STORAGE_VERSION}:completed`,
} as const;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const DEFAULT_STATS = {
  totalReviewed: 0,
  totalDeleted: 0,
  totalKept: 0,
  totalSpaceFreed: 0,
  monthStats: {} as Record<string, { reviewed: number; deleted: number; kept: number }>,
} as const;
