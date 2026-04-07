import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Sun, Moon, LogOut, MapPin, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeFuncionario({ navigation }) {
  const { loggedUser, setLoggedUser, statusPonto, dadosAtividade, setDadosAtividade, isDarkMode, setIsDarkMode } = useContext(AppContext);
  const [timer, setTimer] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (statusPonto === 'trabalhando' && dadosAtividade?.inicio) {
      const dataInicio = new Date(dadosAtividade.inicio);
      if (!isNaN(dataInicio.getTime())) {
        interval = setInterval(() => {
          const diff = Math.floor((new Date() - dataInicio) / 1000);
          if (diff < 0) return;
          const h = Math.floor(diff / 3600).toString().padStart(2, '0');
          const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setTimer(`${h}:${m}:${s}`);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [statusPonto, dadosAtividade]);

  // ✅ Função para registrar foto no meio do serviço
  const tirarFotoIntermediaria = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erro", "Precisamos de acesso à câmera.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled) {
      setDadosAtividade({ 
        ...dadosAtividade, 
        fotoProvisoria: `data:image/jpeg;base64,${result.assets[0].base64}` 
      });
      Alert.alert("Sucesso", "Evidência registrada! Ela será carregada na finalização.");
    }
  };

  const fazerLogout = () => {
    const msg = "Deseja sair?";
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        setLoggedUser(null);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } else {
      Alert.alert("Sair", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => {
          setLoggedUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <View style={styles.floatingControls}>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.floatBtn}>
          {isDarkMode ? <Sun size={26} color="#fbbf24" /> : <Moon size={26} color="#1e293b" />}
        </TouchableOpacity>
        <TouchableOpacity onPress={fazerLogout} style={styles.floatBtn}>
          <LogOut size={28} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.header}>
          <Text style={[styles.welcome, isDarkMode && styles.textWhite]}>Olá, {loggedUser?.nome}!</Text>
          <Text style={[styles.date, isDarkMode && styles.textGray]}>
            {new Date().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'})}
          </Text>
        </View>

        <View style={[styles.card, statusPonto === 'trabalhando' ? styles.cardActive : (isDarkMode ? styles.cardDark : styles.cardInactive)]}>
          <Text style={styles.label}>{statusPonto === 'trabalhando' ? 'EM ATIVIDADE' : 'SISTEMA AGUARDANDO'}</Text>
          <Text style={[styles.timer, statusPonto === 'trabalhando' ? styles.timerActive : (isDarkMode && styles.timerDark)]}>
            {statusPonto === 'trabalhando' ? timer : '--:--'}
          </Text>
          {statusPonto === 'trabalhando' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MapPin size={16} color="#94a3b8" />
              <Text style={styles.info}> {dadosAtividade.setor} › {dadosAtividade.subsetor}</Text>
            </View>
          )}
        </View>

        {/* ✅ Botão de Foto Intermediária - Só aparece se estiver trabalhando */}
        {statusPonto === 'trabalhando' && (
          <TouchableOpacity style={styles.btnFotoMeio} onPress={tirarFotoIntermediaria}>
            <Camera size={24} color="#fff" />
            <Text style={styles.btnTextFoto}>
              {dadosAtividade.fotoProvisoria ? "FOTO REGISTRADA (TROCAR?)" : "REGISTRAR EVIDÊNCIA"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnAction, statusPonto === 'ausente' ? styles.bgGreen : styles.bgRed]}
          onPress={() => navigation.navigate(statusPonto === 'ausente' ? 'PontoEntrada' : 'PontoSaida')}
        >
          <Text style={styles.btnText}>{statusPonto === 'ausente' ? 'REGISTRAR ENTRADA' : 'REGISTRAR SAÍDA'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 25 },
  bgDark: { backgroundColor: '#121212' },
  floatingControls: { position: 'absolute', top: 30, right: 25, flexDirection: 'row', zIndex: 10 },
  floatBtn: { marginLeft: 15 },
  header: { marginTop: 40, marginBottom: 30, alignItems: 'center' },
  welcome: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  date: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5 },
  card: { padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 20, elevation: 4 },
  cardInactive: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  cardActive: { backgroundColor: '#1e293b' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  timer: { fontSize: 50, fontWeight: 'bold', marginVertical: 15, color: '#94a3b8' },
  timerActive: { color: '#38bdf8' },
  timerDark: { color: '#52525b' },
  info: { color: '#94a3b8', fontWeight: 'bold', marginLeft: 5 },
  btnAction: { padding: 22, borderRadius: 20, alignItems: 'center' },
  bgGreen: { backgroundColor: '#16a34a' },
  bgRed: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  textWhite: { color: '#ffffff' },
  textGray: { color: '#a1a1aa' },
  // Estilo do novo botão
  btnFotoMeio: { flexDirection: 'row', backgroundColor: '#6366f1', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  btnTextFoto: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 14 }
});