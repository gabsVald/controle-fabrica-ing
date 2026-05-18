import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
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

  const [itemExpandido, setItemExpandido] = useState(null);
  const [modalFoto, setModalFoto] = useState(null);

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
        _timestamp: r.inicio ? new Date(r.inicio).getTime() : (r.id ? parseInt(r.id) : 0),
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

    // ✅ Ordenação por data (mais recente primeiro)
    return [...servicos, ...manutencao, ...compras].sort((a, b) => b._timestamp - a._timestamp);
  }, [registrosPonto, chamados, solicitacoesCompra, loggedUser]);

  const toggleExpandir = (id) => {
    setItemExpandido(itemExpandido === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpandido = itemExpandido === item.id;
    const temFoto = item.fotoEntrega || item.foto;
    const temObservacao = item.observacaoFinal || item.observacao || item.descricao;
    const temDetalhes = temFoto || temObservacao;

    return (
      <TouchableOpacity 
        style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}
        onPress={() => temDetalhes && toggleExpandir(item.id)}
        activeOpacity={temDetalhes ? 0.7 : 1}
      >
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: item.cor }]}>
            <Ionicons name={item.icone} size={20} color="#fff" />
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.tipoText, { color: item.cor }]}>{item.tipo}</Text>
            <Text style={[styles.titulo, isDarkMode && styles.textWhite]}>{item.titulo}</Text>
            <Text style={[styles.sub, isDarkMode && styles.textGray]}>
              {item.dataReferencia} {item.horaEntrada ? ` às ${item.horaEntrada}` : ''}
              {item.horaSaida ? ` → ${item.horaSaida}` : ''}
            </Text>
          </View>
          {temDetalhes && (
            <Ionicons 
              name={isExpandido ? "chevron-up-outline" : "chevron-down-outline"} 
              size={20} 
              color="#94a3b8" 
            />
          )}
        </View>
        
        {/* ✅ Status badge */}
        {item.status && (
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'Concluído' ? '#dcfce7' : 
                           item.status === 'Pendente' ? '#fef3c7' : '#dbeafe' 
          }]}>
            <Text style={[styles.statusText, { 
              color: item.status === 'Concluído' ? '#16a34a' : 
                     item.status === 'Pendente' ? '#d97706' : '#2563eb' 
            }]}>{item.status}</Text>
          </View>
        )}

        {/* ✅ Conteúdo expandível: Observações e Fotos */}
        {isExpandido && (
          <View style={styles.expandedContent}>
            {temObservacao && (
              <View style={styles.obsContainer}>
                <Text style={styles.obsLabel}>📝 Observação:</Text>
                <Text style={[styles.obsText, isDarkMode && styles.textGray]}>
                  {item.observacaoFinal || item.observacao || item.descricao}
                </Text>
              </View>
            )}

            {temFoto && (
              <TouchableOpacity onPress={() => setModalFoto(item.fotoEntrega || item.foto)}>
                <View style={styles.fotoContainer}>
                  <Text style={styles.obsLabel}>📸 Evidência:</Text>
                  <Image 
                    source={{ uri: item.fotoEntrega || item.foto }} 
                    style={styles.fotoHistorico} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.fotoHint}>Toque para ampliar</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
  card: { padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
  cardLight: { backgroundColor: '#fff' },
  cardDark: { backgroundColor: '#1e1e1e' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoBox: { marginLeft: 15, flex: 1 },
  tipoText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  sub: { fontSize: 12, color: '#64748b' },
  textWhite: { color: '#f8fafc' },
  textGray: { color: '#94a3b8' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },

  // ✅ Status badge
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10, marginLeft: 55 },
  statusText: { fontSize: 11, fontWeight: 'bold' },

  // ✅ Conteúdo expandível
  expandedContent: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  obsContainer: { marginBottom: 12 },
  obsLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  obsText: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 20 },

  // ✅ Foto no histórico
  fotoContainer: { marginTop: 5 },
  fotoHistorico: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#0f172a', marginTop: 5 },
  fotoHint: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 5 },

  // ✅ Modal de foto em tela cheia
  fotoModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fotoModalImage: { width: '95%', height: '80%' },
  fotoModalClose: { color: '#fff', marginTop: 20, fontSize: 14 },
});