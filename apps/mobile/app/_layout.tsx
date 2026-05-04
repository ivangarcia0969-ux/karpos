import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 2 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAF7F2' },
          headerTitleStyle: { color: '#1B2A29' },
          contentStyle: { backgroundColor: '#FAF7F2' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Karpos' }} />
        <Stack.Screen name="login" options={{ title: 'Ingresar' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
