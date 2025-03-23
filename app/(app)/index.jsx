import { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useSession } from "../../utils/ctx";
import { getProfile, logout } from "../../utils/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Main() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Redirigir a sign-in si no hay sesión una vez que termina la carga
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
    }
  }, [loading, session]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        try {
          const data = await getProfile();
          // Validamos que la respuesta tenga la estructura esperada:
          if (!data || !data.user || !data.user.email) {
            throw new Error("Perfil incompleto o no disponible");
          }
          setProfile(data.user); // Almacenamos el objeto 'user'
        } catch (error) {
          console.error("❌ Error obteniendo perfil:", error.message || error);
          Alert.alert("Error", "No se pudo obtener tu perfil. Inténtalo más tarde.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();

    if (session) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) setExpoPushToken(token);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error);
    } finally {
      signOut();
      router.replace("/sign-in");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Bienvenido</Text>

      {session && profile ? (
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>
            📛 <Text style={styles.bold}>Nombre:</Text> {profile.name} {profile.lastName}
          </Text>
          <Text style={styles.profileText}>
            👤 <Text style={styles.bold}>Usuario:</Text> {profile.username}
          </Text>
          <Text style={styles.profileText}>
            📧 <Text style={styles.bold}>Correo:</Text> {profile.email}
          </Text>
        </View>
      ) : (
        <Text style={styles.noSession}>No se pudo cargar el perfil.</Text>
      )}

      {session && (
        <>
          <Button title="Cerrar Sesión" onPress={handleSignOut} color="#FF4D4D" />
          {expoPushToken ? (
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenText}>🔔 Token Notificaciones:</Text>
              <Text style={styles.tokenValue}>{expoPushToken}</Text>
            </View>
          ) : null}
          <Button title="Enviar Notificación" onPress={schedulePushNotification} color="#007BFF" />
        </>
      )}

      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationTitle}>📩 Notificación Recibida:</Text>
          <Text style={styles.notificationText}>
            <Text style={styles.bold}>Título:</Text> {notification.request.content.title}
          </Text>
          <Text style={styles.notificationText}>
            <Text style={styles.bold}>Mensaje:</Text> {notification.request.content.body}
          </Text>
        </View>
      )}
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📬 Notificación de prueba",
      body: "Este es un mensaje de prueba desde la app.",
      data: { extraData: "Alguna información extra" },
      sound: "default",
    },
    trigger: { seconds: 5 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Permisos denegados", "No se otorgaron permisos para notificaciones.");
      return;
    }
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error("ID del proyecto no encontrado");
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);
    } catch (error) {
      console.error("Error obteniendo token:", error);
    }
  } else {
    Alert.alert("Error", "Debes usar un dispositivo físico para recibir notificaciones.");
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f9",
    padding: 20,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  profileContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  profileText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  noSession: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 20,
  },
  notificationContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFEEBA",
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
  },
  tokenContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tokenValue: {
    fontSize: 12,
    color: "#555",
  },
});
