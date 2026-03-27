import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Search, Trash2, Trash } from 'lucide-react-native'; // Lucide aqui

export default function RelatorioPontoScreen() {
  const { registrosPonto, setRegistrosPonto, isDarkMode, setLoggedUser } = useContext(AppContext);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const dadosFiltrados = useMemo(() => {
    return registrosPonto.filter(item => {
      const nomeUsuario = item.usuario || item.nome || "";
      const matchesBusca = nomeUsuario.toLowerCase().includes(busca.toLowerCase()) || 
                           item.setor.toLowerCase().includes(busca.toLowerCase());
      const matchesStatus = filtroStatus === 'todos' || item.status.toLowerCase() === filtroStatus.toLowerCase();
      return matchesBusca && matchesStatus;
    });
  }, [busca, filtroStatus, registrosPonto]);

  const limparTodos = () => {
    const msg = "Apagar TODO o histórico?";
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) setRegistrosPonto([]);
    } else {
      Alert.alert("Atenção", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: () => setRegistrosPonto([]) }
      ]);
    }
  };

  const removerRegistro = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Apagar registro?")) setRegistrosPonto(registrosPonto.filter(r => r.id !== id));
    } else {
      Alert.alert("Remover", "Apagar registro?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => setRegistrosPonto(registrosPonto.filter(r => r.id !== id)) }
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      <View style={styles.row}>
        <Text style={[styles.userName, isDarkMode && styles.textDark]}>{item.usuario || item.nome}</Text>
        <Text style={styles.statusBadge}>{item.status}</Text>
      </View>
      <Text style={[styles.info, isDarkMode && styles.textGray]}>{item.setor} › {item.subsetor}</Text>
      <View style={styles.row}>
        <Text style={[styles.time, isDarkMode && styles.textDark]}>Entrada: {item.horaEntrada}</Text>
        <Text style={[styles.time, isDarkMode && styles.textDark]}>Saída: {item.saida || '--:--'}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.data}</Text>
        <TouchableOpacity style={styles.btnTrashIndividual} onPress={() => removerRegistro(item.id)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Relatórios" onBack={() => setLoggedUser(null)} />
      <View style={{ padding: 15 }}>
        <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            style={[styles.input, isDarkMode && styles.textDark]}
            placeholder="Buscar..."
            placeholderTextColor="#94a3b8"
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            {['Todos', 'Trabalhando', 'Completo', 'Incompleto'].map(status => (
              <TouchableOpacity key={status} style={[styles.filterBtn, filtroStatus === status.toLowerCase() && styles.filterBtnActive]} onPress={() => setFiltroStatus(status.toLowerCase())}>
                <Text style={[styles.filterText, filtroStatus === status.toLowerCase() && styles.filterTextActive]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.btnTrashAll} onPress={limparTodos}>
            <Trash size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList data={dadosFiltrados} keyExtractor={item => item.id} renderItem={renderItem} ListEmptyComponent={<Text style={styles.empty}>Nenhum registro.</Text>} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 15 },
  searchBarDark: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, marginLeft: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  filterBtn: { padding: 8, borderRadius: 8, marginRight: 6, marginBottom: 8, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  btnTrashAll: { backgroundColor: '#ef4444', padding: 8, borderRadius: 8 },
  card: { padding: 15, borderRadius: 15, marginBottom: 12 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  userName: { fontWeight: 'bold', fontSize: 16 },
  statusBadge: { fontSize: 10, color: '#2563eb', fontWeight: 'bold' },
  info: { color: '#64748b', fontSize: 13 },
  time: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  date: { fontSize: 11, color: '#94a3b8' },
  btnTrashIndividual: { padding: 5, backgroundColor: '#fee2e2', borderRadius: 8 },
  textDark: { color: '#f8fafc' },
  textGray: { color: '#a1a1aa' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});