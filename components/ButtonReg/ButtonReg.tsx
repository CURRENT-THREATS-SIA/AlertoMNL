import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ButtonRegProps {
  text?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const ButtonReg: React.FC<ButtonRegProps> = ({
  text = "Button",
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default ButtonReg;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#e02323",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
