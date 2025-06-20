import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { ButtonReg } from "../../../components/ButtonReg";
import { LineArrowLeft } from "../../../icons/LineArrowLeft";
import { LineArrowRight1 } from "../../../icons/LineArrowRight1";
import { User } from "../../../icons/User";

const { width, height } = Dimensions.get('window');

export const SignUp: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"public" | "police" | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.frame}>
          <View style={styles.frame2}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <LineArrowLeft style={styles.lineArrowLeft} />
            </TouchableOpacity>
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
              </View>
            </View>
          </View>
        </View>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already a member?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/Login")}> 
            <Text style={styles.signupLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  frame: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  frame2: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: Math.min(29, height * 0.035),
    position: "relative",
    width: Math.min(330, width - 40),
    maxWidth: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: Math.max(20, height * 0.02),
  },
  lineArrowLeft: {
    height: 24,
    width: 24,
    position: "relative",
  },
  frame3: {
    flex: 1,
    gap: Math.min(200, height * 0.25),
    position: "relative",
    width: "100%",
    justifyContent: 'space-between',
  },
  frame4: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexDirection: "column",
    gap: Math.min(38, height * 0.045),
    position: "relative",
    width: "100%",
  },
  frame5: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: Math.min(10, height * 0.012),
    position: "relative",
    width: "100%",
  },
  textWrapper2: {
    alignSelf: "stretch",
    color: "#e02323",
    fontSize: Math.min(34, width * 0.08),
    fontWeight: "700",
    lineHeight: Math.min(52, width * 0.12),
    marginTop: -1,
    position: "relative",
  },
  p: {
    alignSelf: "stretch",
    color: "#150502bf",
    fontSize: Math.min(16, width * 0.04),
    fontWeight: "400",
    lineHeight: Math.min(24, width * 0.06),
    position: "relative",
  },
  frame6: {
    alignSelf: "stretch",
    flexDirection: "column",
    gap: Math.min(12, height * 0.015),
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
    gap: Math.min(10, height * 0.012),
    paddingVertical: Math.min(16, height * 0.02),
    paddingHorizontal: Math.min(27, width * 0.06),
    position: "relative",
    width: "100%",
    minHeight: Math.min(83, height * 0.1),
  },
  frame7: {
    alignItems: "center",
    flexDirection: "row",
    gap: Math.min(14, width * 0.035),
    position: "relative",
    flex: 1,
  },
  userInstance: {
    height: Math.min(50, width * 0.12),
    width: Math.min(50, width * 0.12),
    position: "relative",
  },
  frame8: {
    alignItems: "center",
    flexDirection: "row",
    gap: Math.min(22, width * 0.055),
    position: "relative",
    flex: 1,
    justifyContent: 'space-between',
  },
  frame9: {
    alignItems: "flex-start",
    flexDirection: "column",
    position: "relative",
    flex: 1,
  },
  textWrapper3: {
    alignSelf: "stretch",
    color: "#ffffff",
    fontSize: Math.min(16, width * 0.04),
    fontWeight: "600",
    lineHeight: Math.min(24, width * 0.06),
    marginTop: -1,
    position: "relative",
  },
  textWrapper4: {
    alignSelf: "stretch",
    color: "#c1c1c1",
    fontSize: Math.min(10, width * 0.025),
    fontWeight: "400",
    lineHeight: Math.min(15, width * 0.035),
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
    gap: Math.min(10, height * 0.012),
    minHeight: Math.min(83, height * 0.1),
    paddingVertical: Math.min(16, height * 0.02),
    paddingHorizontal: Math.min(26, width * 0.06),
    position: "relative",
    width: "100%",
  },
  frame10: {
    alignItems: "center",
    flexDirection: "row",
    gap: Math.min(15, width * 0.035),
    position: "relative",
  },
  chatgptImageApr: {
    height: Math.min(50, width * 0.12),
    width: Math.min(50, width * 0.12),
    resizeMode: "cover",
    position: "relative",
  },
  frame11: {
    alignItems: "center",
    flexDirection: "row",
    gap: Math.min(21, width * 0.05),
    position: "relative",
  },
  frame12: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "column",
    gap: Math.min(10, height * 0.012),
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
    gap: 4,
    position: "relative",
  },
  textWrapper5: {
    color: "#000000",
    fontSize: Math.min(16, width * 0.04),
    fontWeight: "400",
    lineHeight: Math.min(24, width * 0.06),
    marginTop: -1,
    position: "relative",
    textAlign: "center",
  },
  textButton16px: {
    color: '#e02323',
    fontWeight: 'bold',
  },
  barsHomeIndicatorInstance: {
    backgroundColor: "#a4a4a4",
    left: 136,
    top: 9,
    position: "absolute",
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
  signupContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Math.min(16, height * 0.02),
    paddingBottom: Math.min(20, height * 0.025),
  },
  signupText: {
    color: "#000",
    fontSize: Math.min(16, width * 0.04),
    marginRight: 8,
  },
  signupLink: {
    color: "#e02323",
    fontWeight: "bold",
    fontSize: Math.min(16, width * 0.04),
  },
});

export default SignUp;
