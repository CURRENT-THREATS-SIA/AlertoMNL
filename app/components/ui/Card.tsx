import React from 'react';
import {
    StyleSheet,
    View,
    ViewProps,
    ViewStyle,
} from 'react-native';

interface CardProps extends ViewProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ style, children, ...props }) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

export default Card;

export const CardHeader: React.FC<CardProps> = ({ style, children, ...props }) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

export const CardContent: React.FC<CardProps> = ({ style, children, ...props }) => (
  <View style={[styles.content, style]} {...props}>
    {children}
  </View>
);

export const CardFooter: React.FC<CardProps> = ({ style, children, ...props }) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    padding: 16,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 