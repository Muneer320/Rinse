import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-media-library';
import { EmptyState } from '../../src/components/EmptyState';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/utils/theme';
import { formatRelativeTime } from '../../src/utils/formatters';
import { getTrashItems, removeFromTrash, emptyTrash } from '../../src/storage/trashStorage';
import type { TrashItem } from '../../src/utils/types';

export default function TrashScreen() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    const trash = await getTrashItems();
    setItems(trash);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 3000);
    return () => clearInterval(interval);
  }, [loadItems]);

  const handleRestore = useCallback(async (assetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await removeFromTrash(assetId);
    await loadItems();
  }, [loadItems]);

  const handleDeleteForever = useCallback((item: TrashItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Permanently', `Are you sure you want to permanently delete "${item.filename}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Forever', style: 'destructive', onPress: async () => {
        try { const asset = new Asset(item.assetId); await asset.delete(); }
        catch (e) {
          console.error('[TrashScreen] Delete failed:', e);
          try { const asset = new Asset(item.assetId); await Asset.delete([asset]); }
          catch (e2) { console.error('[TrashScreen] Static delete also failed:', e2); Alert.alert('Error', 'Could not delete this photo.'); return; }
        }
        await removeFromTrash(item.assetId);
        await loadItems();
      }},
    ]);
  }, [loadItems]);

  const handleEmptyAll = useCallback(() => {
    if (items.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Empty Trash', `Are you sure you want to permanently delete all ${items.length} photo${items.length !== 1 ? 's' : ''}? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: async () => {
        for (const item of items) {
          try { const asset = new Asset(item.assetId); await asset.delete(); }
          catch (e) { console.error('[TrashScreen] Bulk delete failed for:', item.assetId, e); }
        }
        await emptyTrash();
        await loadItems();
      }},
    ]);
  }, [items, loadItems]);

  const renderItem = ({ item }: { item: TrashItem }) => (
    <View style={styles.trashItem}>
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.thumbnail} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}><Ionicons name="image-outline" size={24} color={Colors.textTertiary} /></View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemFilename} numberOfLines={1}>{item.filename}</Text>
        <Text style={styles.itemDate}>{item.monthLabel} - {formatRelativeTime(item.deletedAt)}</Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable style={[styles.actionButton, styles.restoreButton]} onPress={() => handleRestore(item.assetId)}>
          <Ionicons name="arrow-undo-outline" size={20} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Restore</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteForever(item)}>
          <Ionicons name="trash-outline" size={20} color={Colors.delete} />
          <Text style={[styles.actionText, { color: Colors.delete }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trash</Text>
        {items.length > 0 && (
          <Pressable style={styles.emptyButton} onPress={handleEmptyAll}>
            <Text style={styles.emptyButtonText}>Empty All</Text>
          </Pressable>
        )}
      </View>
      {items.length > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.warningText}>Photos are not permanently deleted until you confirm.</Text>
        </View>
      )}
      {items.length === 0 && !isLoading ? (
        <EmptyState icon="trash-outline" title="Trash is empty" subtitle="Deleted photos will appear here for permanent removal." />
      ) : (
        <FlatList data={items} keyExtractor={(item) => item.assetId} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { ...Typography.title, color: Colors.text, fontSize: 36 },
  emptyButton: { backgroundColor: Colors.deleteDim, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  emptyButtonText: { ...Typography.body, color: Colors.delete, fontWeight: '700' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.md },
  warningText: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
  list: { paddingBottom: Spacing.xl },
  trashItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, borderRadius: BorderRadius.md, padding: Spacing.sm, gap: Spacing.md },
  thumbnail: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated },
  thumbnailPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, gap: 2 },
  itemFilename: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  itemDate: { ...Typography.caption, color: Colors.textSecondary },
  itemActions: { flexDirection: 'row', gap: Spacing.sm },
  actionButton: { alignItems: 'center', gap: 2, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, minWidth: 50 },
  restoreButton: { backgroundColor: Colors.primaryDim },
  deleteButton: { backgroundColor: Colors.deleteDim },
  actionText: { fontSize: 10, fontWeight: '700' },
});