import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { TrashItem } from '../utils/types';

let pendingWrite: Promise<void> = Promise.resolve();

async function readItems(): Promise<TrashItem[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TRASH);
  return data ? JSON.parse(data) as TrashItem[] : [];
}

function updateItems(change: (items: TrashItem[]) => TrashItem[]): Promise<void> {
  const operation = pendingWrite.then(async () => {
    const items = await readItems();
    await AsyncStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(change(items)));
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}

export async function getTrashItems(): Promise<TrashItem[]> {
  await pendingWrite;
  return readItems();
}

export async function addToTrash(item: TrashItem): Promise<void> {
  await updateItems(items => items.some(i => i.assetId === item.assetId) ? items : [...items, item]);
}

export async function removeFromTrash(assetId: string): Promise<void> {
  await updateItems(items => items.filter(i => i.assetId !== assetId));
}

export async function emptyTrash(): Promise<void> {
  await updateItems(() => []);
}

export async function getTrashCount(): Promise<number> {
  const items = await getTrashItems();
  return items.length;
}
