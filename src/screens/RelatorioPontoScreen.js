import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, Platform, Image, Modal } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Search, Trash2, Trash, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function RelatorioPontoScreen() {
  const { registrosPonto, setRegistrosPonto, isDarkMode, setLoggedUser } = useContext(AppContext);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [itemExpandido, setItemExpandido] = useState(null);
  const [modalFoto, setModalFoto] = useState(null);

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

  const toggleExpandir = (id) => {
    setItemExpandido(itemExpandido === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpandido = itemExpandido === item.id;
    const temFoto = !!item.fotoEntrega;
    const temObservacao = !!(item.observacaoFinal || item.observacao);
    const temDetalhes = temFoto || temObservacao;

    return (
      <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
        <View style={styles.row}>
          <Text style={[styles.userName, isDarkMode && styles.textDark]}>{item.usuario || item.nome}</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: item.status === 'Concluído' ? '#dcfce7' :
                           item.status === 'Pendente' ? '#fef3c7' :
                           item.status === 'trabalhando' ? '#dbeafe' : '#f1f5f9'
          }]}>
            <Text style={[styles.statusText, {
              color: item.status === 'Concluído' ? '#16a34a' :
                     item.status === 'Pendente' ? '#d97706' :
                     item.status === 'trabalhando' ? '#2563eb' : '#64748b'
            }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.info, isDarkMode && styles.textGray]}>
          {item.setor} › {item.subsetor}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.time, isDarkMode && styles.textDark]}>Entrada: {item.horaEntrada}</Text>
          <Text style={[styles.time, isDarkMode && styles.textDark]}>Saída: {item.saida || item.horaSaida || '--:--'}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{item.data}</Text>
          <View style={styles.footerActions}>
            {/* ✅ Botão de expandir detalhes */}
            {temDetalhes && (
              <TouchableOpacity style={styles.btnExpand} onPress={() => toggleExpandir(item.id)}>
                {isExpandido 
                  ? <ChevronUp size={18} color="#2563eb" /> 
                  : <ChevronDown size={18} color="#2563eb" />
                }
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnTrashIndividual} onPress={() => removerRegistro(item.id)}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Conteúdo expandível: Observações + Fotos */}
        {isExpandido && (
          <View style={styles.expandedSection}>
            {temObservacao && (
              <View style={styles.obsBox}>
                <Text style={styles.obsLabel}>📝 Observações:</Text>
                <Text style={[styles.obsText, isDarkMode && styles.textGray]}>
                  {item.observacaoFinal || item.observacao}
                </Text>
              </View>
            )}

            {temFoto && (
              <TouchableOpacity onPress={() => setModalFoto(item.fotoEntrega)}>
                <View style={styles.fotoBox}>
                  <Text style={styles.obsLabel}>📸 Evidência do Trabalho:</Text>
                  <Image
                    source={{ uri: item.fotoEntrega }}
                    style={styles.fotoRelatorio}
                    resizeMode="contain"
                  />
                  <Text style={styles.fotoHint}>Toque para ampliar</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Relatórios" />
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
            {['Todos', 'Trabalhando', 'Concluído', 'Pendente'].map(status => (
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

      {/* ✅ Modal para ver foto em tela cheia */}
      <Modal visible={!!modalFoto} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.fotoModalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalFoto(null)}
        >
          <Image 
            source={{ uri: modalFoto }} 
            style={styles.fotoModalImage} 
            resizeMode="contain" 
          />
          <Text style={styles.fotoModalClose}>Toque para fechar</Text>
        </TouchableOpacity>
      </Modal>
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
  card: { padding: 15, borderRadius: 15, marginHorizontal: 15, marginBottom: 12 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontWeight: 'bold', fontSize: 16 },
  
  // ✅ Status como badge colorido
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  info: { color: '#64748b', fontSize: 13, marginVertical: 5 },
  time: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  date: { fontSize: 11, color: '#94a3b8' },
  footerActions: { flexDirection: 'row', alignItems: 'center' },
  btnExpand: { padding: 5, backgroundColor: '#eff6ff', borderRadius: 8, marginRight: 8 },
  btnTrashIndividual: { padding: 5, backgroundColor: '#fee2e2', borderRadius: 8 },
  textDark: { color: '#f8fafc' },
  textGray: { color: '#a1a1aa' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },

  // ✅ Seção expandível
  expandedSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
  obsBox: { marginBottom: 12 },
  obsLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  obsText: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 20 },
  
  // ✅ Foto no relatório
  fotoBox: { marginTop: 5 },
  fotoRelatorio: { width: '100%', height: 250, borderRadius: 10, backgroundColor: '#0f172a', marginTop: 5 },
  fotoHint: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 5 },

  // ✅ Modal de foto em tela cheia
  fotoModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fotoModalImage: { width: '95%', height: '80%' },
  fotoModalClose: { color: '#fff', marginTop: 20, fontSize: 14 },
});