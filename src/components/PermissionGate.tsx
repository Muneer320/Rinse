import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../utils/theme';

export function PermissionGate({ onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="images-outline" size={72} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Access Your Photos</Text>
      <Text style={styles.subtitle}>
        Rinse needs access to your photo library to help you clean and organize it. All processing happens on your device. No photos are ever uploaded.
      </Text>
      <Pressable style={styles.button} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRequestPermission(); }}>
        <Text style={styles.buttonText}>Grant Access</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, backgroundColor: Colors.background, gap: Spacing.lg },
  iconContainer: { width: 120, height: 120, borderRadius: BorderRadius.xl, backgroundColor: Colors.primaryDim, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  title: { ...Typography.title, color: Colors.text, textAlign: 'center' },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.sm },
  buttonText: { ...Typography.body, color: Colors.text, fontWeight: '700' },
});