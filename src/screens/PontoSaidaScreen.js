import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function PontoSaidaScreen({ navigation }) {
  const { loggedUser, dadosAtividade, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, setServicosIncompletos, servicosIncompletos } = useContext(AppContext);
  const [passo, setPasso] = useState(1);
  const [detalhes, setDetalhes] = useState({ descricao: '', prioridade: 'Média', foto: null });

  const tirarFoto = async () => {
    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!result.canceled) setDetalhes({...detalhes, foto: result.assets[0].uri});
  };

  const finalizar = (tipo) => {
    const agora = new Date();
    setRegistrosPonto(registrosPonto.map(r => (r.status === 'trabalhando' && r.nome === loggedUser.nome) ? 
      {...r, saida: agora.toLocaleTimeString(), status: tipo === 'completo' ? 'Completo' : 'Incompleto'} : r
    ));

    if (tipo === 'incompleto') {
      setServicosIncompletos([{
        id: Math.random().toString(), ...dadosAtividade, ...detalhes, criadoPor: loggedUser.nome, status: 'PENDENTE'
      }, ...servicosIncompletos]);
    }

    setStatusPonto('ausente');
    setDadosAtividade({ inicio: null, setor: '', subsetor: '' });
    navigation.navigate('MainFunc');
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#f8fafc'}}>
      <HeaderApp onBack={() => navigation.goBack()} />
      <ScrollView padding={20}>
        {passo === 1 ? (
          <View>
            <Text style={styles.title}>Finalizar Atividade</Text>
            <TouchableOpacity style={styles.btnGreen} onPress={() => finalizar('completo')}><Text style={styles.btnText}>SERVIÇO COMPLETO</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnOrange} onPress={() => setPasso(2)}><Text style={styles.btnText}>SERVIÇO INCOMPLETO</Text></TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Relatar Problema</Text>
            <TextInput style={styles.input} placeholder="Descrição..." value={detalhes.descricao} onChangeText={t => setDetalhes({...detalhes, descricao: t})} />
            <Text style={styles.label}>Prioridade:</Text>
            <View style={{flexDirection:'row', marginBottom: 20}}>
              {['Alta', 'Média', 'Baixa'].map(p => (
                <TouchableOpacity key={p} style={[styles.chip, detalhes.prioridade === p && styles.active]} onPress={() => setDetalhes({...detalhes, prioridade: p})}>
                  <Text style={detalhes.prioridade === p && {color:'#fff'}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btnBlue} onPress={tirarFoto}><Text style={styles.btnText}>{detalhes.foto ? '✅ Foto OK' : '📸 Tirar Foto'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnRed} onPress={() => finalizar('incompleto')}><Text style={styles.btnText}>ENVIAR E FINALIZAR</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  btnGreen: { backgroundColor: '#16a34a', padding: 25, borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  btnOrange: { backgroundColor: '#ea580c', padding: 25, borderRadius: 15, alignItems: 'center' },
  btnRed: { backgroundColor: '#ef4444', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  btnBlue: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  label: { fontWeight: 'bold', marginBottom: 10 },
  chip: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginRight: 10 },
  active: { backgroundColor: '#2563eb' }
});