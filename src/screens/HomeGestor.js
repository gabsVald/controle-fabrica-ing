import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function HomeGestor({ navigation }) {
  const { 
    registrosPonto, 
    setRegistrosPonto, 
    servicosIncompletos, 
    setServicosIncompletos, 
    solicitacoesCompra, 
    setSolicitacoesCompra, 
    setLoggedUser,
    statusPonto,
    setStatusPonto,
    setDadosAtividade,
    loggedUser
  } = useContext(AppContext);

  const removerCompra = (id) => {
    setSolicitacoesCompra(solicitacoesCompra.filter(c => c.id !== id));
    Alert.alert("Sucesso", "Solicitação removida.");
  };

  const limparDashboard = () => {
    Alert.alert(
      "Limpar Dashboard",
      "Deseja realmente apagar todo o histórico de tarefas e registros? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpar Tudo", 
          style: "destructive", 
          onPress: () => {
            setRegistrosPonto([]);
            setServicosIncompletos([]);
            Alert.alert("Sucesso", "O dashboard foi resetado.");
          } 
        }
      ]
    );
  };

  // Função para o Gestor assumir uma tarefa pendente
  const retomarTarefaComoGestor = (item) => {
    if (statusPonto === 'trabalhando') {
      Alert.alert("Ação Bloqueada", "Você já tem uma atividade em andamento.");
      return;
    }

    const agora = new Date();
    
    setDadosAtividade({
      inicio: agora.toISOString(),
      setor: item.setor,
      subsetor: item.subsetor
    });

    const novoRegistro = {
      id: Math.random().toString(),
      nome: `${loggedUser?.nome} (Gestor)`,
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      setor: item.setor,
      subsetor: item.subsetor,
      status: 'trabalhando'
    };

    setRegistrosPonto([novoRegistro, ...registrosPonto]);
    setServicosIncompletos(servicosIncompletos.filter(s => s.id !== item.id));
    setStatusPonto('trabalhando');

    Alert.alert("Sucesso", "Tarefa assumida! O cronômetro foi iniciado na sua Home.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp onBack={() => { setLoggedUser(null); navigation.navigate('Login'); }} title="Gestão de Fábrica" />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Painel Geral</Text>
          <TouchableOpacity style={styles.btnTrash} onPress={limparDashboard}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.btnTrashText}>Limpar Tarefas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.num}>{registrosPonto.filter(r => r.status === 'trabalhando').length}</Text>
            <Text style={styles.statLabel}>No Posto</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.num}>{solicitacoesCompra.length}</Text>
            <Text style={styles.statLabel}>Compras</Text>
          </View>
        </View>

        {/* SEÇÃO DE TAREFAS PENDENTES (NOVO) */}
        <Text style={styles.subTitle}>Tarefas Pendentes</Text>
        {servicosIncompletos.length === 0 ? (
          <Text style={styles.empty}>Nenhuma tarefa em aberto.</Text>
        ) : (
          servicosIncompletos.map(item => (
            <View key={item.id} style={styles.cardTarefa}>
              <View style={{flex: 1}}>
                <Text style={styles.cardItem}>{item.descricao}</Text>
                <Text style={styles.cardAuthor}>{item.setor} › {item.subsetor}</Text>
              </View>
              <TouchableOpacity 
                style={styles.btnRetomar} 
                onPress={() => retomarTarefaComoGestor(item)}
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.btnRetomarText}>Retomar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* SEÇÃO DE COMPRAS */}
        <Text style={[styles.subTitle, { marginTop: 25 }]}>Solicitações de Compra</Text>
        {solicitacoesCompra.length === 0 ? (
          <Text style={styles.empty}>Nenhuma solicitação pendente.</Text>
        ) : (
          solicitacoesCompra.map(c => (
            <View key={c.id} style={styles.card}>
              <View style={{flex:1}}>
                <Text style={styles.cardItem}>{c.item}</Text>
                <Text style={styles.cardAuthor}>Por: {c.autor}</Text>
              </View>
              <TouchableOpacity style={styles.btnRemove} onPress={() => removerCompra(c.id)}>
                <Ionicons name="close-circle" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
        
        <TouchableOpacity style={styles.btnNav} onPress={() => navigation.navigate('RelatorioPonto')}>
          <Text style={styles.btnNavText}>VER RELATÓRIO COMPLETO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#1e293b' },
  btnTrash: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', padding: 10, borderRadius: 12 },
  btnTrashText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  stat: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '48%', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  num: { fontSize: 32, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: 'bold', marginTop: 5 },
  subTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  cardTarefa: { backgroundColor: '#fff', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#2563eb', elevation: 1 },
  cardItem: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  cardAuthor: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  btnRemove: { padding: 5 },
  btnRetomar: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  btnRetomarText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
  btnNav: { backgroundColor: '#1e293b', padding: 22, borderRadius: 15, marginTop: 25, alignItems: 'center', elevation: 2 },
  btnNavText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 10, fontStyle: 'italic' }
});