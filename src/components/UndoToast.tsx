import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../utils/theme';
import { UNDO_TIMEOUT_MS } from '../utils/constants';

interface UndoToastProps {
  visible: boolean;
  message?: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ visible, message = 'Photo deleted', onUndo, onDismiss }: UndoToastProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 200 });
      const timer = setTimeout(() => onDismiss(), UNDO_TIMEOUT_MS);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.message}>{message}</Text>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onUndo(); }} style={styles.undoButton}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: Spacing.lg, left: Spacing.lg, right: Spacing.lg, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  content: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  message: { ...Typography.body, color: Colors.text, flex: 1 },
  undoButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.primaryDim, borderRadius: BorderRadius.sm },
  undoText: { ...Typography.body, color: Colors.primary, fontWeight: '700' },
});