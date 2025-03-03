import { Slot } from 'expo-router';
import { SessionProvider } from '../ctx'; // ⚠️ Asegúrate de importar correctamente

export default function Root() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
