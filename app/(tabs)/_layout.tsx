import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../src/utils/theme';
import { useEffect, useState } from 'react';
import { getTrashCount } from '../../src/storage/trashStorage';

export default function TabLayout() {
  const [trashCount, setTrashCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => { const count = await getTrashCount(); setTrashCount(count); };
    loadCount();
    const interval = setInterval(loadCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border, borderTopWidth: 1, height: 56, paddingBottom: 4 },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarLabelStyle: { ...Typography.badge, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="trash" options={{ title: 'Trash', tabBarIcon: ({ color, size }) => <Ionicons name="trash-outline" size={size} color={color} />, tabBarBadge: trashCount > 0 ? trashCount : undefined }} />
    </Tabs>
  );
}