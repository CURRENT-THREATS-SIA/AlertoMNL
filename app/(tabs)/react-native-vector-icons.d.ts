declare module '@react-native-picker/picker';
declare module 'expo-router';
declare module 'react-native-vector-icons/MaterialIcons';

declare module '*.svg' {
    import React from 'react';
    import { SvgProps } from 'react-native-svg';
    const Component: React.FC<SvgProps>;
    export default Component;
  }
  