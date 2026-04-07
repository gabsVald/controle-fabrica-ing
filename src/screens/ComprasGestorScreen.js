import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Platform, TextInput } from 'react-native'; 
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { CheckCircle, XCircle, Trash2, Clock, Calendar } from 'lucide-react-native';

export default function ComprasGestorScreen() {
  const { solicitacoesCompra, setSolicitacoesCompra, isDarkMode } = useContext(AppContext);
  const [obsText, setObsText] = useState({}); // Estado para controlar o texto da OBS de cada card

  const atualizarStatus = (id, novoStatus) => {
    const agora = new Date().toLocaleString('pt-BR');
    const novos = solicitacoesCompra.map(p => 
      p.id === id ? { 
        ...p, 
        status: novoStatus, 
        dataResposta: agora, 
        observacaoGestor: obsText[id] || '' 
      } : p
    );
    setSolicitacoesCompra(novos);
    if (Platform.OS !== 'web') Alert.alert("Sucesso", `Pedido ${novoStatus}!`);
  };

  const excluirCompra = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Deseja apagar esta requisição do histórico?")) {
        setSolicitacoesCompra(prev => prev.filter(c => c.id !== id));
      }
    } else {
      Alert.alert("Excluir", "Deseja apagar esta requisição do histórico?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => setSolicitacoesCompra(prev => prev.filter(c => c.id !== id)) }
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemNome, isDarkMode && styles.textWhite]}>{item.item}</Text>
          <Text style={[styles.statusTag, { color: item.status === 'Pendente' ? '#eab308' : item.status === 'Aprovado' ? '#16a34a' : '#ef4444' }]}>
            ● {item.status.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => excluirCompra(item.id)} style={{ padding: 5 }}>
          <Trash2 size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Solicitante: {item.autor}</Text>
        <Text style={styles.infoText}>Qtd/Obs: {item.quantidade}</Text>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.dateRow}>
          <Clock size={14} color="#94a3b8" />
          <Text style={styles.dateText}> Solicitado em: {item.data || 'N/A'}</Text>
        </View>
        {item.dataResposta && (
          <View style={styles.dateRow}>
            <Calendar size={14} color="#94a3b8" />
            <Text style={styles.dateText}> Respondido em: {item.dataResposta}</Text>
          </View>
        )}
      </View>

      {/* Campo de Observação */}
      {item.status === 'Pendente' ? (
        <View style={styles.obsSection}>
          <Text style={[styles.obsLabel, isDarkMode && styles.textWhite]}>Observação do Gestor:</Text>
          <TextInput
            style={[styles.inputObs, isDarkMode && styles.inputDark]}
            placeholder="Ex: Urgente, aguardar estoque, etc..."
            placeholderTextColor="#9b7c7c"
            multiline
            value={obsText[item.id] || ''}
            onChangeText={(text) => setObsText({ ...obsText, [item.id]: text })}
          />
        </View>
      ) : (
        item.observacaoGestor ? (
          <View style={styles.obsExibicao}>
            <Text style={styles.obsLabel}>Nota do Gestor:</Text>
            <Text style={[styles.obsTextFinal, isDarkMode && styles.textWhite]}>{item.observacaoGestor}</Text>
          </View>
        ) : null
      )}

      {item.status === 'Pendente' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnRejeitar} onPress={() => atualizarStatus(item.id, 'Rejeitado')}>
            <XCircle size={20} color="#fff" />
            <Text style={styles.btnText}>REJEITAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAprovar} onPress={() => atualizarStatus(item.id, 'Aprovado')}>
            <CheckCircle size={20} color="#fff" />
            <Text style={styles.btnText}>APROVAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Gestão de Compras" />
      <FlatList 
        data={solicitacoesCompra} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={{ padding: 20 }} 
        ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode && styles.textWhite]}>Sem solicitações.</Text>} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1e1e1e' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemNome: { fontSize: 18, fontWeight: 'bold' },
  statusTag: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  infoText: { color: '#64748b', fontWeight: '600' },
  dateContainer: { marginVertical: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0', paddingLeft: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#94a3b8' },
  obsSection: { marginTop: 10 },
  obsLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  inputObs: { 
    backgroundColor: '#f1f5f9', 
    borderRadius: 10, 
    padding: 10, 
    height: 60, 
    textAlignVertical: 'top',
    fontSize: 14
  },
  inputDark: { backgroundColor: '#2d2d2d', color: '#fff' },
  obsExibicao: { marginTop: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  obsTextFinal: { fontSize: 14, color: '#1e293b', fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15, marginTop: 15 },
  btnAprovar: { backgroundColor: '#16a34a', flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnRejeitar: { backgroundColor: '#ef4444', flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
  textWhite: { color: '#ffffff' }
});