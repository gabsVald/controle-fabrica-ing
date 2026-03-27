import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { usersList, setUsersList } = useContext(AppContext);

  const handleCadastro = () => {
    // 1. Validação de campos vazios
    if (!nome || !email || !senha) {
      if (Platform.OS === 'web') {
        window.alert("Erro: Preencha todos os campos.");
      } else {
        Alert.alert("Erro", "Preencha todos os campos.");
      }
      return;
    }

    // 2. Criação do usuário
    const novoUsuario = {
      id: Math.random().toString(),
      nome,
      email: email.toLowerCase(),
      senha,
      perfil: 'funcionario' // Padrão
    };

    setUsersList([...usersList, novoUsuario]);
    
    // 3. Alerta de Sucesso e Navegação
    if (Platform.OS === 'web') {
      window.alert("Conta criada com sucesso!");
      navigation.navigate('Login');
    } else {
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp onBack={() => navigation.goBack()} title="Criar Conta" hideLogout={true} />
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="Nome Completo" value={nome} onChangeText={setNome} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Usuário" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        
        <TouchableOpacity style={styles.btn} onPress={handleCadastro}>
          <Text style={styles.btnText}>CADASTRAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 30, flex: 1, justifyContent: 'center' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  btn: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});