import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState(''); // ✅ Mudou para usuario
  const [senha, setSenha] = useState('');
  const { usersList, setLoggedUser, isDarkMode, isFirebaseLoaded } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    if (!usuario || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (!isFirebaseLoaded || usersList.length === 0) {
      Alert.alert("Aguarde", "Sincronizando com o servidor, tente novamente em instantes.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // ✅ 1. Procura primeiro pelo utilizador (suporta logins antigos que usaram 'email')
      const userEncontrado = usersList.find(u => 
        (u.usuario && u.usuario.toLowerCase() === usuario.trim().toLowerCase()) ||
        (u.email && u.email.toLowerCase() === usuario.trim().toLowerCase())
      );
      
      setLoading(false);
      
      // ✅ 2. Dá o feedback exato do que correu mal
      if (!userEncontrado) {
        Alert.alert("Acesso Negado", "Usuário não encontrado. Verifique se digitou corretamente.");
      } else if (userEncontrado.senha !== senha) {
        Alert.alert("Acesso Negado", "Senha incorreta. Tente novamente.");
      } else {
        // Sucesso:
        setLoggedUser(userEncontrado);
        navigation.replace(userEncontrado.perfil === 'gestor' ? 'MainGestor' : 'MainFunc');
      }
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.logo, isDarkMode && styles.textWhite]}>ING</Text>
          <Text style={styles.sub}>Controle de Produção</Text>
          
          <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <TextInput 
              style={[styles.input, isDarkMode && styles.inputDark]} 
              placeholder="Nome de Usuário" // ✅ Placeholder atualizado
              placeholderTextColor="#94a3b8"
              value={usuario} 
              onChangeText={setUsuario} 
              autoCapitalize="none"
              color={isDarkMode ? "#fff" : "#1e293b"}
            />
            <TextInput 
              style={[styles.input, isDarkMode && styles.inputDark]} 
              placeholder="Senha" 
              placeholderTextColor="#94a3b8"
              value={senha} 
              onChangeText={setSenha} 
              secureTextEntry 
              color={isDarkMode ? "#fff" : "#1e293b"}
            />
            
            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ENTRAR NO SISTEMA</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={styles.btnCreate}>
              <Text style={[styles.createAccount, isDarkMode && styles.textGray]}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  containerDark: { backgroundColor: '#0f172a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logo: { fontSize: 48, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  textWhite: { color: '#fff' },
  textGray: { color: '#94a3b8' },
  sub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardDark: { backgroundColor: '#1e293b' },
  input: { borderBottomWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, padding: 10, fontSize: 16 },
  inputDark: { borderColor: '#334155' },
  btnLogin: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnCreate: { marginTop: 20, padding: 10 },
  createAccount: { textAlign: 'center', color: '#64748b', fontWeight: 'bold' }
});