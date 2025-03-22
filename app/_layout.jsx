import { Slot } from 'expo-router';
import { SessionProvider } from '../utils/ctx';

export default function Root() {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}
