import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../utils/theme';

interface ProgressBarProps {
  total: number;
  reviewed: number;
  deleted: number;
  kept: number;
}

export function ProgressBar({ total, reviewed, deleted, kept }: ProgressBarProps) {
  const percent = total > 0 ? (reviewed / total) * 100 : 0;
  const deletePercent = total > 0 ? (deleted / total) * 100 : 0;
  const keepPercent = total > 0 ? (kept / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countText}>
          {reviewed} / {total}
        </Text>
        <Text style={styles.percentText}>{Math.round(percent)}%</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.deleteSegment,
            { width: `${deletePercent}%` },
          ]}
        />
        <View
          style={[
            styles.keepSegment,
            { width: `${keepPercent}%` },
          ]}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.delete }]} />
          <Text style={styles.legendText}>{deleted} deleted</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.keep }]} />
          <Text style={styles.legendText}>{kept} kept</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  countText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  percentText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  deleteSegment: {
    height: '100%',
    backgroundColor: Colors.delete,
  },
  keepSegment: {
    height: '100%',
    backgroundColor: Colors.keep,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 11,
  },
});