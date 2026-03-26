import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ComprasScreen() {
  const [item, setItem] = useState('');
  const [qtd, setQtd] = useState('');
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser } = useContext(AppContext);

  const enviarSolicitacao = () => {
    if (!item || !qtd) return Alert.alert("Erro", "Preencha o item e a quantidade.");
    
    const nova = {
      id: Math.random().toString(),
      item,
      qtd,
      autor: loggedUser.nome,
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR')
    };

    setSolicitacoesCompra([nova, ...solicitacoesCompra]);
    setItem('');
    setQtd('');
    Alert.alert("Sucesso", "Solicitação enviada ao gestor!");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitar Compra</Text>
        <View style={styles.form}>
          <Text style={styles.label}>O que está faltando?</Text>
          <TextInput style={styles.input} placeholder="Ex: Parafuso M8, Broca 10mm..." value={item} onChangeText={setItem} />
          
          <Text style={styles.label}>Quantidade / Observação</Text>
          <TextInput style={styles.input} placeholder="Ex: 2 caixas, Urgente..." value={qtd} onChangeText={setQtd} />

          <TouchableOpacity style={styles.btnEnviar} onPress={enviarSolicitacao}>
            <Text style={styles.btnText}>Enviar para o Gestor</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
  form: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 4 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  input: { borderBottomWidth: 1, borderColor: '#e2e8f0', marginBottom: 25, fontSize: 16, padding: 5 },
  btnEnviar: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});