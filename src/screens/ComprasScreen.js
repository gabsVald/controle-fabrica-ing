import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ComprasScreen({ navigation }) {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser } = useContext(AppContext);
  const [item, setItem] = useState('');
  const [qtd, setQtd] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = () => {
    if (!item || !qtd) return Alert.alert("Aviso", "Preencha todos os campos.");
    setEnviando(true);
    setTimeout(() => {
      setSolicitacoesCompra([{ id: Math.random().toString(), item, autor: loggedUser.nome }, ...solicitacoesCompra]);
      setItem(''); setQtd('');
      setEnviando(false);
      Alert.alert("Sucesso", "Solicitação enviada!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Item" value={item} onChangeText={setItem} editable={!enviando} />
      <TextInput style={styles.input} placeholder="Quantidade" value={qtd} onChangeText={setQtd} editable={!enviando} />
      <TouchableOpacity style={styles.btn} onPress={enviar} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ENVIAR</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#2563eb', padding: 20, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});