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

export async function recordSwipeAction(
  monthKey: string,
  action: 'delete' | 'keep',
  spaceFreed?: number
): Promise<void> {
  try {
    const stats = await getStats();
    stats.totalReviewed++;
    if (action === 'delete') {
      stats.totalDeleted++;
      stats.totalSpaceFreed += spaceFreed || 0;
    } else {
      stats.totalKept++;
    }
    if (!stats.monthStats[monthKey]) {
      stats.monthStats[monthKey] = { reviewed: 0, deleted: 0, kept: 0 };
    }
    stats.monthStats[monthKey].reviewed++;
    if (action === 'delete') {
      stats.monthStats[monthKey].deleted++;
    } else {
      stats.monthStats[monthKey].kept++;
    }
    await saveStats(stats);
  } catch (error) {
    console.error('[statsStorage] Failed to record swipe action:', error);
  }
}

export async function resetStats(): Promise<void> {
  await saveStats({ ...DEFAULT_STATS } as AppStats);
}