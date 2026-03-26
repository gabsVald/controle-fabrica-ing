import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import HeaderApp from '../components/HeaderApp';

export default function ServicosScreen({ navigation }) {
  const { 
    servicosIncompletos, setServicosIncompletos, 
    loggedUser, 
    setStatusPonto, setDadosAtividade, 
    registrosPonto, setRegistrosPonto 
  } = useContext(AppContext);

  // RF19 / RF13 - Lógica para Retomar e já Iniciar o Ponto automaticamente
  const retomarServico = (item) => {
    const agora = new Date();
    const horaEntrada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 1. Configura a atividade atual para ativar o cronómetro na Home
    setDadosAtividade({
      inicio: agora.toISOString(),
      setor: item.setor,
      subsetor: item.subsetor
    });

    // 2. Cria o registo de entrada no histórico (Item 5)
    const novoRegistro = {
      id: Math.random().toString(),
      nome: loggedUser?.nome || "Operador",
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: horaEntrada,
      setor: item.setor,
      subsetor: item.subsetor,
      status: 'trabalhando'
    };

    setRegistrosPonto([novoRegistro, ...registrosPonto]);
    setStatusPonto('trabalhando');

    // 3. Remove da lista de pendentes (ou marca como em andamento)
    setServicosIncompletos(servicosIncompletos.filter(s => s.id !== item.id));

    Alert.alert("Sucesso", `Serviço retomado em ${item.subsetor}!`);
    
    // 4. Volta para a Home (Navegação baseada no Item 22)
    navigation.navigate('Início'); 
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.tag}>{item.setor} › {item.subsetor}</Text>
        <Text style={[styles.prioridade, item.prioridade === 'Alta' && {color: '#ef4444'}]}>
          {item.prioridade || 'Média'}
        </Text>
      </View>

      <Text style={styles.desc}>{item.descricao}</Text>
      <Text style={styles.autor}>Relatado por: {item.criadoPor || 'N/A'}</Text>
      
      {/* Botão Retomar: Configura o Ponto e Navega automaticamente (RNF20) */}
      <TouchableOpacity style={styles.btnRetomar} onPress={() => retomarServico(item)}>
        <Ionicons name="play-circle-outline" size={20} color="#fff" />
        <Text style={styles.btnText}>Retomar serviço</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp title="Tarefas Pendentes" />
      <View style={styles.container}>
        <FlatList
          data={servicosIncompletos}
          keyExtractor={item => item.id}
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
  card: { backgroundColor: '#fff', padding: 22, borderRadius: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tag: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
  prioridade: { fontSize: 10, color: '#ea580c', fontWeight: 'bold' },
  desc: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 5 },
  autor: { fontSize: 12, color: '#94a3b8', marginBottom: 20 },
  btnRetomar: { 
    backgroundColor: '#1e293b', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center' 
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});