import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../src/utils/theme';
import { GalleryProvider } from '../src/providers/GalleryProvider';
import { CleanSessionProvider } from '../src/providers/CleanSessionProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GalleryProvider>
        <CleanSessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="clean/[month]"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
          </Stack>
        </CleanSessionProvider>
      </GalleryProvider>
    </GestureHandlerRootView>
  );
}