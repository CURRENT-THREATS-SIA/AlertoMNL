import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { ButtonReg } from "../../../components/ButtonReg";
import { TextButton } from "../../../components/TextButton";
import { LineArrowLeft } from "../../../icons/LineArrowLeft";
import { LineArrowRight1 } from "../../../icons/LineArrowRight1";
import { User } from "../../../icons/User";

export const SignUp: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"public" | "police" | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.signUp}>
    
        {/* Main Content */}
        <View style={styles.frame}>
          <View style={styles.frame2}>
            <LineArrowLeft style={styles.lineArrowLeft} />
            <View style={styles.frame3}>
              <View style={styles.frame4}>
                <View style={styles.frame5}>
                  <Text style={styles.textWrapper2}>Select Your Role</Text>
                  <Text style={styles.p}>Choose a profile to get started.</Text>
                </View>
                <View style={styles.frame6}>
                  {/* Public User */}
                  <TouchableOpacity
                    style={[
                      styles.frameWrapper,
                      selectedRole === "public" && { borderColor: "#e02323", borderWidth: 3 }
                    ]}
                    onPress={() => setSelectedRole("public")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.frame7}>
                      <User style={styles.userInstance} />
                      <View style={styles.frame8}>
                        <View style={styles.frame9}>
                          <Text style={styles.textWrapper3}>Public User</Text>
                          <Text style={styles.textWrapper4}>Browse public features</Text>
                        </View>
                        <LineArrowRight1 style={styles.lineArrowRight} />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Police Officer */}
                  <TouchableOpacity
                    style={[
                      styles.divWrapper,
                      selectedRole === "police" && { borderColor: "#e02323", borderWidth: 3 }
                    ]}
                    onPress={() => setSelectedRole("police")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.frame7}>
                      <Image
                        style={styles.chatgptImageApr}
                        source={{ uri: "https://c.animaapp.com/KKVgu19o/img/chatgpt-image-apr-24--2025--09-00-34-pm-1@2x.png" }}
                      />
                      <View style={styles.frame8}>
                        <View style={styles.frame9}>
                          <Text style={styles.textWrapper3}>Police Officer</Text>
                          <Text style={styles.textWrapper4}>Access law-enforcement features</Text>
                        </View>
                        <LineArrowRight1 style={styles.lineArrowRight} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.frame12}>
                <ButtonReg
                  text="Continue"
                  style={[
                    styles.buttonRegInstance,
                    !selectedRole ? { backgroundColor: "#ccc" } : undefined
                  ].filter(Boolean) as ViewStyle[]}
                  onPress={
                    selectedRole
                      ? () => router.push(selectedRole === "public" ? "/auth/regular-user-signup" : "/auth/police-signup")
                      : undefined
                  }
                />
                <View style={styles.frame13}>
                  <Text style={styles.textWrapper5}>Already a member?</Text>
                  <TextButton text="Log in" textStyle={styles.textButton16px} onPress={() => router.push("auth/Login")} />
                </View>
              </View>
            </View>
          </View>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  signUp: {
    backgroundColor: "#ffffff",
    height: "100%",
    width: "100%",
  },
  frame: {
    alignItems: "center",
    backgroundColor: '#ffffff',
  },
  frame2: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 29,
    position: "relative",
    width: 340,
  },
  lineArrowLeft: {
    height: 24,
    width: 24,
    position: "relative",
    marginTop: 74,
  },
  frame3: {
    gap: 200,
    position: "relative",
    width: "100%",
  },
  frame4: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexDirection: "column",
    gap: 38,
    position: "relative",
    width: "100%",
  },
  frame5: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    width: "100%",
  },
  textWrapper2: {
    alignSelf: "stretch",
    color: "#e02323",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 52,
    marginTop: -1,
    position: "relative",
  },
  p: {
    alignSelf: "stretch",
    color: "#150502bf",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    position: "relative",
  },
  frame6: {
    alignSelf: "stretch",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    width: "100%",
  },
  frameWrapper: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    backgroundColor: "#ac3939",
    borderWidth: 2,
    borderColor: "#e9e9e9",
    borderRadius: 5,
    flexDirection: "column",
    gap: 10,

    paddingVertical: 16,
    paddingHorizontal: 27,
    position: "relative",
    width: "100%",
  },
  frame7: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    position: "relative",
  },
  userInstance: {
    height: 50,
    width: 50,
    position: "relative",
  },
  frame8: {
    alignItems: "center",
    flexDirection: "row",
    gap: 22,
    position: "relative",
  },
  frame9: {
    alignItems: "flex-start",
    flexDirection: "column",
    position: "relative",
    width: 171,
  },
  textWrapper3: {
    alignSelf: "stretch",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: -1,
    position: "relative",
  },
  textWrapper4: {
    alignSelf: "stretch",
    color: "#c1c1c1",
    fontSize: 10,
    fontWeight: "400",
    height: 13,
    lineHeight: 15,
    position: "relative",
  },
  lineArrowRight: {
    height: 24,
    width: 33,
    position: "relative",
  },
  divWrapper: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    backgroundColor: "#ac3a3a",
    borderRadius: 5,
    flexDirection: "column",
    gap: 10,
    height: 83,
    paddingVertical: 16,
    paddingHorizontal: 26,
    position: "relative",
    width: "100%",
  },
  frame10: {
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    position: "relative",
  },
  chatgptImageApr: {
    height: 50,
    width: 50,
    resizeMode: "cover",
    position: "relative",
  },
  frame11: {
    alignItems: "center",
    flexDirection: "row",
    gap: 21,
    position: "relative",
  },
  frame12: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    width: "100%",
  },
  buttonRegInstance: {
    alignSelf: "stretch",
    backgroundColor: "#e02323",
    width: "100%",
  },
  frame13: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    position: "relative",
  },
  textWrapper5: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    marginTop: -1,
    position: "relative",
    textAlign: "center",
  },
  textButtonPx: {
    flex: 0,
  },
  textButton16px: {
    color: "#e02323",
  },
  barsHomeIndicatorInstance: {
    backgroundColor: "#a4a4a4",
    left: 136,
    top: 9,
    position: "absolute",
  },
  container: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 30,
    color: '#e02323',
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 18,
    color: '#888',
    alignSelf: "flex-start",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: '#e02323',
    padding: 16,
    borderRadius: 14,
    marginTop: 18,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    width: "100%",
  },
  loginText: {
    color: "#000",
    fontSize: 15,
  },
  loginLink: {
    color: "#e02323",
    fontWeight: "bold",
    fontSize: 15,
  },
  pageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    padding: 32,
    alignItems: 'center',
  },
});

export default SignUp;
