import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppContext } from '../context/AppContext';

// Ícones SVG (Lucide) - Garantindo que não dão erro
import { Home, Wrench, Clock, History, ShoppingCart, FileText, AlertTriangle } from 'lucide-react-native';

// Importação das Telas
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

function EmployeeTabs() {
  const { isDarkMode } = useContext(AppContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#e2e8f0'
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
        tabBarActiveTintColor: isDarkMode ? '#38bdf8' : '#1e293b',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: isDarkMode ? '#121212' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#e2e8f0'
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