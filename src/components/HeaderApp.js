import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function HeaderApp({ onBack, title, hideLogout }) {
  const { isDarkMode, setIsDarkMode, setLoggedUser } = useContext(AppContext);
  const navigation = useNavigation();

  const fazerLogout = () => {
    if (Platform.OS === 'web') {
      const confirma = window.confirm("Deseja sair da sua conta?");
      if (confirma) {
        setLoggedUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } else {
      Alert.alert("Sair", "Deseja sair da sua conta?", [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: () => {
            setLoggedUser(null);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]);
    }
  };

  return (
    <View style={[styles.header, isDarkMode ? styles.headerDark : styles.headerLight]}>
      {/* Lado Esquerdo (Botão Voltar) */}
      <View style={styles.sideBox}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Centro (Título) */}
      <Text style={[styles.headerTitle, isDarkMode ? styles.textDark : styles.textLight]}>
        {title || "ING"}
      </Text>

      {/* Lado Direito (Botões) */}
      <View style={[styles.sideBox, styles.rightBox]}>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.iconBtn}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color={isDarkMode ? "#fbbf24" : "#1e293b"} />
        </TouchableOpacity>

        {!hideLogout && (
          <TouchableOpacity onPress={fazerLogout} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  headerLight: { backgroundColor: '#fff', borderBottomColor: '#e2e8f0' },
  headerDark: { backgroundColor: '#121212', borderBottomColor: '#333' },
  
  sideBox: { width: 70, alignItems: 'flex-start' },
  rightBox: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  
  headerTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', flex: 1 },
  textLight: { color: '#1e293b' },
  textDark: { color: '#f8fafc' },
  
  backButton: { padding: 5 },
  iconBtn: { padding: 5, marginLeft: 8 }
});