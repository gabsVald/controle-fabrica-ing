import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, TextInput } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function HomeGestor({ navigation }) {
  const { 
    registrosPonto, 
    setRegistrosPonto, 
    setServicosIncompletos, 
    setLoggedUser 
  } = useContext(AppContext);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Filtro inteligente em tempo real
  const dadosFiltrados = useMemo(() => {
    return registrosPonto.filter(item => {
      const matchesBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) || 
                           item.setor.toLowerCase().includes(busca.toLowerCase());
      const matchesStatus = filtroStatus === 'todos' || item.status === filtroStatus;
      return matchesBusca && matchesStatus;
    });
  }, [busca, filtroStatus, registrosPonto]);

  const limparDados = () => {
    Alert.alert("Limpar Registros", "Deseja apagar todo o histórico de atividades?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => { setRegistrosPonto([]); setServicosIncompletos([]); }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardRegistro}>
      <Ionicons 
        name={item.status === 'trabalhando' ? "play-circle" : "checkmark-circle"} 
        size={28} 
        color={item.status === 'trabalhando' ? "#2563eb" : "#10b981"} 
        style={styles.icon}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.nomeFunc}>{item.nome}</Text>
          <Text style={styles.horaBadge}>{item.horaEntrada}</Text>
        </View>
        <Text style={styles.info}>{item.setor} › {item.subsetor}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp onBack={() => { setLoggedUser(null); navigation.navigate('Login'); }} title="Monitoramento" />
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            style={styles.input}
            placeholder="Buscar funcionário ou setor..."
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <View style={styles.filterRow}>
          {['todos', 'trabalhando', 'finalizado'].map(status => (
            <TouchableOpacity 
              key={status}
              style={[styles.filterBtn, filtroStatus === status && styles.filterBtnActive]} 
              onPress={() => setFiltroStatus(status)}
            >
              <Text style={[styles.filterText, filtroStatus === status && styles.filterTextActive]}>
                {status === 'todos' ? 'Todos' : status === 'trabalhando' ? 'Ativos' : 'Concluídos'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.btnTrash} onPress={limparDados}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dadosFiltrados}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, height: 50, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  input: { flex: 1, marginLeft: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#1e293b' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  btnTrash: { marginLeft: 'auto', backgroundColor: '#fee2e2', padding: 10, borderRadius: 10 },
  cardRegistro: { backgroundColor: '#fff', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  icon: { marginRight: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  nomeFunc: { fontSize: 16, fontWeight: '700' },
  horaBadge: { fontSize: 11, backgroundColor: '#f1f5f9', padding: 4, borderRadius: 4 },
  info: { fontSize: 14, color: '#475569' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 50 }
});