import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { UNDO_TIMEOUT_MS } from '../utils/constants';
import { saveSession, loadSession, markMonthCompleted, clearSession } from '../storage/sessionStorage';
import { addToTrash, removeFromTrash } from '../storage/trashStorage';
import { recordSwipeAction } from '../storage/statsStorage';
import { getMonthLabel } from '../utils/formatters';
import type { PhotoAsset, SessionState, SwipeAction, TrashItem } from '../utils/types';

interface CleanSessionContextValue {
  monthKey: string | null;
  photos: PhotoAsset[];
  currentIndex: number;
  isSessionActive: boolean;
  isComplete: boolean;
  pendingUndo: { assetId: string; timeoutId: ReturnType<typeof setTimeout> } | null;
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
  const ctx = useContext(CleanSessionContext);
  if (!ctx) throw new Error('useCleanSession must be used within CleanSessionProvider');
  return ctx;
}

export function CleanSessionProvider({ children }: { children: React.ReactNode }) {
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingUndo, setPendingUndo] = useState<{ assetId: string; timeoutId: ReturnType<typeof setTimeout> } | null>(null);
  const [swipes, setSwipes] = useState<SwipeAction[]>([]);
  const pendingUndoRef = useRef(pendingUndo);
  pendingUndoRef.current = pendingUndo;

  const persistSession = useCallback(async (idx: number, swipeList: SwipeAction[]) => {
    if (!monthKey) return;
    const state: SessionState = { monthKey, currentIndex: idx, swipes: swipeList, startTime: Date.now(), lastActiveTime: Date.now() };
    await saveSession(monthKey, state);
  }, [monthKey]);

  const startSession = useCallback(async (key: string, photoList: PhotoAsset[]) => {
    setMonthKey(key);
    setPhotos(photoList);
    setCurrentIndex(0);
    setSwipes([]);
    setIsComplete(false);
    setIsSessionActive(true);
    setPendingUndo(null);
    const saved = await loadSession(key);
    if (saved && saved.currentIndex < photoList.length) {
      setCurrentIndex(saved.currentIndex);
      setSwipes(saved.swipes);
      await persistSession(saved.currentIndex, saved.swipes);
    } else if (saved && saved.currentIndex >= photoList.length) {
      setIsComplete(true);
      setIsSessionActive(false);
    } else {
      await persistSession(0, []);
    }
  }, [persistSession]);

  const endSession = useCallback(() => {
    if (pendingUndoRef.current) { clearTimeout(pendingUndoRef.current.timeoutId); }
    setIsSessionActive(false);
    setMonthKey(null);
    setPhotos([]);
    setCurrentIndex(0);
    setSwipes([]);
    setIsComplete(false);
    setPendingUndo(null);
  }, []);

  const advanceToNext = useCallback(async (swipeList: SwipeAction[]) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= photos.length) {
      setIsComplete(true);
      setIsSessionActive(false);
      if (monthKey) { await markMonthCompleted(monthKey); await clearSession(monthKey); }
    } else {
      setCurrentIndex(nextIndex);
      await persistSession(nextIndex, swipeList);
    }
  }, [currentIndex, photos.length, monthKey, persistSession]);

  const swipeLeft = useCallback((assetId: string, filename?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const swipe: SwipeAction = { assetId, action: 'delete', timestamp: Date.now() };
    const newSwipes = [...swipes, swipe];
    setSwipes(newSwipes);
    if (monthKey) recordSwipeAction(monthKey, 'delete', 0).catch(() => {});
    if (pendingUndoRef.current) clearTimeout(pendingUndoRef.current.timeoutId);
    const photo = photos.find(p => p.id === assetId);
    const trashItem: TrashItem = { assetId, uri: photo?.uri || null, filename: filename || photo?.filename || 'Unknown', deletedAt: Date.now(), monthKey: monthKey || '', monthLabel: monthKey ? getMonthLabel(monthKey) : '' };
    const timeoutId = setTimeout(async () => { await addToTrash(trashItem); setPendingUndo(null); }, UNDO_TIMEOUT_MS);
    setPendingUndo({ assetId, timeoutId });
    advanceToNext(newSwipes);
  }, [swipes, pendingUndo, photos, monthKey, advanceToNext]);

  const swipeRight = useCallback((assetId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const swipe: SwipeAction = { assetId, action: 'keep', timestamp: Date.now() };
    const newSwipes = [...swipes, swipe];
    setSwipes(newSwipes);
    if (monthKey) recordSwipeAction(monthKey, 'keep').catch(() => {});
    advanceToNext(newSwipes);
  }, [swipes, monthKey, advanceToNext]);

  const undoDelete = useCallback(() => {
    if (!pendingUndoRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTimeout(pendingUndoRef.current.timeoutId);
    const newSwipes = swipes.filter(s => s.assetId !== pendingUndoRef.current!.assetId);
    setSwipes(newSwipes);
    removeFromTrash(pendingUndoRef.current.assetId).catch(() => {});
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    setPendingUndo(null);
    if (monthKey) persistSession(newIndex, newSwipes);
  }, [pendingUndoRef, swipes, currentIndex, monthKey, persistSession]);

  const skipPhoto = useCallback(() => {
    const swipe: SwipeAction = { assetId: photos[currentIndex]?.id || '', action: 'keep', timestamp: Date.now() };
    const newSwipes = [...swipes, swipe];
    setSwipes(newSwipes);
    advanceToNext(newSwipes);
  }, [photos, currentIndex, swipes, advanceToNext]);

  const getCurrentPhoto = useCallback((): PhotoAsset | null => {
    return currentIndex < photos.length ? photos[currentIndex] : null;
  }, [photos, currentIndex]);

  const getNextPhoto = useCallback((): PhotoAsset | null => {
    return currentIndex + 1 < photos.length ? photos[currentIndex + 1] : null;
  }, [photos, currentIndex]);

  const getProgress = useCallback(() => {
    const reviewed = swipes.length;
    const deleted = swipes.filter(s => s.action === 'delete').length;
    const kept = swipes.filter(s => s.action === 'keep').length;
    return { total: photos.length, reviewed, deleted, kept };
  }, [swipes, photos.length]);

  return (
    <CleanSessionContext.Provider value={{ monthKey, photos, currentIndex, isSessionActive, isComplete, pendingUndo, swipes, startSession, endSession, swipeLeft, swipeRight, undoDelete, skipPhoto, getCurrentPhoto, getNextPhoto, getProgress }}>
      {children}
    </CleanSessionContext.Provider>
  );
}