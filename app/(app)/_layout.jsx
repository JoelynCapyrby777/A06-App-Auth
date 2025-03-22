import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../utils/ctx';

export default function AppLayout() {
  const { session, isLoading } = useSession();  // ✅ Ahora está correcto

  console.log("Estado de sesión:", session); 

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <Stack />;
}
