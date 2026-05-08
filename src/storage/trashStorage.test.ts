import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToTrash, getTrashItems, removeFromTrash } from './trashStorage';
import type { TrashItem } from '../utils/types';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const item = (assetId: string): TrashItem => ({ assetId, uri: null, filename: assetId, deletedAt: 1, monthKey: '2026-10', monthLabel: 'October 2026' });

beforeEach(async () => { await AsyncStorage.clear(); });

test('concurrent left swipes keep both trash records', async () => {
  await Promise.all([addToTrash(item('first')), addToTrash(item('second'))]);
  expect((await getTrashItems()).map(photo => photo.assetId)).toEqual(['first', 'second']);
  await addToTrash(item('first'));
  expect(await getTrashItems()).toHaveLength(2);
});

test('restoring one item keeps the other', async () => {
  await Promise.all([addToTrash(item('first')), addToTrash(item('second'))]);
  await removeFromTrash('second');
  expect((await getTrashItems()).map(photo => photo.assetId)).toEqual(['first']);
});
