import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const iconFontStyles = `
    @font-face {
      src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')});
      font-family: Ionicons;
    }
  `;
  const style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }
  document.head.appendChild(style);
}
export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}