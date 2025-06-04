import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// modified line 5
export const TermsAndConditionScreen: React.FC = () => {
    const router = useRouter();
    
    return (
        <View style={styles.termsAndCondition}>
            <View style={styles.innerDiv}>
                <View style={styles.frame}>
                    <View style={styles.frame2}>
                        <Text style={styles.textWrapper}>Terms and Condition</Text>
                        <Text style={styles.textWrapper2}>Last Updated: April 2025</Text>
                    </View>
                    <ScrollView style={{ flex: 1 }}>
                        <Text style={styles.acceptanceOfTerms}>
                            <Text style={styles.span}>Acceptance of Terms{"\n"}</Text>
                            <Text style={styles.textWrapper3}> By downloading, accessing, or using the ALERTO MNL, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the App.{"\n\n"}</Text>
                            <Text style={styles.span}>Account Responsibilities{"\n"}</Text>
                            <Text style={styles.textWrapper3}>You are responsible for maintaining the confidentiality of your login credentials.{"\n"}You agree to notify us immediately of any unauthorized access to your account.{"\n\n"}</Text>
                            <Text style={styles.span}>User Conduct{"\n"}</Text>
                            <Text style={styles.textWrapper3}>You must not misuse the App to send false or misleading SOS alerts.{"\n"}You agree not to harass, threaten, or harm others through App communications.{"\n"}You will comply with all local laws and regulations when using the App.{"\n\n"}</Text>
                            <Text style={styles.span}>Police Officer Obligations{"\n"}</Text>
                            <Text style={styles.textWrapper3}>Officers must use the App exclusively for authorized emergency response duties.{"\n"}Any misuse of the App by officers (e.g., false status updates) may result in suspension of access.{"\n\n"}</Text>
                            <Text style={styles.span}>Data Usage and Privacy</Text>
                            <Text style={styles.textWrapper3}> Use of personal data is governed by our Privacy Policy. By using the App, you consent to collection, use, and sharing as described therein.{"\n\n"}</Text>
                            <Text style={styles.span}>Intellectual Property{"\n"}</Text>
                            <Text style={styles.textWrapper3}>All code, design, logos, trademarks, and content in the App are owned or licensed by us.{"\n"}You may not copy, distribute, or modify any part of the App without express permission.{"\n\n"}</Text>
                            <Text style={styles.span}>Disclaimers and Limitation of Liability{"\n"}</Text>
                            <Text style={styles.textWrapper3}>The App is provided {'"'}as is,{'"'} without warranty of any kind.{"\n"}We are not liable for any direct, indirect, incidental, or consequential damages arising from App use.{"\n"}Emergency response times depend on network availability and local resources.{"\n\n"}</Text>
                            <Text style={styles.span}>Modifications and Updates</Text>
                            <Text style={styles.textWrapper3}> We may update or modify these Terms at any time. Continued use of the App constitutes acceptance of the revised Terms.{"\n\n"}</Text>
                            <Text style={styles.span}>Termination</Text>
                            <Text style={styles.textWrapper3}> We reserve the right to suspend or terminate your access for violations of these Terms or misuse of the App.{"\n\n"}</Text>
                            <Text style={styles.span}>Governing Law</Text>
                            <Text style={styles.textWrapper3}> These Terms are governed by the laws of the Philippines, without regard to conflict-of-law principles.{"\n\n"}</Text>
                            <Text style={styles.span}>Contact Information</Text>
                            <Text style={styles.textWrapper3}> For questions or disputes: legal@sosapp.example</Text>
                        </Text>
                    </ScrollView>
                </View>
                <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => router.push("/auth/Login")} > 
                    <Text style={styles.acceptButtonText}>Accept Terms and Conditions</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    termsAndCondition: {
        backgroundColor: "#ffffff",
        width: "100%",
        height: "100%",
        paddingTop: 70,
        padding: 20,
        flex: 1,
    },
    innerDiv: {
        backgroundColor: "#ffffff",
        flex: 1,
        justifyContent: "space-between",
    },
    frame: {
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 20,
        flex: 1,
    },
    frame2: {
        alignItems: "flex-start",
        flexDirection: "column",
        width: "100%",
    },
    textWrapper: {
        alignSelf: "stretch",
        color: "#e02323",
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 52,
        marginTop: -1,
    },
    textWrapper2: {
        alignSelf: "stretch",
        color: "#150502bf",
        fontSize: 11,
        fontWeight: "400",
        lineHeight: 24,
        marginTop: -11,
    },
    acceptanceOfTerms: {
        alignSelf: "stretch",
        color: "#000000",
        fontSize: 12,
        fontWeight: "400",
        lineHeight: 18,
    },
    span: {
        fontWeight: "700",
    },
    textWrapper3: {
        fontWeight: "400",
    },
    acceptButton: {
        backgroundColor: "#e02323",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 35,
    },
    acceptButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default TermsAndConditionScreen; // modified
