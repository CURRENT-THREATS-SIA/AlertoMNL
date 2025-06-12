import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyles} {...props}>
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  button_default: {
    backgroundColor: '#e02323',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button_destructive: {
    backgroundColor: '#ef4444',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button_secondary: {
    backgroundColor: '#f3f4f6',
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_link: {
    backgroundColor: 'transparent',
  },
  button_default_size: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button_sm: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  button_lg: {
    height: 40,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  button_icon: {
    width: 36,
    height: 36,
    padding: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  text_default: {
    color: '#ffffff',
  },
  text_destructive: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#000000',
  },
  text_secondary: {
    color: '#000000',
  },
  text_ghost: {
    color: '#000000',
  },
  text_link: {
    color: '#e02323',
    textDecorationLine: 'underline',
  },
  text_default_size: {
    fontSize: 14,
  },
  text_sm: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 16,
  },
  text_icon: {
    fontSize: 14,
  },
}); 