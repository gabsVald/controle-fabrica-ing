import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, Image } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import HeaderApp from '../components/HeaderApp';

export default function ServicosScreen({ navigation }) {
  const { 
    servicosIncompletos, setServicosIncompletos, 
    loggedUser, statusPonto, setStatusPonto, 
    setDadosAtividade, setRegistrosPonto, registrosPonto, isDarkMode
  } = useContext(AppContext);

  const retomarServico = (item) => {
    if (statusPonto === 'trabalhando') {
      Alert.alert("Ação Bloqueada", "Finalize a atividade atual antes de retomar outra.");
      return;
    }

    const agora = new Date();
    setDadosAtividade({ inicio: agora.toISOString(), setor: item.setor || 'Geral', subsetor: item.subsetor || 'N/A' });

    const novoRegistro = {
      id: Math.random().toString(),
      nome: loggedUser?.nome,
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      setor: item.setor,
      subsetor: item.subsetor,
      status: 'trabalhando'
    };

    setRegistrosPonto([novoRegistro, ...registrosPonto]);
    setStatusPonto('trabalhando');
    setServicosIncompletos(servicosIncompletos.filter(s => s.id !== item.id));
    navigation.navigate('Início');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      <View style={styles.cardHeader}>
        <Text style={styles.tag}>{item.setor} › {item.subsetor}</Text>
        <Text style={[styles.prioridade, item.prioridade === 'Alta' && {color: '#ef4444'}]}>{item.prioridade || 'Média'}</Text>
      </View>

      <Text style={[styles.desc, isDarkMode && styles.textDark]}>{item.descricao}</Text>
      <Text style={styles.autor}>Relatado por: {item.criadoPor || 'N/A'}</Text>

      {/* EXIBIÇÃO DA FOTO (NOVO) */}
      {item.foto && (
        <Image source={{ uri: item.foto }} style={styles.fotoServico} />
      )}
      
      {/* O GESTOR NÃO PODE RETOMAR SERVIÇOS (NOVO) */}
      {loggedUser?.perfil !== 'gestor' && (
        <TouchableOpacity style={styles.btnRetomar} onPress={() => retomarServico(item)}>
          <Ionicons name="play-circle-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>RETOMAR SERVIÇO</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Tarefas Pendentes" />
      <View style={styles.container}>
        <FlatList
          data={servicosIncompletos}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma tarefa pendente no momento.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
  bgDark: { backgroundColor: '#1e293b' },
  container: { padding: 20, flex: 1 },
  card: { padding: 22, borderRadius: 20, marginBottom: 15, elevation: 3 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#0f172a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tag: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
  prioridade: { fontSize: 10, color: '#ea580c', fontWeight: 'bold' },
  desc: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 5 },
  textDark: { color: '#f8fafc' },
  autor: { fontSize: 12, color: '#94a3b8', marginBottom: 15 },
  fotoServico: { width: '100%', height: 150, borderRadius: 10, marginBottom: 15 },
  btnRetomar: { 
    backgroundColor: '#1e293b', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center',
    alignSelf: 'center', // NÃO OCUPA A LARGURA INTEIRA
    width: '80%'
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});