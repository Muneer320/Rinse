import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius } from '../utils/theme';
import { SWIPE_THRESHOLD } from '../utils/constants';
import type { PhotoAsset } from '../utils/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeCardProps {
  photo: PhotoAsset | null;
  isTopCard: boolean;
  index: number;
  onSwipeLeft: (assetId: string, filename?: string) => void;
  onSwipeRight: (assetId: string) => void;
}

export function SwipeCard({ photo, isTopCard, index, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const thresholdCrossed = useSharedValue(false);

  useAnimatedReaction(
    () => Math.abs(translateX.value),
    (absX) => {
      const threshold = SCREEN_WIDTH * SWIPE_THRESHOLD;
      if (absX > threshold && !thresholdCrossed.value) {
        thresholdCrossed.value = true;
        runOnJS(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); })();
      } else if (absX <= threshold && thresholdCrossed.value) {
        thresholdCrossed.value = false;
      }
    }
  );

  const panGesture = Gesture.Pan()
    .enabled(isTopCard && !!photo)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotate.value = interpolate(e.translationX, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-12, 0, 12], Extrapolate.CLAMP);
    })
    .onStart(() => { runOnJS(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); })(); })
    .onEnd((e) => {
      const threshold = SCREEN_WIDTH * SWIPE_THRESHOLD;
      const shouldSwipe = Math.abs(e.translationX) > threshold || Math.abs(e.velocityX) > 800;
      if (shouldSwipe) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH * 1.5, { damping: 20, stiffness: 200, velocity: e.velocityX });
        translateY.value = withSpring(e.translationY + direction * 100, { damping: 20, stiffness: 200, velocity: e.velocityY });
        if (direction > 0) runOnJS(onSwipeRight)(photo?.id || '');
        else runOnJS(onSwipeLeft)(photo?.id || '', photo?.filename);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
        rotate.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate.value}deg` }, { scale: isTopCard ? 1 : 0.95 }],
    opacity: isTopCard ? 1 : interpolate(Math.abs(translateX.value), [0, SCREEN_WIDTH * SWIPE_THRESHOLD], [1, 0.5], Extrapolate.CLAMP),
    zIndex: isTopCard ? 10 : 1,
  }));

  const deleteOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SCREEN_WIDTH * SWIPE_THRESHOLD, 0], [0.8, 0], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-SCREEN_WIDTH * SWIPE_THRESHOLD, 0], [1.2, 0.8], Extrapolate.CLAMP) }],
  }));

  const keepOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SCREEN_WIDTH * SWIPE_THRESHOLD], [0, 0.8], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, SCREEN_WIDTH * SWIPE_THRESHOLD], [0.8, 1.2], Extrapolate.CLAMP) }],
  }));

  if (!photo || !photo.uri) {
    return (
      <View style={[styles.card, styles.placeholderCard]}>
        <Ionicons name="image-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.placeholderText}>No photo available</Text>
      </View>
    );
  }

  return (
    <>
      {isTopCard ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Image source={{ uri: photo.uri ?? '' }} style={styles.image} contentFit="cover" transition={200} cachePolicy="memory-disk" />
            <View style={styles.infoBar}>
              <Text style={styles.filename} numberOfLines={1}>{photo.filename}</Text>
            </View>
            <Animated.View style={[styles.overlay, styles.deleteOverlay, deleteOverlayStyle]} pointerEvents="none">
              <Ionicons name="trash" size={80} color={Colors.delete} />
              <Text style={styles.overlayText}>DELETE</Text>
            </Animated.View>
            <Animated.View style={[styles.overlay, styles.keepOverlay, keepOverlayStyle]} pointerEvents="none">
              <Ionicons name="checkmark-circle" size={80} color={Colors.keep} />
              <Text style={styles.overlayText}>KEEP</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      ) : (
        <Animated.View style={[styles.card, cardStyle]}>
          <Image source={{ uri: photo.uri ?? '' }} style={styles.image} contentFit="cover" transition={200} cachePolicy="memory-disk" />
          <View style={styles.infoBar}>
            <Text style={styles.filename} numberOfLines={1}>{photo.filename}</Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', width: '100%', height: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden', backgroundColor: Colors.surface, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  image: { width: '100%', height: '100%' },
  infoBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.4)' },
  filename: { ...Typography.caption, color: Colors.text },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 12 },
  deleteOverlay: { backgroundColor: Colors.deleteDim },
  keepOverlay: { backgroundColor: Colors.keepDim },
  overlayText: { ...Typography.heading, color: Colors.text, letterSpacing: 3, fontWeight: '900' },
  placeholderCard: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  placeholderText: { ...Typography.body, color: Colors.textSecondary },
});