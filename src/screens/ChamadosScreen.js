import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function ChamadosScreen({ navigation }) {
  const { chamados, setChamados, loggedUser, isDarkMode, statusPonto, setDadosAtividade, setRegistrosPonto, registrosPonto, setStatusPonto } = useContext(AppContext);
  const [novoChamado, setNovoChamado] = useState(false);
  const [setor, setSetor] = useState('');
  const [descricao, setDescricao] = useState('');

  const criarChamado = () => {
    if (!setor || !descricao) return Alert.alert("Erro", "Preencha setor e descrição.");
    
    const chamado = { id: Math.random().toString(), setor, subsetor: 'Programado', descricao, criadoPor: loggedUser.nome, status: 'Aberto' };
    setChamados([chamado, ...chamados]);
    setSetor(''); setDescricao(''); setNovoChamado(false);
    Alert.alert("Sucesso", "Chamado programado criado!");
  };

  const comecarChamado = (item) => {
    if (statusPonto === 'trabalhando') return Alert.alert("Erro", "Finalize a tarefa atual.");
    
    const agora = new Date();
    setDadosAtividade({ inicio: agora.toISOString(), setor: item.setor, subsetor: item.subsetor });
    
    setRegistrosPonto([{ id: Math.random().toString(), nome: loggedUser.nome, data: agora.toLocaleDateString('pt-BR'), horaEntrada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), setor: item.setor, subsetor: item.subsetor, status: 'trabalhando' }, ...registrosPonto]);
    setStatusPonto('trabalhando');
    setChamados(chamados.filter(c => c.id !== item.id));
    navigation.navigate('Início');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Chamados" />
      <View style={{ padding: 20, flex: 1 }}>
        {novoChamado ? (
          <View style={[styles.form, isDarkMode && styles.formDark]}>
            <Text style={[styles.label, isDarkMode && styles.textDark]}>Setor / Máquina</Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={setor} onChangeText={setSetor} />
            <Text style={[styles.label, isDarkMode && styles.textDark]}>Descrição do Serviço</Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={descricao} onChangeText={setDescricao} multiline />
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setNovoChamado(false)}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={criarChamado}><Text style={styles.btnText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.btnCreate} onPress={() => setNovoChamado(true)}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.btnText}>NOVO CHAMADO</Text>
            </TouchableOpacity>
            <FlatList
              data={chamados}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.empty}>Nenhum chamado programado.</Text>}
              renderItem={({ item }) => (
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                  <Text style={styles.tag}>{item.setor}</Text>
                  <Text style={[styles.desc, isDarkMode && styles.textDark]}>{item.descricao}</Text>
                  
                  {/* TRAVA DE SEGURANÇA: GESTOR NÃO VÊ O BOTÃO "COMEÇAR" */}
                  {loggedUser?.perfil !== 'gestor' && (
                    <TouchableOpacity style={styles.btnStart} onPress={() => comecarChamado(item)}>
                      <Text style={styles.btnText}>COMEÇAR SERVIÇO</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' }, // PRETO REAL
  btnCreate: { backgroundColor: '#2563eb', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '80%', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  formDark: { backgroundColor: '#1e1e1e' }, // CINZA CHUMBO
  label: { fontWeight: 'bold', marginBottom: 5, color: '#1e293b' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, color: '#1e293b' },
  inputDark: { borderColor: '#333', color: '#fff', backgroundColor: '#121212' },
  textDark: { color: '#fff' },
  btnSave: { backgroundColor: '#16a34a', padding: 12, borderRadius: 10, marginLeft: 10, width: 120, alignItems: 'center' },
  btnCancel: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, width: 120, alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1e1e1e' }, // CINZA CHUMBO
  tag: { color: '#2563eb', fontWeight: 'bold', fontSize: 12 },
  desc: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#1e293b' },
  btnStart: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, alignItems: 'center', alignSelf: 'center', width: '70%' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 30 }
});