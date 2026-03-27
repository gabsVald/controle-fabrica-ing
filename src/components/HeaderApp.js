import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

// Ícones SVG da Lucide (Não dão erro de quadradinho na web)
import { ArrowLeft, Sun, Moon, LogOut } from 'lucide-react-native';

export default function HeaderApp({ onBack, title, hideLogout }) {
  const { isDarkMode, setIsDarkMode, setLoggedUser } = useContext(AppContext);
  const navigation = useNavigation();

  const fazerLogout = () => {
    const mensagem = "Deseja sair da sua conta?";
    
    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) {
        setLoggedUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } else {
      Alert.alert("Sair", mensagem, [
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
            <ArrowLeft size={24} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Centro (Título) */}
      <Text 
        numberOfLines={1} 
        style={[styles.headerTitle, isDarkMode ? styles.textDark : styles.textLight]}
      >
        {title || "ING"}
      </Text>

      {/* Lado Direito (Tema e Sair) */}
      <View style={[styles.sideBox, styles.rightBox]}>
        <TouchableOpacity 
          onPress={() => setIsDarkMode(!isDarkMode)} 
          style={styles.iconBtn}
        >
          {isDarkMode ? (
            <Sun size={22} color="#fbbf24" />
          ) : (
            <Moon size={22} color="#1e293b" />
          )}
        </TouchableOpacity>

        {!hideLogout && (
          <TouchableOpacity onPress={fazerLogout} style={styles.iconBtn}>
            <LogOut size={24} color="#ef4444" />
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
    // Ajuste para Web (SafeArea)
    marginTop: Platform.OS === 'ios' ? 0 : 0, 
  },
  headerLight: { 
    backgroundColor: '#fff', 
    borderBottomColor: '#e2e8f0' 
  },
  headerDark: { 
    backgroundColor: '#121212', 
    borderBottomColor: '#333' 
  },
  sideBox: { 
    width: 70, 
    alignItems: 'flex-start' 
  },
  rightBox: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    textAlign: 'center', 
    flex: 1 
  },
  textLight: { color: '#1e293b' },
  textDark: { color: '#f8fafc' },
  backButton: { padding: 5 },
  iconBtn: { padding: 5, marginLeft: 8 }
});