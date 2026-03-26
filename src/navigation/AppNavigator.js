import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

// Importação das Telas
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeFuncionario from '../screens/HomeFuncionario';
import ServicosScreen from '../screens/ServicosScreen';
import ComprasScreen from '../screens/ComprasScreen';
import PontoEntradaScreen from '../screens/PontoEntradaScreen';
import PontoSaidaScreen from '../screens/PontoSaidaScreen';
import HomeGestor from '../screens/HomeGestor';
import ComprasGestorScreen from '../screens/ComprasGestorScreen';
import RelatorioPontoScreen from '../screens/RelatorioPontoScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu de Abas do Funcionário (Item 22 do Doc)
function EmployeeTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#2563eb',
        tabBarStyle: { height: 65, paddingBottom: 10 } 
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={HomeFuncionario} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }} 
      />
      <Tab.Screen 
        name="Pendentes" 
        component={ServicosScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="time" size={24} color={color}/> }} 
      />
      <Tab.Screen 
        name="Compras" 
        component={ComprasScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="cash" size={24} color={color}/> }} 
      />
    </Tab.Navigator>
  );
}

// Menu de Abas do Gestor (Dashboard como tela principal)
function ManagerTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#1e293b',
        tabBarStyle: { height: 65, paddingBottom: 10 } 
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeGestor} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="stats-chart" size={24} color={color}/> }} 
      />
      <Tab.Screen 
        name="Pendentes" 
        component={ServicosScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="warning" size={24} color={color}/> }} 
      />
      <Tab.Screen 
        name="Compras" 
        component={ComprasGestorScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="cart" size={24} color={color}/> }} 
      />
      <Tab.Screen 
        name="Relatórios" 
        component={RelatorioPontoScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="document-text" size={24} color={color}/> }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        {/* Telas Iniciais */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />

        {/* Fluxos por Perfil */}
        <Stack.Screen name="MainFunc" component={EmployeeTabs} />
        <Stack.Screen name="MainGestor" component={ManagerTabs} />

        {/* Telas de Ação (Abertas fora das abas para foco total) */}
        <Stack.Screen name="PontoEntrada" component={PontoEntradaScreen} />
        <Stack.Screen name="PontoSaida" component={PontoSaidaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}