import { Slot } from 'expo-router';
import { SessionProvider } from '../utils/ctx';
import { Stack } from "expo-router/stack";

export default function Root() {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}
