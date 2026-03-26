import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function RelatorioPontoScreen() {
  const { registrosPonto } = useContext(AppContext);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.userName}>{item.nome}</Text>
        <Text style={styles.statusBadge}>{item.status}</Text>
      </View>
      <Text style={styles.info}>{item.setor} › {item.subsetor}</Text>
      <View style={styles.row}>
        <Text style={styles.time}>Entrada: {item.horaEntrada}</Text>
        <Text style={styles.time}>Saída: {item.saida || '--:--'}</Text>
      </View>
      <Text style={styles.date}>{item.data}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp title="Relatórios de Ponto" />
      <FlatList
        data={registrosPonto}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  statusBadge: { fontSize: 10, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase' },
  info: { color: '#64748b', fontSize: 13, marginBottom: 10 },
  time: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});