import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Función para obtener la sesión guardada en SecureStore
const getSession = async () => {
  try {
    const session = await SecureStore.getItemAsync("session_token");
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error("❌ Error obteniendo la sesión:", error);
    return null;
  }
};

// Instancia de Axios con configuración base
const api = axios.create({
  baseURL: "https://maximum-shrew-firmly.ngrok-free.app",
  timeout: 10000,
});

// Interceptor para agregar el token solo en rutas protegidas
api.interceptors.request.use(
  async (config) => {
    if (config.url === "/profile" || config.url === "/logout") {
      const session = await getSession();
      if (session?.token) {
        console.log("📡 Enviando token en:", config.url, session.token);
        config.headers.Authorization = `Bearer ${session.token}`;
      } else {
        console.warn("⚠️ No hay token en SecureStore para", config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Función de login corregida
export const login = async (username, password) => {
  try {
    console.log("📡 Enviando login con:", { username, password });

    const response = await api.post("/auth", { username, password });
    console.log("✅ Respuesta del servidor:", response.data);

    if (!response.data?.data) {
      console.error("❌ Error: No se recibió información del usuario");
      throw new Error("Credenciales incorrectas");
    }

    // Almacena solo el objeto de usuario (sin envolver en "data")
    const userData = response.data.data;

    await SecureStore.setItemAsync("session_token", JSON.stringify(userData));

    return userData; // Devuelve el objeto con token y demás datos
  } catch (error) {
    console.error("❌ Error en login:", error?.response?.data?.message || error.message);
    throw new Error("Usuario o contraseña incorrectos");
  }
};

// Función para obtener el perfil del usuario
export const getProfile = async () => {
  try {
    console.log("📡 Solicitando perfil del usuario...");
    const response = await api.get("/profile");
    if (!response.data) {
      throw new Error("No se pudo obtener el perfil");
    }
    console.log("✅ Perfil obtenido:", response.data);
    return response.data; // Se espera que el backend devuelva un objeto con { message, user }
  } catch (error) {
    console.error("❌ Error obteniendo perfil:", error?.response?.data || error.message);
    return null;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await api.post("/logout");
    await SecureStore.deleteItemAsync("session_token");
    console.log("✅ Sesión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error cerrando sesión:", error);
    throw error;
  }
};

export default api;