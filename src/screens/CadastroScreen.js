import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState(''); // ✅ Mudou de email para usuario
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { usersList, setUsersList, isDarkMode } = useContext(AppContext);

  const handleCadastro = async () => {
    if (!nome || !usuario || !senha) {
      const msg = "Preencha todos os campos.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erro", msg);
      return;
    }

    // ✅ Verifica se o usuário já existe (suporta contas antigas que usavam 'email')
    const usuarioJaExiste = usersList.some(u => 
      (u.usuario && u.usuario.toLowerCase() === usuario.trim().toLowerCase()) ||
      (u.email && u.email.toLowerCase() === usuario.trim().toLowerCase())
    );

    if (usuarioJaExiste) {
      Alert.alert("Erro", "Este nome de usuário já está em uso.");
      return;
    }

    setLoading(true);

    const novoUsuario = {
      id: Date.now().toString(),
      nome,
      usuario: usuario.trim().toLowerCase(), // ✅ Salva como 'usuario'
      senha,
      perfil: 'funcionario'
    };

    setUsersList(prev => [...prev, novoUsuario]);
    
    // Aguarda um pouco para o Firebase sincronizar antes de voltar ao Login
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    const successMsg = "Conta criada com sucesso!";
    
    if (Platform.OS === 'web') {
      window.alert(successMsg);
      navigation.navigate('Login');
    } else {
      Alert.alert("Sucesso", successMsg, [
        { text: "OK", onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <HeaderApp onBack={() => navigation.goBack()} title="Criar Conta" hideLogout={true} />
      <View style={styles.content}>
        <TextInput 
          style={[styles.input, isDarkMode && styles.inputDark]} 
          placeholder="Nome Completo" 
          placeholderTextColor="#94a3b8"
          value={nome} 
          onChangeText={setNome} 
        />
        <TextInput 
          style={[styles.input, isDarkMode && styles.inputDark]} 
          placeholder="Usuário" // ✅ Novo placeholder
          placeholderTextColor="#94a3b8"
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none"
        />
        <TextInput 
          style={[styles.input, isDarkMode && styles.inputDark]} 
          placeholder="Senha" 
          placeholderTextColor="#94a3b8"
          value={senha} 
          onChangeText={setSenha} 
          secureTextEntry 
        />
        
        <TouchableOpacity style={styles.btn} onPress={handleCadastro} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>CADASTRAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { backgroundColor: '#0f172a' },
  content: { padding: 30, flex: 1, justifyContent: 'center' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  inputDark: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' },
  btn: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});