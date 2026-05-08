import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { UNDO_TIMEOUT_MS } from '../utils/constants';
import { saveSession, loadSession, markMonthCompleted, clearSession } from '../storage/sessionStorage';
import { addToTrash, removeFromTrash } from '../storage/trashStorage';
import { recordSwipeAction, reverseSwipeAction } from '../storage/statsStorage';
import { getMonthLabel } from '../utils/formatters';
import type { PhotoAsset, SessionState, SwipeAction, TrashItem } from '../utils/types';

type PendingUndo = { assetId: string; index: number; timeoutId: ReturnType<typeof setTimeout> | null };
interface CleanSessionContextValue {
  monthKey: string | null;
  photos: PhotoAsset[];
  currentIndex: number;
  isSessionActive: boolean;
  isComplete: boolean;
  pendingUndo: PendingUndo | null;
  swipes: SwipeAction[];
  startSession: (monthKey: string, photos: PhotoAsset[]) => Promise<void>;
  endSession: () => void;
  swipeLeft: (assetId: string, filename?: string) => void;
  swipeRight: (assetId: string) => void;
  undoDelete: () => void;
  skipPhoto: () => void;
  getCurrentPhoto: () => PhotoAsset | null;
  getNextPhoto: () => PhotoAsset | null;
  getProgress: () => { total: number; reviewed: number; deleted: number; kept: number };
}

const CleanSessionContext = createContext<CleanSessionContextValue | null>(null);
export function useCleanSession(): CleanSessionContextValue {
  const context = useContext(CleanSessionContext);
  if (!context) throw new Error('useCleanSession must be used within CleanSessionProvider');
  return context;
}

export function CleanSessionProvider({ children }: { children: React.ReactNode }) {
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [swipes, setSwipes] = useState<SwipeAction[]>([]);
  const state = useRef({ monthKey: null as string | null, photos: [] as PhotoAsset[], index: 0, swipes: [] as SwipeAction[], pending: null as PendingUndo | null, busy: false });
  useEffect(() => () => {
    if (state.current.pending?.timeoutId) clearTimeout(state.current.pending.timeoutId);
  }, []);

  const clearPending = useCallback(() => {
    if (state.current.pending?.timeoutId) clearTimeout(state.current.pending.timeoutId);
    state.current.pending = null;
    setPendingUndo(null);
  }, []);

  const persist = useCallback(async () => {
    const { monthKey: key, index, swipes: actions } = state.current;
    if (!key) return;
    const now = Date.now();
    const snapshot: SessionState = { monthKey: key, currentIndex: index, swipes: actions, startTime: now, lastActiveTime: now };
    await saveSession(key, snapshot);
  }, []);

  const finish = useCallback(async () => {
    const key = state.current.monthKey;
    if (!key) return;
    await markMonthCompleted(key);
    await clearSession(key);
    setIsComplete(true);
    setIsSessionActive(false);
  }, []);

  const startSession = useCallback(async (key: string, photoList: PhotoAsset[]) => {
    clearPending();
    const saved = await loadSession(key);
    const index = saved && saved.currentIndex <= photoList.length ? saved.currentIndex : 0;
    const actions = saved && index > 0 ? saved.swipes : [];
    state.current = { monthKey: key, photos: photoList, index, swipes: actions, pending: null, busy: false };
    setMonthKey(key);
    setPhotos(photoList);
    setCurrentIndex(index);
    setSwipes(actions);
    setIsComplete(index >= photoList.length && photoList.length > 0);
    setIsSessionActive(index < photoList.length);
    if (index >= photoList.length && photoList.length > 0) await finish();
    else await persist();
  }, [clearPending, finish, persist]);

  const endSession = useCallback(() => {
    clearPending();
    state.current = { monthKey: null, photos: [], index: 0, swipes: [], pending: null, busy: false };
    setIsSessionActive(false);
    setMonthKey(null);
    setPhotos([]);
    setCurrentIndex(0);
    setSwipes([]);
    setIsComplete(false);
  }, [clearPending]);

  const advance = useCallback(async (action: SwipeAction, waitForUndo: boolean) => {
    state.current.swipes = [...state.current.swipes, action];
    state.current.index += 1;
    setSwipes(state.current.swipes);
    setCurrentIndex(state.current.index);
    await persist();
    if (state.current.index >= state.current.photos.length && !waitForUndo) await finish();
  }, [finish, persist]);

  const schedulePendingExpiry = useCallback((pending: PendingUndo) => {
    const expire = async () => {
      if (state.current.pending !== pending) return;
      if (state.current.busy) {
        pending.timeoutId = setTimeout(expire, 100);
        return;
      }
      state.current.pending = null;
      setPendingUndo(null);
      if (state.current.index >= state.current.photos.length) await finish();
    };
    pending.timeoutId = setTimeout(expire, UNDO_TIMEOUT_MS);
  }, [finish]);

  const swipeLeft = useCallback(async (assetId: string, filename?: string) => {
    const current = state.current;
    const photo = current.photos[current.index];
    if (current.busy || !photo || photo.id !== assetId || !current.monthKey) return;
    current.busy = true;
    try {
      const key = current.monthKey;
      const item: TrashItem = { assetId, uri: photo.uri, filename: filename || photo.filename, deletedAt: Date.now(), monthKey: key, monthLabel: getMonthLabel(key) };
      await addToTrash(item);
      clearPending();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const action: SwipeAction = { assetId, action: 'delete', timestamp: Date.now() };
      await advance(action, true);
      await recordSwipeAction(key, 'delete');
      const pending: PendingUndo = { assetId, index: current.index - 1, timeoutId: null };
      state.current.pending = pending;
      setPendingUndo(pending);
      schedulePendingExpiry(pending);
    } catch (error) {
      console.error('[CleanSessionProvider] Could not queue photo for deletion:', error);
      Alert.alert('Could not queue photo', 'The photo was not marked for deletion. Please try again.');
    } finally {
      current.busy = false;
    }
  }, [advance, clearPending, schedulePendingExpiry]);

  const swipeRight = useCallback(async (assetId: string) => {
    const current = state.current;
    const photo = current.photos[current.index];
    if (current.busy || !photo || photo.id !== assetId || !current.monthKey) return;
    current.busy = true;
    try {
      clearPending();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await advance({ assetId, action: 'keep', timestamp: Date.now() }, false);
      await recordSwipeAction(current.monthKey, 'keep');
    } finally {
      current.busy = false;
    }
  }, [advance, clearPending]);

  const undoDelete = useCallback(async () => {
    const current = state.current;
    const pending = current.pending;
    if (current.busy || !pending || !current.monthKey) return;
    current.busy = true;
    try {
      await removeFromTrash(pending.assetId);
      clearPending();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      current.index = pending.index;
      current.swipes = current.swipes.filter(action => action.assetId !== pending.assetId);
      setCurrentIndex(current.index);
      setSwipes(current.swipes);
      setIsComplete(false);
      setIsSessionActive(true);
      await persist();
      await reverseSwipeAction(current.monthKey, 'delete');
    } catch (error) {
      console.error('[CleanSessionProvider] Could not undo delete:', error);
      Alert.alert('Could not undo', 'The photo remains in Trash; restore it from the Trash screen.');
    } finally {
      current.busy = false;
    }
  }, [clearPending, persist]);

  const skipPhoto = useCallback(() => {
    const photo = state.current.photos[state.current.index];
    if (photo) void swipeRight(photo.id);
  }, [swipeRight]);
  const getCurrentPhoto = useCallback(() => photos[currentIndex] || null, [photos, currentIndex]);
  const getNextPhoto = useCallback(() => photos[currentIndex + 1] || null, [photos, currentIndex]);
  const getProgress = useCallback(() => ({ total: photos.length, reviewed: swipes.length, deleted: swipes.filter(action => action.action === 'delete').length, kept: swipes.filter(action => action.action === 'keep').length }), [photos.length, swipes]);

  return <CleanSessionContext.Provider value={{ monthKey, photos, currentIndex, isSessionActive, isComplete, pendingUndo, swipes, startSession, endSession, swipeLeft, swipeRight, undoDelete, skipPhoto, getCurrentPhoto, getNextPhoto, getProgress }}>{children}</CleanSessionContext.Provider>;
}
