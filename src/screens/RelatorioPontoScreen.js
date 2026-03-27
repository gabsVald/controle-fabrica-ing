import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function RelatorioPontoScreen() {
  const { registrosPonto, setRegistrosPonto, isDarkMode, setLoggedUser } = useContext(AppContext);
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

  // Função para limpar TODOS os registros com suporte Web e Mobile
  const limparTodos = () => {
    if (Platform.OS === 'web') {
      const confirma = window.confirm("Tem certeza que deseja apagar TODO o histórico de atividades?");
      if (confirma) setRegistrosPonto([]);
    } else {
      Alert.alert(
        "Atenção", 
        "Tem certeza que deseja apagar TODO o histórico de atividades?", 
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, apagar", style: "destructive", onPress: () => setRegistrosPonto([]) }
        ]
      );
    }
  };

  // Função para excluir um ÚNICO registro com suporte Web e Mobile
  const removerRegistro = (id) => {
    if (Platform.OS === 'web') {
      const confirma = window.confirm("Deseja apagar este registro do histórico?");
      if (confirma) {
        setRegistrosPonto(registrosPonto.filter(r => r.id !== id));
      }
    } else {
      Alert.alert(
        "Remover Registro", 
        "Deseja apagar este registro do histórico?", 
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Apagar", 
            style: "destructive", 
            onPress: () => {
              setRegistrosPonto(registrosPonto.filter(r => r.id !== id));
            }
          }
        ]
      );
    }
  };

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
      
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.data}</Text>
        
        {/* BOTÃO LIXEIRA INDIVIDUAL */}
        <TouchableOpacity style={styles.btnTrashIndividual} onPress={() => removerRegistro(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Relatórios" />
      
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

        <View style={styles.filterContainer}>
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

          {/* BOTÃO LIMPAR TUDO */}
          <TouchableOpacity style={styles.btnTrashAll} onPress={limparTodos}>
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
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
  bgDark: { backgroundColor: '#121212' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 15 },
  searchBarDark: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 6, marginBottom: 8, backgroundColor: '#e2e8f0' },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  
  btnTrashAll: { backgroundColor: '#ef4444', padding: 8, borderRadius: 8, marginLeft: 10, marginBottom: 8 },
  
  card: { padding: 20, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  statusBadge: { fontSize: 10, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' },
  info: { color: '#64748b', fontSize: 13, marginBottom: 10 },
  time: { fontSize: 12, fontWeight: '600' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  date: { fontSize: 11, color: '#94a3b8' },
  btnTrashIndividual: { padding: 5, backgroundColor: '#fee2e2', borderRadius: 8 },
  
  textDark: { color: '#f8fafc' },
  textGray: { color: '#a1a1aa' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});