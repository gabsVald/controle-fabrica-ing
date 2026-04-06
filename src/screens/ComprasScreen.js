import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native'; // ✅ SafeAreaView adicionado
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { ShoppingCart } from 'lucide-react-native';

// ✅ Gerador de ID único
const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function ComprasScreen({ navigation }) {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser, isDarkMode } = useContext(AppContext);
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarSolicitacao = () => {
    if (!item || !quantidade) return Alert.alert("Erro", "Preencha o item e a quantidade.");
    setEnviando(true);
    setTimeout(() => {
      const novaCompra = {
        id: gerarId(), // ✅ ID único
        item,
        quantidade,
        autor: loggedUser?.nome,
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'Pendente'
      };
      setSolicitacoesCompra([novaCompra, ...solicitacoesCompra]);
      setItem(''); setQuantidade(''); setEnviando(false);
      Alert.alert("Sucesso!", "Solicitação enviada.");
    }, 800);
  };

  return (
    // ✅ Trocado View por SafeAreaView para evitar conteúdo atrás da status bar
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Solicitar Compra" onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <Text style={[styles.label, isDarkMode && styles.textDark]}>O que está faltando?</Text>
        <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={item} onChangeText={setItem} editable={!enviando} />
        <Text style={[styles.label, isDarkMode && styles.textDark]}>Quantidade / Observação</Text>
        <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={quantidade} onChangeText={setQuantidade} editable={!enviando} />
        <TouchableOpacity style={[styles.btnEnviar, enviando && styles.btnDesabilitado]} onPress={enviarSolicitacao} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : (
            <>
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.btnText}>ENVIAR SOLICITAÇÃO</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  btnEnviar: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnDesabilitado: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 }
});