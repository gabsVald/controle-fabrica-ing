import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function RelatorioPontoScreen() {
  const { registrosPonto, isDarkMode, setLoggedUser } = useContext(AppContext);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const dadosFiltrados = useMemo(() => {
    return registrosPonto.filter(item => {
      const matchesBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) || 
                           item.setor.toLowerCase().includes(busca.toLowerCase());
      const matchesStatus = filtroStatus === 'todos' || item.status.toLowerCase() === filtroStatus.toLowerCase();
      return matchesBusca && matchesStatus;
    });
  }, [busca, filtroStatus, registrosPonto]);

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      <View style={styles.row}>
        <Text style={[styles.userName, isDarkMode && styles.textDark]}>{item.nome}</Text>
        <Text style={styles.statusBadge}>{item.status}</Text>
      </View>
      <Text style={[styles.info, isDarkMode && styles.textGray]}>{item.setor} › {item.subsetor}</Text>
      <View style={styles.row}>
        <Text style={[styles.time, isDarkMode && styles.textDark]}>Entrada: {item.horaEntrada}</Text>
        <Text style={[styles.time, isDarkMode && styles.textDark]}>Saída: {item.saida || '--:--'}</Text>
      </View>
      <Text style={styles.date}>{item.data}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Relatórios" onBack={() => setLoggedUser(null)} />
      
      <View style={{ padding: 15 }}>
        <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            style={[styles.input, isDarkMode && styles.textDark]}
            placeholder="Buscar por funcionário ou setor..."
            placeholderTextColor="#94a3b8"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <View style={styles.filterRow}>
          {['Todos', 'Trabalhando', 'Completo', 'Incompleto'].map(status => (
            <TouchableOpacity 
              key={status}
              style={[styles.filterBtn, filtroStatus === status.toLowerCase() && styles.filterBtnActive]} 
              onPress={() => setFiltroStatus(status.toLowerCase())}
            >
              <Text style={[styles.filterText, filtroStatus === status.toLowerCase() && styles.filterTextActive]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={dadosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#1e293b' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 15 },
  searchBarDark: { backgroundColor: '#334155' },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  filterRow: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  card: { padding: 20, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#0f172a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  statusBadge: { fontSize: 10, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' },
  info: { color: '#64748b', fontSize: 13, marginBottom: 10 },
  time: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'right' },
  textDark: { color: '#f8fafc' },
  textGray: { color: '#cbd5e1' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});