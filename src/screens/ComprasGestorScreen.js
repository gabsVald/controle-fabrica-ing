import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Platform } from 'react-native'; // ✅ Platform adicionado
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react-native';

export default function ComprasGestorScreen() {
  const { solicitacoesCompra, setSolicitacoesCompra, isDarkMode } = useContext(AppContext);

  const atualizarStatus = (id, novoStatus) => {
    const novos = solicitacoesCompra.map(p => p.id === id ? { ...p, status: novoStatus } : p);
    setSolicitacoesCompra(novos);
    if (Platform.OS !== 'web') Alert.alert("Sucesso", `Pedido ${novoStatus}!`);
  };

  // ✅ Função blindada (Web e Android)
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
          <Text style={styles.statusTag}>{item.status}</Text>
        </View>
        <TouchableOpacity onPress={() => excluirCompra(item.id)} style={{ padding: 5 }}>
          <Trash2 size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Solicitante: {item.autor}</Text>
        <Text style={styles.infoText}>Qtd: {item.quantidade}</Text>
      </View>
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
        ListEmptyComponent={<Text style={styles.emptyText}>Sem solicitações.</Text>} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15 },
  cardDark: { backgroundColor: '#1e1e1e' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemNome: { fontSize: 18, fontWeight: 'bold' },
  statusTag: { fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  infoText: { color: '#64748b' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
  btnAprovar: { backgroundColor: '#16a34a', flexDirection: 'row', padding: 10, borderRadius: 12 },
  btnRejeitar: { backgroundColor: '#ef4444', flexDirection: 'row', padding: 10, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 50 },
  textWhite: { color: '#ffffff' }
});