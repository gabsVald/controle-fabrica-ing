import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function PontoSaidaScreen({ navigation }) {
  const { 
    loggedUser, dadosAtividade, setRegistrosPonto, 
    registrosPonto, setStatusPonto, setDadosAtividade, 
    setServicosIncompletos, servicosIncompletos, isDarkMode 
  } = useContext(AppContext);

  const [passo, setPasso] = useState(1);
  const [tipoFinalizacao, setTipoFinalizacao] = useState(''); 
  const [detalhes, setDetalhes] = useState({ descricao: '', prioridade: 'Média', foto: null });
  const [enviando, setEnviando] = useState(false);

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erro", "Precisamos de acesso à câmera.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1, 
      base64: true,
    });

    if (!result.canceled) {
      setDetalhes({ ...detalhes, foto: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const finalizar = async () => {
    if (!detalhes.descricao && tipoFinalizacao === 'incompleto') {
      return Alert.alert("Aviso", "Por favor, descreva o que ficou pendente.");
    }

    setEnviando(true);
    
    try {
      const agora = new Date();
      const horaSaida = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const novosRegistros = registrosPonto.map(r => {
        if (r.status === 'trabalhando' && (r.nome === loggedUser?.nome || r.usuario === loggedUser?.nome)) {
          return { 
            ...r, 
            horaSaida, 
            status: tipoFinalizacao === 'completo' ? 'Concluído' : 'Pendente',
            fotoEntrega: detalhes.foto 
          };
        }
        return r;
      });
      setRegistrosPonto(novosRegistros);

      if (tipoFinalizacao === 'incompleto') {
        const novoIncompleto = {
          id: gerarId(),
          ...dadosAtividade,
          descricao: detalhes.descricao,
          prioridade: detalhes.prioridade,
          foto: detalhes.foto,
          criadoPor: loggedUser?.nome,
          data: agora.toLocaleDateString('pt-BR')
        };
        setServicosIncompletos([novoIncompleto, ...servicosIncompletos]);
      }

      setStatusPonto('ausente');
      setDadosAtividade({ inicio: null, setor: '', subsetor: '' });
      Alert.alert("Sucesso", "Atividade registrada!");
      navigation.navigate('MainFunc');
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar os dados.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Finalizar Atividade" onBack={() => passo === 1 ? navigation.goBack() : setPasso(1)} />
      <ScrollView contentContainerStyle={styles.container}>
        {passo === 1 ? (
          <View>
            <Text style={[styles.title, isDarkMode && styles.textWhite]}>O serviço foi concluído?</Text>
            <TouchableOpacity style={styles.btnGreen} onPress={() => { setTipoFinalizacao('completo'); setPasso(2); }}>
              <Text style={styles.btnText}>SIM, TUDO PRONTO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOrange} onPress={() => { setTipoFinalizacao('incompleto'); setPasso(2); }}>
              <Text style={styles.btnText}>NÃO, ESTÁ INCOMPLETO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={[styles.title, isDarkMode && styles.textWhite]}>
              {tipoFinalizacao === 'completo' ? 'Relatório de Conclusão' : 'Relatório de Pendência'}
            </Text>
            
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder={tipoFinalizacao === 'completo' ? "O que foi feito? (Opcional)" : "O que falta fazer? (Obrigatório)"}
              placeholderTextColor="#94a3b8"
              multiline
              value={detalhes.descricao}
              onChangeText={(t) => setDetalhes({ ...detalhes, descricao: t })}
            />
            
            {tipoFinalizacao === 'incompleto' && (
              <View style={styles.prioridadeRow}>
                {['Baixa', 'Média', 'Alta'].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.pBtn, detalhes.prioridade === p && styles.pBtnActive]}
                    onPress={() => setDetalhes({...detalhes, prioridade: p})}
                  >
                    <Text style={{color: detalhes.prioridade === p ? '#fff' : '#64748b'}}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ✅ Preview da foto com regra de não esticar */}
            {detalhes.foto && (
              <Image source={{ uri: detalhes.foto }} style={styles.fotoDisplay} resizeMode="contain" />
            )}

            <TouchableOpacity style={styles.btnBlue} onPress={tirarFoto}>
              <Text style={styles.btnText}>{detalhes.foto ? '🔄 TROCAR FOTO' : '📸 TIRAR FOTO (PROVA)'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnFinal, {backgroundColor: tipoFinalizacao === 'completo' ? '#16a34a' : '#ef4444'}]} 
              onPress={finalizar} 
              disabled={enviando}
            >
              {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>FINALIZAR AGORA</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#0f172a' },
  container: { padding: 25 },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 30, textAlign: 'center', color: '#1e293b' },
  textWhite: { color: '#fff' },
  btnGreen: { backgroundColor: '#16a34a', padding: 22, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  btnOrange: { backgroundColor: '#ea580c', padding: 22, borderRadius: 15, alignItems: 'center' },
  btnFinal: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnBlue: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' },
  inputDark: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155' },
  prioridadeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pBtn: { padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0', width: '30%', alignItems: 'center' },
  pBtnActive: { backgroundColor: '#2563eb' },
  // ✅ Estilo padronizado para fotos
  fotoDisplay: { width: '100%', height: 250, borderRadius: 12, marginBottom: 15, backgroundColor: '#0f172a' }
});