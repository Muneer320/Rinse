import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { SessionState } from '../utils/types';

export async function saveSession(monthKey: string, state: SessionState): Promise<void> {
  try {
    const key = STORAGE_KEYS.SESSION(monthKey);
    await AsyncStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('[sessionStorage] Failed to save session:', error);
  }
}

export async function loadSession(monthKey: string): Promise<SessionState | null> {
  try {
    const key = STORAGE_KEYS.SESSION(monthKey);
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as SessionState;
  } catch (error) {
    console.error('[sessionStorage] Failed to load session:', error);
    return null;
  }
}

export async function clearSession(monthKey: string): Promise<void> {
  try {
    const key = STORAGE_KEYS.SESSION(monthKey);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[sessionStorage] Failed to clear session:', error);
  }
}

export async function markMonthCompleted(monthKey: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_MONTHS);
    const completed: string[] = data ? JSON.parse(data) : [];
    if (!completed.includes(monthKey)) {
      completed.push(monthKey);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_MONTHS, JSON.stringify(completed));
    }
  } catch (error) {
    console.error('[sessionStorage] Failed to mark month complete:', error);
  }
}

export async function getCompletedMonths(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_MONTHS);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch (error) {
    console.error('[sessionStorage] Failed to get completed months:', error);
    return [];
  }
}

export async function isMonthCompleted(monthKey: string): Promise<boolean> {
  const completed = await getCompletedMonths();
  return completed.includes(monthKey);
}