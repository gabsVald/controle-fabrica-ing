import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function ComprasScreen() {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser } = useContext(AppContext);
  const [item, setItem] = useState('');
  const [qtd, setQtd] = useState('');
  const [obs, setObs] = useState('');

  const handleEnviar = () => {
    if (!item || !qtd) {
      Alert.alert("Aviso", "Por favor, preencha o item e a quantidade.");
      return;
    }

    const novaSolicitacao = {
      id: Math.random().toString(),
      item,
      qtd,
      obs,
      autor: loggedUser?.nome || 'Operador',
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'ABERTA'
    };

    setSolicitacoesCompra([novaSolicitacao, ...solicitacoesCompra]);
    
    // Aviso visual solicitado
    Alert.alert(
      "Solicitação Enviada", 
      "O gestor foi notificado sobre a necessidade de compra do item: " + item,
      [{ text: "OK", onPress: () => { setItem(''); setQtd(''); setObs(''); } }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp title="Solicitar Compra" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>O que precisa ser comprado?</Text>
        <TextInput 
          style={styles.input} 
          value={item} 
          onChangeText={setItem} 
        />

        <Text style={styles.label}>Quantidade:</Text>
        <TextInput 
          style={styles.input} 
          value={qtd} 
          onChangeText={setQtd} 
        />

        <Text style={styles.label}>Observação (Opcional):</Text>
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          multiline 
          value={obs} 
          onChangeText={setObs} 
        />

        <TouchableOpacity style={styles.btnEnviar} onPress={handleEnviar}>
          <Text style={styles.btnText}>ENVIAR SOLICITAÇÃO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, fontSize: 16 },
  btnEnviar: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});