import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Asset, Query, AssetField, MediaType, requestPermissionsAsync, getPermissionsAsync } from 'expo-media-library';
import { PHOTOS_PER_PAGE } from '../utils/constants';
import { getMonthKey, getMonthLabel, sortMonthKeysDescending } from '../utils/formatters';
import type { PhotoAsset, MonthGroup, AppStats } from '../utils/types';
import { getStats } from '../storage/statsStorage';
import { getCompletedMonths, loadSession } from '../storage/sessionStorage';

interface GalleryContextValue {
  permissionStatus: string | null;
  accessPrivileges: string | null;
  requestPermission: () => Promise<void>;
  months: MonthGroup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getPhotosForMonth: (monthKey: string) => Promise<PhotoAsset[]>;
  stats: AppStats | null;
  refreshStats: () => Promise<void>;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider');
  return ctx;
}

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [accessPrivileges, setAccessPrivileges] = useState<string | null>(null);
  const [months, setMonths] = useState<MonthGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const monthCacheRef = useRef<Map<string, PhotoAsset[]>>(new Map());

  const refreshStats = useCallback(async () => {
    const s = await getStats();
    setStats(s);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const response = await requestPermissionsAsync();
      setPermissionStatus(response.status);
      setAccessPrivileges(response.accessPrivileges || null);
      if (response.status === 'granted') await loadMonths();
    } catch (e) {
      console.error('[GalleryProvider] Permission request failed:', e);
      setError('Failed to request photo permission');
    }
  }, []);

  const loadMonths = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const permResponse = await getPermissionsAsync();
      if (permResponse.status !== 'granted') {
        setPermissionStatus(permResponse.status);
        setAccessPrivileges(permResponse.accessPrivileges || null);
        setIsLoading(false);
        return;
      }
      setPermissionStatus(permResponse.status);
      setAccessPrivileges(permResponse.accessPrivileges || null);

      const allMeta: Array<{ id: string; filename: string | null; creationTime: number | null }> = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const results = await new Query()
          .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
          .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
          .limit(PHOTOS_PER_PAGE)
          .offset(offset)
          .exeForMetadata();

        if (results.length === 0) { hasMore = false; break; }
        for (const meta of results) {
          allMeta.push({ id: meta.id, filename: meta.filename, creationTime: meta.creationTime });
        }
        if (results.length < PHOTOS_PER_PAGE) hasMore = false;
        else offset += PHOTOS_PER_PAGE;
      }

      const monthMap = new Map<string, { ids: string[]; creationTimes: number[] }>();
      for (const meta of allMeta) {
        if (meta.creationTime === null) continue;
        const monthKey = getMonthKey(meta.creationTime);
        if (!monthMap.has(monthKey)) monthMap.set(monthKey, { ids: [], creationTimes: [] });
        monthMap.get(monthKey)!.ids.push(meta.id);
      }

      const sortedKeys = sortMonthKeysDescending(Array.from(monthMap.keys()));
      const completedMonths = await getCompletedMonths();
      const monthGroups: MonthGroup[] = [];

      for (const key of sortedKeys) {
        const entry = monthMap.get(key)!;
        let thumbnailUri: string | null = null;
        try {
          const asset = new Asset(entry.ids[0]);
          thumbnailUri = await asset.getUri();
        } catch { }

        const session = await loadSession(key);
        const reviewed = session?.swipes.length || 0;
        const deleted = session?.swipes.filter(s => s.action === 'delete').length || 0;
        const kept = session?.swipes.filter(s => s.action === 'keep').length || 0;

        monthGroups.push({
          key, year: parseInt(key.split('-')[0], 10), month: parseInt(key.split('-')[1], 10),
          label: getMonthLabel(key), thumbnailUri, assetCount: entry.ids.length, assetIds: entry.ids,
          progress: { total: entry.ids.length, reviewed, deleted, kept },
          isComplete: completedMonths.includes(key),
        });
      }
      setMonths(monthGroups);
      await refreshStats();
    } catch (e) {
      console.error('[GalleryProvider] Failed to load months:', e);
      setError('Failed to load photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  const getPhotosForMonth = useCallback(async (monthKey: string): Promise<PhotoAsset[]> => {
    const cached = monthCacheRef.current.get(monthKey);
    if (cached) return cached;
    const month = months.find(m => m.key === monthKey);
    if (!month) return [];
    const photos: PhotoAsset[] = [];
    for (const assetId of month.assetIds) {
      try {
        const asset = new Asset(assetId);
        const [uri, filename, width, height, creationTime, mediaType] = await Promise.all([
          asset.getUri(), asset.getFilename(),
          asset.getWidth().catch(() => null), asset.getHeight().catch(() => null),
          asset.getCreationTime(), asset.getMediaType(),
        ]);
        photos.push({ id: assetId, uri, filename, width, height, creationTime: creationTime || 0, mediaType });
      } catch (e) {
        console.error('[GalleryProvider] Failed to load asset:', assetId, e);
      }
    }
    photos.sort((a, b) => b.creationTime - a.creationTime);
    monthCacheRef.current.set(monthKey, photos);
    return photos;
  }, [months]);

  const refresh = useCallback(async () => {
    monthCacheRef.current.clear();
    await loadMonths();
  }, [loadMonths]);

  useEffect(() => {
    (async () => {
      const permResponse = await getPermissionsAsync();
      setPermissionStatus(permResponse.status);
      setAccessPrivileges(permResponse.accessPrivileges || null);
      if (permResponse.status === 'granted') await loadMonths();
      else setIsLoading(false);
    })();
  }, []);

  return (
    <GalleryContext.Provider value={{ permissionStatus, accessPrivileges, requestPermission, months, isLoading, error, refresh, getPhotosForMonth, stats, refreshStats }}>
      {children}
    </GalleryContext.Provider>
  );
}