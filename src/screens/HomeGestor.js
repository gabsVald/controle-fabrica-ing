import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function HomeGestor() {
  const { registrosPonto, servicosIncompletos } = useContext(AppContext);
  const ativos = registrosPonto.filter(r => r.status === 'trabalhando');

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp title="Dashboard Fabril" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, {backgroundColor: '#dcfce7'}]}>
            <Text style={styles.statNum}>{ativos.length}</Text>
            <Text style={styles.statLabel}>No Posto</Text>
          </View>
          <View style={[styles.statBox, {backgroundColor: '#fee2e2'}]}>
            <Text style={styles.statNum}>{servicosIncompletos.length}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Funcionários Ativos</Text>
        {ativos.map(a => (
          <View key={a.id} style={styles.userCard}>
            <View>
              <Text style={styles.userName}>{a.nome}</Text>
              <Text style={styles.userLoc}>{a.setor} › {a.subsetor}</Text>
            </View>
            <Text style={styles.userTime}>{a.horaEntrada}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { width: '48%', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 36, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 15 },
  userCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userLoc: { fontSize: 12, color: '#2563eb', fontWeight: 'bold' },
  userTime: { fontSize: 14, color: '#64748b' }
});