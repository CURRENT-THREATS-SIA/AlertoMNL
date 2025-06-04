import * as Location from "expo-location"; // added code m
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const ButtonReg = ({ text, onPress }: { text: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export const LocationPermission: React.FC = () => {
  const router = useRouter(); 
  // next line is the added code 15-23 m
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      router.push("/auth/Permissions1");
    } else {
      alert("Location permission is required to proceed.");
    }
  };
  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop:250, marginBottom: 250 }}>
          <Image
            source={require("../../../assets/images/locationIcon.png")}
            style={{ width: 60, height: 60, marginRight: 16 }}
          />
          <View>
            <Text style={styles.title}>Track yourself</Text>
            <Text style={styles.subtitle}>Please allow location permission.</Text>
          </View>
        </View>

        
        <ButtonReg text="Allow" onPress={requestLocationPermission} />
        {/* modified line 42-44 */}
        <TouchableOpacity onPress={() => router.push("/auth/Permissions1")}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },

  content: {
    alignItems: "center",
    marginBottom: 32,
  },
  distance: {
    width: 60,
    height: 60,
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#e02323",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#e02323",
    paddingVertical: 12,
    paddingHorizontal: 130,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  skip: {
    color: "#e02323",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LocationPermission; // modified
