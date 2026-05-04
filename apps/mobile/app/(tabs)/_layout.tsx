import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0E5C3A',
        tabBarInactiveTintColor: '#3B2A1F',
        tabBarStyle: { backgroundColor: '#FAF7F2' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="bitacora" options={{ title: 'Bitácora' }} />
      <Tabs.Screen name="cosecha" options={{ title: 'Cosecha' }} />
      <Tabs.Screen name="sync" options={{ title: 'Sync' }} />
    </Tabs>
  );
}
