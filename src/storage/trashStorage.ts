import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { TrashItem } from '../utils/types';

export async function getTrashItems(): Promise<TrashItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRASH);
    if (!data) return [];
    return JSON.parse(data) as TrashItem[];
  } catch (error) {
    console.error('[trashStorage] Failed to get trash items:', error);
    return [];
  }
}

export async function addToTrash(item: TrashItem): Promise<void> {
  try {
    const items = await getTrashItems();
    if (!items.some(i => i.assetId === item.assetId)) {
      items.push(item);
      await AsyncStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(items));
    }
  } catch (error) {
    console.error('[trashStorage] Failed to add to trash:', error);
  }
}

export async function removeFromTrash(assetId: string): Promise<void> {
  try {
    const items = await getTrashItems();
    const filtered = items.filter(i => i.assetId !== assetId);
    await AsyncStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(filtered));
  } catch (error) {
    console.error('[trashStorage] Failed to remove from trash:', error);
  }
}

export async function emptyTrash(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
  } catch (error) {
    console.error('[trashStorage] Failed to empty trash:', error);
  }
}

export async function getTrashCount(): Promise<number> {
  const items = await getTrashItems();
  return items.length;
}