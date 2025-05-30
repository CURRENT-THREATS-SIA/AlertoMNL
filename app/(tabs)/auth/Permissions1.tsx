import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ButtonReg = ({ text, onPress }: { text: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export const Permissions1: React.FC = () => {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop:250, marginBottom: 250 }}>
          <Image
            source={require("../../../assets/images/microphoneIcon.png")}
            style={{ width: 60, height: 60, marginRight: 16 }}
          />
          <View>
            <Text style={styles.title}>Record voice</Text>
            <Text style={styles.subtitle}>Please allow location permission.</Text>
          </View>
        </View>

        <ButtonReg text="Allow" onPress={() => router.push("/auth/TermsAndCondition")} />

        <TouchableOpacity>
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

export default Permissions1;
