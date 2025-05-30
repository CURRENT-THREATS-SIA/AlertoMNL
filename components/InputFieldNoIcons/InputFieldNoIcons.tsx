import React from "react";
import { StyleSheet, Text, TextInput, View, ViewStyle, } from "react-native";

interface InputFieldNoIconsProps {
  property1: "email" | "password";
  icon?: React.ReactNode;
  text?: string;
  containerStyle?: ViewStyle;
  inputWrapperStyle?: ViewStyle;
  placeholder?: string;
}

export const InputFieldNoIcons: React.FC<InputFieldNoIconsProps> = ({
  property1,
  icon,
  text = "Your email",
  containerStyle,
  inputWrapperStyle,
  placeholder,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {property1 === "email" ? "Email" : "Password"}
      </Text>

      <View style={[styles.inputWrapper, inputWrapperStyle]}>
        <View style={styles.icon}>{icon}</View>
        <TextInput
          placeholder={placeholder ?? (property1 === "email" ? text : "Enter password")}
          style={styles.input}
          secureTextEntry={property1 === "password"}
        />
      </View>
    </View>
  );
};

export default InputFieldNoIcons;


const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
