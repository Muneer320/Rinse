import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGallery } from '../../src/providers/GalleryProvider';
import { useCleanSession } from '../../src/providers/CleanSessionProvider';
import { SwipeCard } from '../../src/components/SwipeCard';
import { UndoToast } from '../../src/components/UndoToast';
import { CelebrationOverlay } from '../../src/components/CelebrationOverlay';
import { EmptyState } from '../../src/components/EmptyState';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/utils/theme';
import { getMonthLabel } from '../../src/utils/formatters';
import type { PhotoAsset } from '../../src/utils/types';

export default function CleanScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const router = useRouter();
  const { getPhotosForMonth, refresh, refreshStats } = useGallery();
  const session = useCleanSession();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      try {
        const monthPhotos = await getPhotosForMonth(month);
        if (monthPhotos.length > 0) {
          await session.startSession(month, monthPhotos);
          setPhotos(monthPhotos);
        }
      } catch (e) {
        console.error('[CleanScreen] Failed to load photos:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, [month]);

  useEffect(() => {
    if (session.isComplete && !showCelebration) {
      setShowCelebration(true);
      refreshStats();
    }
  }, [session.isComplete, showCelebration, refreshStats]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      session.endSession();
      return false;
    });
    return () => backHandler.remove();
  }, [session]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    session.endSession();
    router.back();
  }, [session, router]);

  const handleCelebrationDismiss = useCallback(async () => {
    setShowCelebration(false);
    session.endSession();
    await refresh();
    router.back();
  }, [session, refresh, router]);

  const currentPhoto = session.getCurrentPhoto();
  const nextPhoto = session.getNextPhoto();
  const progress = session.getProgress();
  const progressPercent = progress.total > 0 ? progress.reviewed / progress.total : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}><Ionicons name="chevron-back" size={28} color={Colors.text} /></Pressable>
          <View style={styles.headerCenter}><Text style={styles.headerTitle}>{getMonthLabel(month)}</Text></View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.cardArea}><EmptyState icon="images-outline" title="Loading photos..." /></View>
      </SafeAreaView>
    );
  }

  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}><Ionicons name="chevron-back" size={28} color={Colors.text} /></Pressable>
          <View style={styles.headerCenter}><Text style={styles.headerTitle}>{getMonthLabel(month)}</Text></View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.cardArea}><EmptyState icon="images-outline" title="No photos in this month" subtitle="Try selecting a different month." /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}><Ionicons name="chevron-back" size={28} color={Colors.text} /></Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{getMonthLabel(month)}</Text>
          <Text style={styles.headerCount}>{progress.reviewed + (session.isComplete ? 0 : 1)} / {progress.total}</Text>
        </View>
        <View style={styles.backButton} />
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
        </View>
      </View>
      <View style={styles.cardArea}>
        {currentPhoto && !session.isComplete ? (
          <>
            {nextPhoto && (
              <View style={styles.nextCardContainer}>
                <SwipeCard photo={nextPhoto} isTopCard={false} index={session.currentIndex + 1} onSwipeLeft={(id) => session.swipeLeft(id)} onSwipeRight={(id) => session.swipeRight(id)} />
              </View>
            )}
            <SwipeCard photo={currentPhoto} isTopCard={true} index={session.currentIndex} onSwipeLeft={(id, fn) => session.swipeLeft(id, fn)} onSwipeRight={(id) => session.swipeRight(id)} />
          </>
        ) : session.isComplete ? (
          <EmptyState icon="checkmark-circle-outline" title="All done!" subtitle="You've reviewed every photo in this month." />
        ) : (
          <EmptyState icon="images-outline" title="No more photos" />
        )}
      </View>
      {currentPhoto && !session.isComplete && (
        <View style={styles.actionBar}>
          <Pressable style={styles.actionButton} onPress={() => session.swipeLeft(currentPhoto.id, currentPhoto.filename)}>
            <Ionicons name="trash-outline" size={28} color={Colors.delete} />
            <Text style={[styles.actionLabel, { color: Colors.delete }]}>Delete</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.skipButton]} onPress={() => session.skipPhoto()}>
            <Ionicons name="play-skip-forward-outline" size={24} color={Colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: Colors.textSecondary }]}>Skip</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => session.swipeRight(currentPhoto.id)}>
            <Ionicons name="checkmark-circle-outline" size={28} color={Colors.keep} />
            <Text style={[styles.actionLabel, { color: Colors.keep }]}>Keep</Text>
          </Pressable>
        </View>
      )}
      <UndoToast visible={!!session.pendingUndo} onUndo={() => session.undoDelete()} onDismiss={() => {}} />
      <CelebrationOverlay visible={showCelebration} monthLabel={getMonthLabel(month)} onDismiss={handleCelebrationDismiss} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { ...Typography.subheading, color: Colors.text, fontWeight: '700' },
  headerCount: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  progressContainer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full },
  cardArea: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  nextCardContainer: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: Spacing.xl },
  actionButton: { alignItems: 'center', gap: 4, padding: Spacing.sm },
  skipButton: { opacity: 0.7 },
  actionLabel: { ...Typography.badge, fontWeight: '700' },
});