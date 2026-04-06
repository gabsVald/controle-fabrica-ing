import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native'; // ✅ Platform adicionado
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function PontoSaidaScreen({ navigation }) {
  const { loggedUser, dadosAtividade, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, setServicosIncompletos, servicosIncompletos } = useContext(AppContext);
  const [passo, setPasso] = useState(1);
  const [detalhes, setDetalhes] = useState({ descricao: '', prioridade: 'Média', foto: null });
  const [uploading, setUploading] = useState(false);

  const tirarFoto = async () => {
    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!result.canceled) setDetalhes({...detalhes, foto: result.assets[0].uri});
  };

  const uploadFotoParaStorage = async (uriLocal) => {
    try {
      const response = await fetch(uriLocal);
      const blob = await response.blob();
      const nomeArquivo = `fotos/${gerarId()}.jpg`;
      const storageRef = ref(storage, nomeArquivo);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Erro no upload da foto:", error);
      return null;
    }
  };

  // ✅ Correção do Alerta que só piscava
  const confirmarCompleto = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Deseja marcar este serviço como concluído?")) {
        finalizar('completo');
      }
    } else {
      Alert.alert(
        "Confirmar Conclusão",
        "Deseja marcar este serviço como completo?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", style: "default", onPress: () => setTimeout(() => finalizar('completo'), 100) }
        ]
      );
    }
  };

  const finalizar = async (tipo) => {
    if (tipo === 'incompleto') {
      if (!detalhes.descricao) {
        Alert.alert("Aviso", "Preencha a descrição do problema.");
        return;
      }
      setUploading(true);
    }

    const agora = new Date();
    const horaSaida = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let urlFotoFirebase = null;
    
    if (tipo === 'incompleto' && detalhes.foto) {
      urlFotoFirebase = await uploadFotoParaStorage(detalhes.foto);
    }

    const novosRegistros = registrosPonto.map(r => {
      if (r.status === 'trabalhando' && r.nome === loggedUser.nome) {
        return {...r, saida: horaSaida, status: tipo === 'completo' ? 'Completo' : 'Incompleto'};
      }
      if (tipo === 'completo' && r.setor === dadosAtividade.setor && r.subsetor === dadosAtividade.subsetor && r.status === 'Incompleto') {
        return {...r, status: 'Concluído (Retomada)'}; 
      }
      return r;
    });

    setRegistrosPonto(novosRegistros);

    if (tipo === 'incompleto') {
      setServicosIncompletos([{
        id: gerarId(),
        ...dadosAtividade, 
        descricao: detalhes.descricao,
        prioridade: detalhes.prioridade,
        foto: urlFotoFirebase,
        criadoPor: loggedUser.nome, 
        status: 'PENDENTE'
      }, ...servicosIncompletos]);
    }

    setUploading(false);
    setStatusPonto('ausente');
    setDadosAtividade({ inicio: null, setor: '', subsetor: '' });
    navigation.navigate(loggedUser?.perfil === 'gestor' ? 'MainGestor' : 'MainFunc');
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#f8fafc'}}>
      <HeaderApp onBack={() => navigation.goBack()} title="Finalizar" />
      <ScrollView contentContainerStyle={{padding: 20}}>
        {passo === 1 ? (
          <View>
            <Text style={styles.title}>Finalizar Atividade</Text>
            <TouchableOpacity style={styles.btnGreen} onPress={confirmarCompleto}>
              <Text style={styles.btnText}>SERVIÇO COMPLETO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOrange} onPress={() => setPasso(2)}>
              <Text style={styles.btnText}>SERVIÇO INCOMPLETO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Relatar Problema</Text>
            <TextInput style={styles.input} placeholder="Descreva o que faltou ou quebrou..." multiline value={detalhes.descricao} onChangeText={t => setDetalhes({...detalhes, descricao: t})} />
            <Text style={styles.label}>Prioridade:</Text>
            <View style={{flexDirection:'row', marginBottom: 20}}>
              {['Alta', 'Média', 'Baixa'].map(p => (
                <TouchableOpacity key={p} style={[styles.chip, detalhes.prioridade === p && styles.active]} onPress={() => setDetalhes({...detalhes, prioridade: p})}>
                  <Text style={detalhes.prioridade === p && {color:'#fff'}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btnBlue} onPress={tirarFoto}>
              <Text style={styles.btnText}>{detalhes.foto ? '✅ Foto Anexada (Mudar)' : '📸 Tirar Foto'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={() => finalizar('incompleto')} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR E FINALIZAR</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1e293b' },
  btnGreen: { backgroundColor: '#16a34a', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  btnOrange: { backgroundColor: '#ea580c', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnSave: { backgroundColor: '#2563eb', padding: 20, borderRadius: 15, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 10, color: '#1e293b' },
  chip: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginRight: 10 },
  active: { backgroundColor: '#2563eb' },
  btnBlue: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
});