import { MediaType } from 'expo-media-library';

export interface PhotoAsset {
  id: string;
  uri: string | null;
  filename: string;
  width: number | null;
  height: number | null;
  creationTime: number;
  mediaType: MediaType;
}

export interface MonthGroup {
  key: string;
  year: number;
  month: number;
  label: string;
  thumbnailUri: string | null;
  assetCount: number;
  assetIds: string[];
  progress: {
    total: number;
    reviewed: number;
    deleted: number;
    kept: number;
  };
  isComplete: boolean;
}

export interface SwipeAction {
  assetId: string;
  action: 'delete' | 'keep';
  timestamp: number;
}

export interface SessionState {
  monthKey: string;
  currentIndex: number;
  swipes: SwipeAction[];
  startTime: number;
  lastActiveTime: number;
}

export interface TrashItem {
  assetId: string;
  uri: string | null;
  filename: string;
  deletedAt: number;
  monthKey: string;
  monthLabel: string;
}

export interface AppStats {
  totalReviewed: number;
  totalDeleted: number;
  totalKept: number;
  totalSpaceFreed: number;
  monthStats: Record<string, {
    reviewed: number;
    deleted: number;
    kept: number;
  }>;
}
