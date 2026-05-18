import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Image, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { ShoppingCart, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// ✅ Gerador de ID único
const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function ComprasScreen({ navigation }) {
  const { solicitacoesCompra, setSolicitacoesCompra, loggedUser, isDarkMode } = useContext(AppContext);
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fotoURI, setFotoURI] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão negada", "Precisamos de acesso à câmera para tirar fotos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.1, // Reduzido drasticamente para acelerar upload
      base64: true, // Solicita a string em base64 nativamente
    });
    if (!result.canceled) {
      setFotoURI(result.assets[0].uri);
      setFotoBase64(result.assets[0].base64);
    }
  };

  const enviarSolicitacao = async () => {
    if (!item || !quantidade) return Alert.alert("Erro", "Preencha o item e a quantidade.");

    setEnviando(true);
    try {
      let fotoUrl = null;
      if (fotoURI) {
        const idFoto = gerarId();
        const fotoRef = ref(storage, `pedidos_compra/${idFoto}.jpg`);

        if (Platform.OS === 'web') {
          // O Firebase Storage exige configuração de CORS no servidor para aceitar uploads de navegadores Web.
          // Sem CORS, o Firebase fica tentando enviar infinitamente e trava o spinner.
          // Para você conseguir testar no PC sem perder a imagem ao recarregar a página, usamos o base64 diretamente.
          console.log("Teste Web: Usando base64 para evitar bloqueio de CORS e persistir a imagem.");
          fotoUrl = fotoBase64.includes('base64,') ? fotoBase64 : `data:image/jpeg;base64,${fotoBase64}`;
        } else {
          // No Celular (Android/iOS), não existe CORS, então o upload funciona normalmente.
          if (fotoBase64) {
            const idFoto = gerarId();
            const fotoRef = ref(storage, `pedidos_compra/${idFoto}.jpg`);
            // Limpa o prefixo caso exista para evitar erro de formato
            const base64Data = fotoBase64.includes('base64,') ? fotoBase64.split('base64,')[1] : fotoBase64;
            await uploadString(fotoRef, base64Data, 'base64', { contentType: 'image/jpeg' });
            fotoUrl = await getDownloadURL(fotoRef);
          }
        }
      }

      const novaCompra = {
        id: gerarId(),
        item,
        quantidade,
        autor: loggedUser?.nome,
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'Pendente',
        fotoUrl
      };

      setSolicitacoesCompra(prev => [novaCompra, ...prev]);
      setItem('');
      setQuantidade('');
      setFotoURI(null);
      setFotoBase64(null);
      Alert.alert("Sucesso!", "Solicitação enviada com sucesso.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao enviar a solicitação. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
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

        <TouchableOpacity style={[styles.btnFoto, isDarkMode && styles.btnFotoDark]} onPress={tirarFoto} disabled={enviando}>
          <Camera size={20} color={isDarkMode ? "#fff" : "#64748b"} />
          <Text style={[styles.btnFotoText, isDarkMode && styles.textDark]}>TIRAR FOTO (OPCIONAL)</Text>
        </TouchableOpacity>

        {fotoURI && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: fotoURI }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => { setFotoURI(null); setFotoBase64(null); }}>
              <Text style={styles.textRemoverFoto}>Remover Foto</Text>
            </TouchableOpacity>
          </View>
        )}
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
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 20 },
  btnFotoDark: { backgroundColor: '#334155' },
  btnFotoText: { color: '#64748b', fontWeight: 'bold', marginLeft: 10 },
  previewContainer: { alignItems: 'center', marginBottom: 20 },
  previewImage: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
  textRemoverFoto: { color: '#ef4444', fontWeight: 'bold' }
});