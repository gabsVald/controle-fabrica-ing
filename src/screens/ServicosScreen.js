import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import HeaderApp from '../components/HeaderApp';

const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

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
    setDadosAtividade({ 
      inicio: agora.toISOString(), 
      setor: item.setor || 'Geral', 
      subsetor: item.subsetor || 'N/A' 
    });

    const novoRegistro = {
      id: gerarId(),
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
        <Text style={styles.prioridade}>Prioridade: {item.prioridade}</Text>
      </View>

      <Text style={[styles.desc, isDarkMode && { color: '#fff' }]}>{item.descricao}</Text>
      <Text style={styles.autor}>Relatado por: {item.criadoPor}</Text>

      {/* ✅ CORREÇÃO: resizeMode="contain" impede que a foto estique */}
      {item.foto ? (
        <Image 
          source={{ uri: item.foto }} 
          style={styles.fotoServico} 
          resizeMode="contain" 
        />
      ) : (
        <View style={styles.semFoto}>
          <Ionicons name="image-outline" size={24} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>Sem foto anexa</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btnRetomar} onPress={() => retomarServico(item)}>
        <Ionicons name="play-circle-outline" size={20} color="#fff" />
        <Text style={styles.btnText}>RETOMAR MANUTENÇÃO</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, isDarkMode && { backgroundColor: '#0f172a' }]}>
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
  container: { padding: 20, flex: 1 },
  card: { padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tag: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
  prioridade: { fontSize: 10, color: '#ea580c', fontWeight: 'bold' },
  desc: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  autor: { fontSize: 12, color: '#94a3b8', marginBottom: 15 },
  
  // ✅ CORREÇÃO: Altura definida para 250 e um fundo escuro neutro para imagens que não preenchem tudo
  fotoServico: { 
    width: '100%', 
    height: 250, 
    borderRadius: 12, 
    marginBottom: 15,
    backgroundColor: '#0f172a' 
  },
  semFoto: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed'
  },

  btnRetomar: { 
    backgroundColor: '#2563eb', 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});