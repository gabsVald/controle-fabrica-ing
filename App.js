import React from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

// IMPORTAÇÕES PARA CORREÇÃO DOS ÍCONES
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  // Carrega a fonte do Ionicons de forma assíncrona
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  // Enquanto a fonte não carrega, mostramos um carregando
  // Isso evita que o app abra com quadrados e depois mude para ícones
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}