import { Mic } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RegularUserHome() {
  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* SOS Section */}
        <View style={styles.sosSection}>
          <View style={styles.helpText}>
            <Text style={styles.helpTextPrimary}>Help is just a click away!</Text>
            <Text style={styles.helpTextSecondary}>
              Click <Text style={styles.redText}>SOS button</Text> to call for help.
            </Text>
          </View>

          {/* SOS Button */}
          <TouchableOpacity style={styles.sosButton}>
            <View style={styles.sosRing1} />
            <View style={styles.sosRing2} />
            <View style={styles.sosRing3} />
            <View style={styles.sosCenter}>
              <Text style={styles.sosText}>SOS</Text>
            </View>
          </TouchableOpacity>

          {/* Location Info */}
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>Pandacan, Manila</Text>
            <Text style={styles.coordinatesText}>
              <Text style={styles.redText}>Latitude: </Text>
              <Text style={styles.boldText}>14.68</Text>
              <Text style={styles.redText}>  Longitude: </Text>
              <Text style={styles.boldText}>121.98</Text>
            </Text>
          </View>
        </View>

        {/* Voice Recording Button */}
        <TouchableOpacity style={styles.voiceButton}>
          <Mic size={24} color="#e02323" />
          <Text style={styles.voiceButtonText}>Voice Recording</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingTop: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e02323",
  },
  profileButton: {
    backgroundColor: "#e02323",
    padding: 8,
    borderRadius: 8,
  },
  profileButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  sosSection: {
    alignItems: "center",
  },
  helpText: {
    alignItems: "center",
    gap: 4,
  },
  helpTextPrimary: {
    fontSize: 14,
    color: "#424b5a",
  },
  helpTextSecondary: {
    fontSize: 14,
    color: "#424b5a",
  },
  redText: {
    color: "#e02323",
    fontWeight: "bold",
  },
  boldText: {
    color: "#424b5a",
    fontWeight: "bold",
  },
  sosButton: {
    width: 317,
    height: 317,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  sosRing1: {
    position: "absolute",
    width: 317,
    height: 317,
    borderRadius: 158.5,
    backgroundColor: "#fae8e9",
  },
  sosRing2: {
    position: "absolute",
    width: 293,
    height: 293,
    borderRadius: 146.5,
    backgroundColor: "#f9d2d2",
  },
  sosRing3: {
    position: "absolute",
    width: 267,
    height: 267,
    borderRadius: 133.5,
    backgroundColor: "#f2a6a6",
  },
  sosCenter: {
    width: 231,
    height: 231,
    borderRadius: 120.5,
    backgroundColor: "#e02323",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  locationInfo: {
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#424b5a",
  },
  coordinatesText: {
    fontSize: 14,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffd8d8",
    height: 45,
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
  },
  voiceButtonText: {
    color: "#e02323",
    fontSize: 12,
  },
  bottomNav: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomNavContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    width: 68,
  },
  navText: {
    color: "#a4a4a4",
    fontSize: 10,
    marginTop: 4,
  },
  navTextActive: {
    color: "#e02323",
    fontSize: 10,
    marginTop: 4,
  },
  homeIndicator: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  homeIndicatorBar: {
    width: 136,
    height: 7,
    backgroundColor: "#a4a4a4",
    borderRadius: 100,
  },
});
