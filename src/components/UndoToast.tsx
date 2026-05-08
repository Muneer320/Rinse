import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../utils/theme';

interface UndoToastProps {
  visible: boolean;
  message?: string;
  onUndo: () => void;
}

export function UndoToast({ visible, message = 'Photo marked for deletion', onUndo }: UndoToastProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 100 }]}>
      <View style={styles.content}>
        <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
        <Pressable accessibilityRole="button" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onUndo(); }} style={styles.undoButton}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: Spacing.lg, right: Spacing.lg, zIndex: 100, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  message: { ...Typography.body, color: Colors.text, flex: 1 },
  undoButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.primaryDim, borderRadius: BorderRadius.sm },
  undoText: { ...Typography.body, color: Colors.primary, fontWeight: '700' },
});
