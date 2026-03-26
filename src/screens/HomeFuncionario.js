import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeFuncionario({ navigation }) {
  const { loggedUser, statusPonto, dadosAtividade } = useContext(AppContext);
  const [timer, setTimer] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (statusPonto === 'trabalhando' && dadosAtividade?.inicio) {
      interval = setInterval(() => {
        const diff = Math.floor((new Date() - new Date(dadosAtividade.inicio)) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setTimer(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [statusPonto, dadosAtividade]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {loggedUser?.nome}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'})}</Text>
      </View>

      <View style={[styles.card, statusPonto === 'trabalhando' ? styles.cardActive : styles.cardInactive]}>
        <Text style={styles.label}>{statusPonto === 'trabalhando' ? 'EM ATIVIDADE' : 'SISTEMA AGUARDANDO'}</Text>
        <Text style={styles.timer}>{statusPonto === 'trabalhando' ? timer : '--:--'}</Text>
        {statusPonto === 'trabalhando' && (
          <Text style={styles.info}>📍 {dadosAtividade.setor} › {dadosAtividade.subsetor}</Text>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.btnAction, statusPonto === 'ausente' ? styles.bgGreen : styles.bgRed]}
        onPress={() => navigation.navigate(statusPonto === 'ausente' ? 'PontoEntrada' : 'PontoSaida')}
      >
        <Text style={styles.btnText}>{statusPonto === 'ausente' ? 'REGISTRAR ENTRADA' : 'REGISTRAR SAÍDA'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 25 },
  header: { marginTop: 40, marginBottom: 30 },
  welcome: { fontSize: 26, fontWeight: '900', color: '#1e293b' },
  date: { fontSize: 14, color: '#64748b', textTransform: 'capitalize' },
  card: { padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 40, elevation: 4 },
  cardInactive: { backgroundColor: '#fff' },
  cardActive: { backgroundColor: '#1e293b' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  timer: { fontSize: 50, fontWeight: 'bold', color: '#2563eb', marginVertical: 15 },
  info: { color: '#94a3b8', fontWeight: 'bold' },
  btnAction: { padding: 25, borderRadius: 20, alignItems: 'center' },
  bgGreen: { backgroundColor: '#16a34a' },
  bgRed: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});