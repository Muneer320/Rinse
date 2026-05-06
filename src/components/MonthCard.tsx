import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '../utils/theme';
import type { MonthGroup } from '../utils/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MonthCard({ month }: { month: MonthGroup }) {
  const router = useRouter();
  const progressPercent = month.progress.total > 0 ? Math.round((month.progress.reviewed / month.progress.total) * 100) : 0;

  return (
    <Pressable onPress={() => router.push(`/clean/${month.key}`)} style={styles.container}>
      <View style={styles.card}>
        {month.thumbnailUri ? (
          <Image source={{ uri: month.thumbnailUri }} style={styles.backgroundImage} contentFit="cover" blurRadius={30} transition={150} />
        ) : (
          <View style={styles.backgroundPlaceholder} />
        )}
        <View style={styles.gradientOverlay} pointerEvents="none" />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.monthInfo}>
              <Text style={styles.monthLabel}>{month.label}</Text>
              <Text style={styles.photoCount}>{month.progress.total} photo{month.progress.total !== 1 ? 's' : ''}</Text>
            </View>
            {month.isComplete ? (
              <View style={styles.badge}><Ionicons name="checkmark-circle" size={28} color={Colors.keep} /></View>
            ) : progressPercent > 0 ? (
              <View style={styles.ringWrapper}>
                <Text style={styles.ringText}>{progressPercent}</Text>
              </View>
            ) : (
              <View style={styles.badge}><Ionicons name="chevron-forward" size={24} color={Colors.text} /></View>
            )}
          </View>
          {progressPercent > 0 && !month.isComplete && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>{progressPercent}% reviewed</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const cardWidth = SCREEN_WIDTH - Spacing.lg * 2;

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  card: { width: cardWidth, height: 140, borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  backgroundImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  backgroundPlaceholder: { ...StyleSheet.absoluteFill, backgroundColor: Colors.surface },
  gradientOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.55)' },
  content: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthInfo: { flex: 1 },
  monthLabel: { ...Typography.heading, color: Colors.text, fontWeight: '700' },
  photoCount: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  badge: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  ringWrapper: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.full, borderWidth: 3, borderColor: Colors.primary },
  ringText: { fontSize: 10, fontWeight: '700', color: Colors.text },
  progressContainer: { gap: 6 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.full },
  progressText: { ...Typography.badge, color: Colors.textSecondary },
});