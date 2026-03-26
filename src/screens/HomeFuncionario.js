import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function HomeFuncionario({ navigation }) {
  // ADICIONADO: isDarkMode importado do Contexto
  const { loggedUser, statusPonto, dadosAtividade, isDarkMode } = useContext(AppContext);
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

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      {/* HEADER CENTRALIZADO */}
      <View style={styles.header}>
        <Text style={[styles.welcome, isDarkMode && styles.textWhite]}>Olá, {loggedUser?.nome}!</Text>
        <Text style={[styles.date, isDarkMode && styles.textGray]}>{new Date().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'})}</Text>
      </View>

      <View style={[styles.card, statusPonto === 'trabalhando' ? styles.cardActive : (isDarkMode ? styles.cardDark : styles.cardInactive)]}>
        <Text style={styles.label}>{statusPonto === 'trabalhando' ? 'EM ATIVIDADE' : 'SISTEMA AGUARDANDO'}</Text>
        <Text style={[styles.timer, statusPonto === 'trabalhando' ? styles.timerActive : (isDarkMode && styles.timerDark)]}>
          {statusPonto === 'trabalhando' ? timer : '--:--'}
        </Text>
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
  bgDark: { backgroundColor: '#121212' }, // PRETO REAL PARA MODO ESCURO
  
  // HEADER CENTRALIZADO (alignItems: 'center')
  header: { marginTop: 40, marginBottom: 30, alignItems: 'center' },
  welcome: { fontSize: 26, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  date: { fontSize: 14, color: '#64748b', textTransform: 'capitalize', textAlign: 'center', marginTop: 5 },
  
  card: { padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 40, elevation: 4 },
  cardInactive: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' }, // CINZA CHUMBO PARA CARDS
  cardActive: { backgroundColor: '#1e293b' },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  timer: { fontSize: 50, fontWeight: 'bold', marginVertical: 15, color: '#94a3b8' },
  timerActive: { color: '#38bdf8' },
  timerDark: { color: '#52525b' },
  info: { color: '#94a3b8', fontWeight: 'bold' },
  
  btnAction: { padding: 25, borderRadius: 20, alignItems: 'center' },
  bgGreen: { backgroundColor: '#16a34a' },
  bgRed: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  textWhite: { color: '#ffffff' },
  textGray: { color: '#a1a1aa' }
});