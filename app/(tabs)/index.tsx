import React, { useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGallery } from '../../src/providers/GalleryProvider';
import { MonthCard } from '../../src/components/MonthCard';
import { PermissionGate } from '../../src/components/PermissionGate';
import { EmptyState } from '../../src/components/EmptyState';
import { Colors, Spacing, Typography } from '../../src/utils/theme';
import { formatFileSize } from '../../src/utils/formatters';

export default function MonthListScreen() {
  const { permissionStatus, requestPermission, months, isLoading, error, refresh, stats } = useGallery();
  const onRefresh = useCallback(async () => { await refresh(); }, [refresh]);

  if (permissionStatus && permissionStatus !== 'granted') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PermissionGate onRequestPermission={requestPermission} />
      </SafeAreaView>
    );
  }

  if (error && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}><Text style={styles.appTitle}>Rinse</Text></View>
        <EmptyState icon="alert-circle-outline" title="Something went wrong" subtitle={error} />
      </SafeAreaView>
    );
  }

  if (!isLoading && months.length === 0 && permissionStatus === 'granted') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Rinse</Text>
          <Text style={styles.subtitle}>Swipe to clean your gallery</Text>
        </View>
        <EmptyState icon="images-outline" title="No photos found" subtitle="Your photo library appears to be empty." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Rinse</Text>
        <Text style={styles.subtitle}>Tap a month to start cleaning</Text>
      </View>
      {stats && (stats.totalReviewed > 0 || stats.totalDeleted > 0) && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalReviewed}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.delete }]}>{stats.totalDeleted}</Text>
            <Text style={styles.statLabel}>Deleted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatFileSize(stats.totalSpaceFreed)}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>
      )}
      <FlatList
        data={months}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => <MonthCard month={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  appTitle: { ...Typography.title, color: Colors.text, fontSize: 36 },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  statsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { ...Typography.heading, color: Colors.text, fontWeight: '700' },
  statLabel: { ...Typography.badge, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  list: { paddingBottom: Spacing.xl },
});