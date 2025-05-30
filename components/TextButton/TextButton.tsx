import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface TextButtonProps {
  text?: string;
  onPress?: (event: GestureResponderEvent) => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const TextButton: React.FC<TextButtonProps> = ({
  text = "Button",
  onPress,
  buttonStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default TextButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 16,
    color: "#e02323",
    fontWeight: "500",
  },
});
