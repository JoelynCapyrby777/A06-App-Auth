import { useContext, createContext } from "react";
import { useStorageState } from "./useStorageState";

const AuthContext = createContext({
  signIn: (email) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  token: null,
});

export function useSession() {
  return useContext(AuthContext);
}

// Proveedor de sesión
export function SessionProvider({ children }) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const [token, setToken] = useStorageState("token"); // Almacenar el token manualmente

  // Función para generar un token manualmente
  const generateToken = (email) => {
    // Crear un "payload" simple con la información que deseas incluir en el token (como el email)
    const payload = { email, timestamp: Date.now() };
    
    // Convertir el payload a una cadena de texto
    const stringPayload = JSON.stringify(payload);
    
    // Codificar el payload como base64
    const encodedToken = btoa(stringPayload); // "btoa" convierte a base64

    // Almacenar el token generado
    setToken(encodedToken);
    return encodedToken; // Opcionalmente, devolver el token
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: (email) => {
          if (session) return; 
          setSession({ user: email });

          // Generar y almacenar el token manualmente al hacer login
          const newToken = generateToken(email);
          console.log("Token generado:", newToken); // Ver el token en la consola
        },
        signOut: () => {
          if (!session) return;
          setSession(null);
          setToken(null); // Limpiar el token al cerrar sesión
        },
        session,
        isLoading,
        token, // Proveer el token en el contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
