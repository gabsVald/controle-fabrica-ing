import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Ionicons } from '@expo/vector-icons';

export default function HistoricoFuncionarioScreen({ navigation }) {
  const { 
    registrosPonto, 
    chamados, 
    solicitacoesCompra, 
    loggedUser, 
    isDarkMode 
  } = useContext(AppContext);

  const historicoGeral = useMemo(() => {
    const nomeUsuario = loggedUser?.nome;

    const servicos = registrosPonto
      .filter(r => r.nome === nomeUsuario || r.usuario === nomeUsuario)
      .map(r => ({
        ...r,
        tipo: 'SERVIÇO',
        icone: 'time-outline',
        cor: '#2563eb',
        dataReferencia: r.data || new Date(r.inicio).toLocaleDateString(),
        titulo: `${r.setor} › ${r.subsetor}`,
        _timestamp: r.inicio ? new Date(r.inicio).getTime() : 0,
      }));

    const manutencao = chamados
      .filter(c => c.criadoPor === nomeUsuario)
      .map(c => ({
        ...c,
        tipo: 'CHAMADO',
        icone: 'build-outline',
        cor: '#ea580c',
        dataReferencia: c.data || "Hoje",
        titulo: `Chamado: ${c.setor}`,
        _timestamp: c.id ? parseInt(c.id) : 0,
      }));

    const compras = solicitacoesCompra
      .filter(pc => pc.autor === nomeUsuario)
      .map(pc => ({
        ...pc,
        tipo: 'COMPRA',
        icone: 'cart-outline',
        cor: '#16a34a',
        dataReferencia: pc.data || "Hoje",
        titulo: `Compra: ${pc.item}`,
        _timestamp: pc.id ? parseInt(pc.id) : 0,
      }));

    // ✅ Ordena por timestamp real (mais recente primeiro) em vez de só inverter o array
    return [...servicos, ...manutencao, ...compras].sort((a, b) => b._timestamp - a._timestamp);
  }, [registrosPonto, chamados, solicitacoesCompra, loggedUser]);

  const renderItem = ({ item }) => (
    <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
          <Ionicons name={item.icone} size={20} color="#fff" />
        </View>
        <View style={styles.infoBox}>
          <Text style={[styles.tipoText, { color: item.cor }]}>{item.tipo}</Text>
          <Text style={[styles.titulo, isDarkMode && styles.textWhite]}>{item.titulo}</Text>
          <Text style={[styles.sub, isDarkMode && styles.textGray]}>
            {item.dataReferencia} {item.horaEntrada ? ` às ${item.horaEntrada}` : ''}
          </Text>
        </View>
      </View>
      {item.descricao && (
        <Text style={[styles.desc, isDarkMode && styles.textGray]}>{item.descricao}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Meu Histórico" onBack={() => navigation.goBack()} />
      <FlatList
        data={historicoGeral}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Você ainda não possui registros.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  card: { padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoBox: { marginLeft: 15, flex: 1 },
  tipoText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  sub: { fontSize: 12, color: '#64748b' },
  desc: { marginTop: 10, fontSize: 13, color: '#475569', fontStyle: 'italic', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  textWhite: { color: '#f8fafc' },
  textGray: { color: '#94a3b8' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});