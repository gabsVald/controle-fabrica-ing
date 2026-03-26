import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { usersList, setLoggedUser } = useContext(AppContext);

  const handleLogin = () => {
    const user = usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);

    if (user) {
      setLoggedUser(user);
      if (user.perfil === 'gestor') {
        navigation.navigate('MainGestor');
      } else {
        navigation.navigate('MainFunc');
      }
    } else {
      Alert.alert("Erro", "Credenciais incorretas.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>ING</Text>
      <Text style={styles.sub}>Controle de Tarefas</Text>
      
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Usuário" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        
        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
          <Text style={styles.btnText}>ENTRAR NO SISTEMA</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.createAccount}>Criar nova conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 30 },
  logo: { fontSize: 50, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  sub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 5 },
  input: { borderBottomWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, padding: 10, fontSize: 16 },
  btnLogin: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  createAccount: { textAlign: 'center', marginTop: 20, color: '#64748b', fontWeight: 'bold' }
});