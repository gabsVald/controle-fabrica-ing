import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function ComprasScreen({ navigation }) {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser, isDarkMode } = useContext(AppContext);
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarSolicitacao = () => {
    if (!item || !quantidade) return Alert.alert("Erro", "Preencha o item e a quantidade.");
    setEnviando(true);

    setTimeout(() => {
      const novaCompra = { id: Math.random().toString(), item, quantidade, autor: loggedUser?.nome, data: new Date().toLocaleDateString('pt-BR') };
      setSolicitacoesCompra([novaCompra, ...solicitacoesCompra]);
      setItem(''); setQuantidade(''); setEnviando(false);
      Alert.alert("Sucesso!", "Sua solicitação foi enviada para o gestor.");
    }, 800); 
  };

  return (
    <View style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Solicitar Compra" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <Text style={[styles.label, isDarkMode && styles.textDark]}>O que está faltando?</Text>
        <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={item} onChangeText={setItem} editable={!enviando} />

        <Text style={[styles.label, isDarkMode && styles.textDark]}>Quantidade / Observação</Text>
        <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={quantidade} onChangeText={setQuantidade} editable={!enviando} />

        <TouchableOpacity style={[styles.btnEnviar, enviando && styles.btnDesabilitado]} onPress={enviarSolicitacao} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>ENVIAR SOLICITAÇÃO</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#1e293b' },
  form: { padding: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  textDark: { color: '#f8fafc' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  inputDark: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' },
  btnEnviar: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '80%' },
  btnDesabilitado: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 14 }
});