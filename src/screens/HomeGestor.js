import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function HomeGestor({ navigation }) {
  const { registrosPonto, setores, setLoggedUser } = useContext(AppContext);
  
  // Estados para os Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('Todos');
  const [filtroData, setFiltroData] = useState(new Date().toLocaleDateString('pt-BR'));
  const [showSetorModal, setShowSetorModal] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);

  // Lógica de Filtragem (Item 17 e Pedido do Usuário)
  const filtrarDados = (lista) => {
    return lista.filter(item => {
      const matchNome = (item.nome || item.usuario || '').toLowerCase().includes(filtroNome.toLowerCase());
      const matchSetor = filtroSetor === 'Todos' || item.setor === filtroSetor;
      const matchData = !filtroData || item.data === filtroData;
      return matchNome && matchSetor && matchData;
    });
  };

  const atividadesEmAberto = filtrarDados(registrosPonto.filter(r => r.status === 'trabalhando'));
  const atividadesConcluidas = filtrarDados(registrosPonto.filter(r => r.status === 'Completo' || r.saida));

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderApp onBack={() => { setLoggedUser(null); navigation.navigate('Login'); }} title="Painel de Controle" />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.mainTitle}>Atividades</Text>
          <TouchableOpacity onPress={() => setShowFiltros(!showFiltros)} style={styles.btnFiltro}>
            <Ionicons name="filter" size={20} color={showFiltros ? "#2563eb" : "#64748b"} />
            <Text style={[styles.btnFiltroText, showFiltros && {color: "#2563eb"}]}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Área de Filtros (Expansível) */}
        {showFiltros && (
          <View style={styles.filterArea}>
            <TextInput 
              style={styles.input} 
              placeholder="🔍 Buscar por nome do funcionário..." 
              value={filtroNome} 
              onChangeText={setFiltroNome} 
            />
            
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.selector} onPress={() => setShowSetorModal(true)}>
                <Text style={styles.selectorLabel}>Setor: </Text>
                <Text style={styles.selectorValue}>{filtroSetor}</Text>
              </TouchableOpacity>

              <View style={styles.dateInputArea}>
                 <Text style={styles.selectorLabel}>Data: </Text>
                 <TextInput 
                   style={styles.dateInput}
                   value={filtroData}
                   onChangeText={setFiltroData}
                   placeholder="00/00/0000"
                 />
              </View>
            </View>
            
            <TouchableOpacity style={styles.btnClear} onPress={() => { setFiltroNome(''); setFiltroSetor('Todos'); setFiltroData(new Date().toLocaleDateString('pt-BR')); }}>
              <Text style={styles.btnClearText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção 1: Em Aberto (Tarefas que o funcionário abriu mas não fechou) */}
        <Text style={styles.sectionTitle}>Em Aberto ({atividadesEmAberto.length})</Text>
        {atividadesEmAberto.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade pendente com estes filtros.</Text>
        ) : (
          atividadesEmAberto.map(item => (
            <View key={item.id} style={[styles.card, styles.cardAberto]}>
              <View>
                <Text style={styles.userName}>{item.nome || item.usuario}</Text>
                <Text style={styles.userLoc}>{item.setor} › {item.subsetor}</Text>
              </View>
              <Text style={styles.timeLabel}>{item.horaEntrada}</Text>
            </View>
          ))
        )}

        {/* Seção 2: Concluídas (Atividades do dia concluídas) */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Concluídas ({atividadesConcluidas.length})</Text>
        {atividadesConcluidas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma atividade concluída com estes filtros.</Text>
        ) : (
          atividadesConcluidas.map(item => (
            <View key={item.id} style={[styles.card, styles.cardConcluido]}>
              <View>
                <Text style={styles.userName}>{item.nome || item.usuario}</Text>
                <Text style={styles.userLoc}>{item.setor} › {item.subsetor}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.timeLabel}>{item.saida || 'Finalizado'}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Seleção de Setor */}
      <Modal visible={showSetorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Setor</Text>
            <FlatList
              data={['Todos', ...setores.map(s => s.nome)]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { setFiltroSetor(item); setShowSetorModal(false); }}
                >
                  <Text style={[styles.modalItemText, filtroSetor === item && {color: '#2563eb', fontWeight: 'bold'}]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.btnFecharModal} onPress={() => setShowSetorModal(false)}>
              <Text style={styles.btnFecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  btnFiltro: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  btnFiltroText: { fontSize: 14, fontWeight: 'bold', marginLeft: 5, color: '#64748b' },
  
  filterArea: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 14 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selector: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10, width: '48%' },
  selectorLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  selectorValue: { fontSize: 12, color: '#1e293b', fontWeight: 'bold' },
  dateInputArea: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10, width: '48%' },
  dateInput: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', flex: 1, padding: 0 },
  btnClear: { marginTop: 15, alignItems: 'center' },
  btnClearText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, elevation: 2 },
  cardAberto: { borderLeftWidth: 6, borderLeftColor: '#2563eb' },
  cardConcluido: { borderLeftWidth: 6, borderLeftColor: '#10b981' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  userLoc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  timeLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  emptyText: { color: '#94a3b8', fontSize: 14, fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, color: '#475569', textAlign: 'center' },
  btnFecharModal: { marginTop: 20, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnFecharText: { color: '#fff', fontWeight: 'bold' }
});