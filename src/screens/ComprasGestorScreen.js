import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import HeaderApp from '../components/HeaderApp';

export default function ComprasGestorScreen() {
  const { solicitacoesCompra, setSolicitacoesCompra } = useContext(AppContext);

  const remover = (id) => setSolicitacoesCompra(solicitacoesCompra.filter(c => c.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp title="Solicitações de compra" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {solicitacoesCompra.map(c => (
          <View key={c.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{c.item}</Text>
              <Text style={styles.itemSub}>{c.qtd} un • Por: {c.autor}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnCheck} onPress={() => remover(c.id)}>
                <Ionicons name="checkmark" size={20} color="#16a34a" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnTrash} onPress={() => remover(c.id)}>
                <Ionicons name="trash" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#64748b' },
  actions: { flexDirection: 'row' },
  btnCheck: { backgroundColor: '#dcfce7', padding: 10, borderRadius: 10, marginLeft: 10 },
  btnTrash: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 10, marginLeft: 10 }
});