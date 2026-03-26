import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeFuncionario({ navigation }) {
  const { statusPonto, setStatusPonto, registrosPonto, setRegistrosPonto, loggedUser } = useContext(AppContext);
  const [processando, setProcessando] = useState(false);

  const gerirPonto = () => {
    setProcessando(true);
    setTimeout(() => {
      const agora = new Date();
      if (statusPonto === 'parado') {
        const novo = {
          id: Math.random().toString(),
          nome: loggedUser.nome,
          data: agora.toLocaleDateString('pt-BR'),
          horaEntrada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'trabalhando',
          setor: 'Geral', subsetor: 'Produção'
        };
        setRegistrosPonto([novo, ...registrosPonto]);
        setStatusPonto('trabalhando');
      } else {
        setRegistrosPonto(registrosPonto.map(r => r.status === 'trabalhando' ? { ...r, status: 'finalizado' } : r));
        setStatusPonto('parado');
      }
      setProcessando(false);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.btn, statusPonto === 'trabalhando' ? styles.btnStop : styles.btnStart, processando && { opacity: 0.7 }]} 
        onPress={gerirPonto}
        disabled={processando}
      >
        {processando ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.btnText}>{statusPonto === 'trabalhando' ? "FINALIZAR" : "INICIAR"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 40 },
  btn: { height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnStart: { backgroundColor: '#22c55e' },
  btnStop: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});