import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function ComprasGestorScreen() {
  const { pedidosCompra, setPedidosCompra, isDarkMode } = useContext(AppContext);

  const atualizarStatus = (id, novoStatus) => {
    const novosPedidos = pedidosCompra.map(p => 
      p.id === id ? { ...p, status: novoStatus } : p
    );
    setPedidosCompra(novosPedidos);
    Alert.alert("Sucesso", `Pedido ${novoStatus === 'Aprovado' ? 'aprovado' : 'rejeitado'}!`);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.itemNome, isDarkMode && styles.textWhite]}>{item.item}</Text>
        <Text style={[styles.statusTag, 
          item.status === 'Pendente' ? styles.statusPendente : 
          item.status === 'Aprovado' ? styles.statusAprovado : styles.statusRejeitado]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, isDarkMode && styles.textGray]}>Solicitante: {item.solicitante}</Text>
        <Text style={[styles.infoText, isDarkMode && styles.textGray]}>Qtd: {item.quantidade}</Text>
      </View>

      {item.status === 'Pendente' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.btnRejeitar} 
            onPress={() => atualizarStatus(item.id, 'Rejeitado')}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.btnText}>REJEITAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnAprovar} 
            onPress={() => atualizarStatus(item.id, 'Aprovado')}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.btnText}>APROVAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Gestão de Compras" />
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.textWhite]}>Solicitações Pendentes</Text>
        <FlatList
          data={pedidosCompra}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma solicitação no momento.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' }, // PRETO REAL
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 20, textAlign: 'center' },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardDark: { backgroundColor: '#1e1e1e' }, // CINZA CHUMBO
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemNome: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  
  statusTag: { fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPendente: { backgroundColor: '#fef9c3', color: '#854d0e' },
  statusAprovado: { backgroundColor: '#dcfce7', color: '#166534' },
  statusRejeitado: { backgroundColor: '#fee2e2', color: '#991b1b' },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoText: { color: '#64748b', fontSize: 14 },
  
  actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
  
  btnAprovar: { 
    backgroundColor: '#16a34a', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 12 
  },
  btnRejeitar: { 
    backgroundColor: '#ef4444', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 12 
  },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 13 },
  
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50, fontSize: 16 },
  textWhite: { color: '#ffffff' },
  textGray: { color: '#a1a1aa' }
});