import { View, Text, TouchableOpacity } from "react-native";
import { useSession } from "../../ctx";

export default function Main() {
  const { session, signOut } = useSession();  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {session ? `Bienvenido, ${session.user}` : "Auth App"}
      </Text>

      {session && (
        <TouchableOpacity
          onPress={signOut}
          style={{
            backgroundColor: "#FF3B30",
            padding: 10,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
