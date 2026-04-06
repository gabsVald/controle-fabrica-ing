import React, { useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppContext } from '../context/AppContext';
import { colors } from '../styles/theme';

import { Home, Wrench, Clock, History, ShoppingCart, FileText, AlertTriangle } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeFuncionario from '../screens/HomeFuncionario';
import ServicosScreen from '../screens/ServicosScreen';
import ComprasScreen from '../screens/ComprasScreen';
import PontoEntradaScreen from '../screens/PontoEntradaScreen';
import PontoSaidaScreen from '../screens/PontoSaidaScreen';
import ChamadosScreen from '../screens/ChamadosScreen';
import ComprasGestorScreen from '../screens/ComprasGestorScreen';
import RelatorioPontoScreen from '../screens/RelatorioPontoScreen';
import HistoricoFuncionarioScreen from '../screens/HistoricoFuncionarioScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Tela de loading exibida enquanto o Firebase não termina de carregar
function LoadingScreen({ isDarkMode }) {
  return (
    <View style={[styles.loadingContainer, isDarkMode && styles.loadingDark]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, isDarkMode && { color: colors.muted }]}>
        Sincronizando...
      </Text>
    </View>
  );
}

function EmployeeTabs() {
  const { isDarkMode } = useContext(AppContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: isDarkMode ? colors.backgroundDark : colors.card,
          borderTopColor: isDarkMode ? colors.borderDark : colors.border,
        }
      }}
    >
      <Tab.Screen name="Início" component={HomeFuncionario} options={{ tabBarIcon: ({color}) => <Home color={color} size={24}/> }} />
      <Tab.Screen name="Chamados" component={ChamadosScreen} options={{ tabBarIcon: ({color}) => <Wrench color={color} size={24}/> }} />
      <Tab.Screen name="Pendentes" component={ServicosScreen} options={{ tabBarIcon: ({color}) => <Clock color={color} size={24}/> }} />
      <Tab.Screen name="Histórico" component={HistoricoFuncionarioScreen} options={{ tabBarIcon: ({color}) => <History color={color} size={24}/> }} />
      <Tab.Screen name="Compras" component={ComprasScreen} options={{ tabBarIcon: ({color}) => <ShoppingCart color={color} size={24}/> }} />
    </Tab.Navigator>
  );
}

function ManagerTabs() {
  const { isDarkMode } = useContext(AppContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? colors.info : colors.dark,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: isDarkMode ? colors.backgroundDark : colors.card,
          borderTopColor: isDarkMode ? colors.borderDark : colors.border,
        }
      }}
    >
      <Tab.Screen name="Relatórios" component={RelatorioPontoScreen} options={{ tabBarIcon: ({color}) => <FileText color={color} size={24}/> }} />
      <Tab.Screen name="Chamados" component={ChamadosScreen} options={{ tabBarIcon: ({color}) => <Wrench color={color} size={24}/> }} />
      <Tab.Screen name="Meu Histórico" component={HistoricoFuncionarioScreen} options={{ tabBarIcon: ({color}) => <History color={color} size={24}/> }} />
      <Tab.Screen name="Pendentes" component={ServicosScreen} options={{ tabBarIcon: ({color}) => <AlertTriangle color={color} size={24}/> }} />
      <Tab.Screen name="Compras" component={ComprasGestorScreen} options={{ tabBarIcon: ({color}) => <ShoppingCart color={color} size={24}/> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isFirebaseLoaded, isDarkMode } = useContext(AppContext);

  // ✅ Enquanto o Firebase não carregou, mostra tela de loading
  if (!isFirebaseLoaded) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="MainFunc" component={EmployeeTabs} />
        <Stack.Screen name="MainGestor" component={ManagerTabs} />
        <Stack.Screen name="PontoEntrada" component={PontoEntradaScreen} />
        <Stack.Screen name="PontoSaida" component={PontoSaidaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingDark: {
    backgroundColor: colors.backgroundDark,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: colors.subtle,
    fontWeight: '600',
  },
});