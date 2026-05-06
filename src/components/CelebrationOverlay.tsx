import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../utils/theme';

interface CelebrationOverlayProps {
  visible: boolean;
  monthLabel: string;
  onDismiss: () => void;
}

export function CelebrationOverlay({ visible, monthLabel, onDismiss }: CelebrationOverlayProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 150 }));
      scale.value = withDelay(300, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(() => runOnJS(onDismiss)(), 2500);
      return () => clearTimeout(timer);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 0;
      checkScale.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const checkmarkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: scale.value }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.checkmarkCircle, checkmarkStyle]}>
          <Ionicons name="checkmark" size={64} color={Colors.keep} />
        </Animated.View>
        <Animated.View style={textStyle}>
          <Text style={styles.title}>Month Complete!</Text>
          <Text style={styles.subtitle}>You've reviewed all photos in {monthLabel}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(13, 13, 13, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  contentContainer: { alignItems: 'center', gap: Spacing.lg },
  checkmarkCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.keepGlow, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.keep },
  title: { ...Typography.title, color: Colors.text, textAlign: 'center' },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
});