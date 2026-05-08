import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_STATS } from '../utils/constants';
import type { AppStats } from '../utils/types';

export async function getStats(): Promise<AppStats> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return { ...DEFAULT_STATS } as AppStats;
    return JSON.parse(data) as AppStats;
  } catch (error) {
    console.error('[statsStorage] Failed to get stats:', error);
    return { ...DEFAULT_STATS } as AppStats;
  }
}

export async function saveStats(stats: AppStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('[statsStorage] Failed to save stats:', error);
  }
}

let pendingWrite: Promise<void> = Promise.resolve();

function updateStats(change: (stats: AppStats) => void): Promise<void> {
  const operation = pendingWrite.then(async () => {
    const stats = await getStats();
    change(stats);
    await saveStats(stats);
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}

export async function recordSwipeAction(monthKey: string, action: 'delete' | 'keep'): Promise<void> {
  await updateStats(stats => {
    stats.totalReviewed++;
    if (action === 'delete') stats.totalDeleted++;
    else stats.totalKept++;
    if (!stats.monthStats[monthKey]) stats.monthStats[monthKey] = { reviewed: 0, deleted: 0, kept: 0 };
    stats.monthStats[monthKey].reviewed++;
    stats.monthStats[monthKey][action === 'delete' ? 'deleted' : 'kept']++;
  });
}

export async function reverseSwipeAction(monthKey: string, action: 'delete' | 'keep'): Promise<void> {
  await updateStats(stats => {
    const month = stats.monthStats[monthKey];
    if (!month || month[action === 'delete' ? 'deleted' : 'kept'] < 1) return;
    stats.totalReviewed = Math.max(0, stats.totalReviewed - 1);
    if (action === 'delete') stats.totalDeleted = Math.max(0, stats.totalDeleted - 1);
    else stats.totalKept = Math.max(0, stats.totalKept - 1);
    month.reviewed = Math.max(0, month.reviewed - 1);
    month[action === 'delete' ? 'deleted' : 'kept']--;
  });
}

export async function resetStats(): Promise<void> {
  await saveStats({ ...DEFAULT_STATS } as AppStats);
}
