import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, TextInput } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function HomeGestor({ navigation }) {
  const { 
    registrosPonto, 
    setRegistrosPonto, 
    servicosIncompletos, 
    setServicosIncompletos, 
    setLoggedUser 
  } = useContext(AppContext);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, trabalhando, finalizado

  // Lógica de Filtro (Memoizada para performance)
  const dadosFiltrados = useMemo(() => {
    return registrosPonto.filter(item => {
      const matchesBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) || 
                           item.setor.toLowerCase().includes(busca.toLowerCase());
      const matchesStatus = filtroStatus === 'todos' || item.status === filtroStatus;
      return matchesBusca && matchesStatus;
    });
  }, [busca, filtroStatus, registrosPonto]);

  const limparDados = () => {
    Alert.alert("Limpar Registros", "Apagar todo o histórico?", [
      { text: "Cancelar" },
      { text: "Limpar", style: "destructive", onPress: () => { setRegistrosPonto([]); setServicosIncompletos([]); }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardRegistro}>
      <View style={styles.statusIndicator}>
        <Ionicons 
          name={item.status === 'trabalhando' ? "play-circle" : "checkmark-circle"} 
          size={28} 
          color={item.status === 'trabalhando' ? "#2563eb" : "#10b981"} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.nomeFunc}>{item.nome}</Text>
          <Text style={styles.horaBadge}>{item.horaEntrada}</Text>
        </View>
        <Text style={styles.infoTarefa}>{item.setor} › {item.subsetor}</Text>
        <Text style={styles.dataText}>{item.data}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp onBack={() => { setLoggedUser(null); navigation.navigate('Login'); }} title="Monitoramento" />
      
      <View style={styles.container}>
        {/* BARRA DE BUSCA */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            style={styles.input}
            placeholder="Buscar funcionário ou setor..."
            value={busca}
            onChangeText={setBusca}
          />
          {busca !== '' && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTROS RAPIDOS */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterBtn, filtroStatus === 'todos' && styles.filterBtnActive]} 
            onPress={() => setFiltroStatus('todos')}
          >
            <Text style={[styles.filterText, filtroStatus === 'todos' && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filtroStatus === 'trabalhando' && styles.filterBtnActive]} 
            onPress={() => setFiltroStatus('trabalhando')}
          >
            <Text style={[styles.filterText, filtroStatus === 'trabalhando' && styles.filterTextActive]}>Ativos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filtroStatus === 'finalizado' && styles.filterBtnActive]} 
            onPress={() => setFiltroStatus('finalizado')}
          >
            <Text style={[styles.filterText, filtroStatus === 'finalizado' && styles.filterTextActive]}>Concluídos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnTrash} onPress={limparDados}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dadosFiltrados}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>Nenhum registro encontrado.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    borderRadius: 12, 
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 15
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  filterRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#1e293b' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  btnTrash: { marginLeft: 'auto', backgroundColor: '#fee2e2', padding: 10, borderRadius: 10 },
  cardRegistro: { backgroundColor: '#fff', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  statusIndicator: { marginRight: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomeFunc: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  horaBadge: { fontSize: 11, fontWeight: 'bold', color: '#64748b', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 4 },
  infoTarefa: { fontSize: 14, color: '#475569', marginTop: 2 },
  dataText: { fontSize: 10, color: '#94a3b8', marginTop: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  empty: { color: '#94a3b8', fontStyle: 'italic' }
});