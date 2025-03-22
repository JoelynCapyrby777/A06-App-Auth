import { View, Text, Button, StyleSheet } from "react-native";
import { useSession } from "../../utils/ctx";

export default function Main() {
  const { token, signOut } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      {token ? (
        <View style={styles.tokenContainer}>
          <Text style={styles.token}>Token: {token}</Text>
        </View>
      ) : (
        <Text style={styles.noSession}>No has iniciado sesión.</Text>
      )}
      
      {token && (
        <Button title="Cerrar Sesión" onPress={signOut} color="#FF4D4D" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f9",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  tokenContainer: {
    backgroundColor: "#fff", 
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  token: {
    fontSize: 16,
    color: "#333", 
    marginBottom: 10,
  },
  noSession: {
    fontSize: 16,
    color: "#888", 
    fontStyle: "italic",
  },
});
