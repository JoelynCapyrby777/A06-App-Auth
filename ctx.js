import { useContext, createContext } from "react";
import { useStorageState } from "./useStorageState";

const AuthContext = createContext({
  signIn: (email) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  return useContext(AuthContext);
}

// Proveedor de sesión
export function SessionProvider({ children }) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: (email) => {
          if (session) return; 
          setSession({ user: email }); 
        },
        signOut: () => {
          if (!session) return; 
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
