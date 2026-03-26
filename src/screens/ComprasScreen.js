import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function SolicitacaoCompra({ navigation }) {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser } = useContext(AppContext);
  
  // Estados para os campos e para o controle de envio
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarSolicitacao = () => {
    if (!item || !quantidade) {
      Alert.alert("Erro", "Por favor, preencha o item e a quantidade.");
      return;
    }

    // 1. Inicia sinalização visual de carregamento
    setEnviando(true);

    // Simulando um pequeno delay de rede (mesmo que seja local) para o user ver que processou
    setTimeout(() => {
      const novaCompra = {
        id: Math.random().toString(),
        item: item,
        quantidade: quantidade,
        autor: loggedUser?.nome || 'Funcionário',
        data: new Date().toLocaleDateString('pt-BR')
      };

      // 2. Salva no contexto
      setSolicitacoesCompra([novaCompra, ...solicitacoesCompra]);

      // 3. Limpa os campos IMEDIATAMENTE
      setItem('');
      setQuantidade('');
      setEnviando(false);

      // 4. Sinalização visual final (Feedback positivo)
      Alert.alert(
        "Sucesso!", 
        "Sua solicitação foi enviada para o gestor.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 800); 
  };

  return (
    <View style={styles.container}>
      <HeaderApp title="Solicitar Compra" onBack={() => navigation.goBack()} />
      
      <View style={styles.form}>
        <Text style={styles.label}>O que está faltando?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Luvas de proteção, Parafusos..."
          value={item}
          onChangeText={setItem}
          editable={!enviando} // Trava o campo enquanto envia
        />

        <Text style={styles.label}>Quantidade / Observação</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2 caixas ou 50 unidades"
          value={quantidade}
          onChangeText={setQuantidade}
          editable={!enviando} // Trava o campo enquanto envia
        />

        <TouchableOpacity 
          style={[styles.btnEnviar, enviando && styles.btnDesabilitado]} 
          onPress={enviarSolicitacao}
          disabled={enviando} // Evita o clique duplo físico
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
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
  form: { padding: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    marginBottom: 20,
    fontSize: 16 
  },
  btnEnviar: { 
    backgroundColor: '#2563eb', 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3
  },
  btnDesabilitado: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});