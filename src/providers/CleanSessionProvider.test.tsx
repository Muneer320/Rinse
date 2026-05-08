import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { CleanSessionProvider, useCleanSession } from './CleanSessionProvider';
import { getTrashItems } from '../storage/trashStorage';
import { loadSession } from '../storage/sessionStorage';
import type { PhotoAsset } from '../utils/types';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-haptics', () => ({ NotificationFeedbackType: { Error: 'error', Success: 'success' }, ImpactFeedbackStyle: { Light: 'light' }, notificationAsync: jest.fn(), impactAsync: jest.fn() }));

const photo = (id: string): PhotoAsset => ({ id, uri: `file://${id}.jpg`, filename: `${id}.jpg`, width: 100, height: 100, creationTime: 1, mediaType: 'image' as PhotoAsset['mediaType'] });
const wrapper = ({ children }: { children: React.ReactNode }) => <CleanSessionProvider>{children}</CleanSessionProvider>;

beforeEach(async () => { await AsyncStorage.clear(); });

test('first swipe persists the session and consecutive deletes survive', async () => {
  const { result, unmount } = await renderHook(() => useCleanSession(), { wrapper });
  await act(async () => { await result.current.startSession('2026-10', [photo('a'), photo('b'), photo('c')]); });
  await act(async () => { result.current.swipeLeft('a'); });
  await waitFor(() => expect(result.current.currentIndex).toBe(1));
  expect((await loadSession('2026-10'))?.currentIndex).toBe(1);
  await act(async () => { result.current.swipeLeft('b'); });
  await waitFor(() => expect(result.current.currentIndex).toBe(2));
  expect((await getTrashItems()).map(item => item.assetId)).toEqual(['a', 'b']);
  await unmount();
});

test('undo on the final photo restores an active session', async () => {
  const { result, unmount } = await renderHook(() => useCleanSession(), { wrapper });
  await act(async () => { await result.current.startSession('2026-10', [photo('last')]); });
  await act(async () => { result.current.swipeLeft('last'); });
  await waitFor(() => expect(result.current.pendingUndo?.assetId).toBe('last'));
  expect(result.current.isComplete).toBe(false);
  await act(async () => { result.current.undoDelete(); });
  await waitFor(() => expect(result.current.currentIndex).toBe(0));
  expect(result.current.isSessionActive).toBe(true);
  expect(await getTrashItems()).toEqual([]);
  await unmount();
});
