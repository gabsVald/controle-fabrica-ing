import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

// ✅ Gerador de ID único
const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function PontoEntradaScreen({ navigation }) {
  const { setores, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, loggedUser, isDarkMode } = useContext(AppContext);
  const [setorObjeto, setSetorObjeto] = useState(null);

  const confirmarEntrada = (nomeSetor, nomeSub) => {
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setDadosAtividade({ 
      inicio: agora.toISOString(), 
      setor: nomeSetor, 
      subsetor: nomeSub 
    });

    const novo = {
      id: gerarId(), // ✅ ID único
      nome: loggedUser?.nome || "Operador",
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: horaFormatada,
      setor: nomeSetor,
      subsetor: nomeSub,
      status: 'trabalhando'
    };

    setRegistrosPonto([novo, ...registrosPonto]);
    setStatusPonto('trabalhando');
    navigation.navigate('MainFunc');
  };

  const handlePressSetor = (s) => {
    if (s.subsetores && s.subsetores.length === 1) {
      confirmarEntrada(s.nome, s.subsetores[0]);
    } else {
      setSetorObjeto(s);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.bgDark]}>
      <HeaderApp onBack={() => navigation.goBack()} title="Entrada" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, isDarkMode && styles.textWhite]}>
          {!setorObjeto ? "Selecionar Setor" : setorObjeto.nome}
        </Text>
        <View style={styles.grid}>
          {!setorObjeto ? (
            setores.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.card, isDarkMode && styles.cardDark]}
                onPress={() => handlePressSetor(s)}
              >
                <Text style={[styles.cardText, isDarkMode && styles.textWhite]}>{s.nome}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <>
              {setorObjeto.subsetores.map((sub, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, styles.cardSub]}
                  onPress={() => confirmarEntrada(setorObjeto.nome, sub)}
                >
                  <Text style={styles.textWhite}>{sub}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.btnVoltar} onPress={() => setSetorObjeto(null)}>
                <Text style={styles.textVoltar}>← Voltar para Setores</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 20, textAlign: 'center', color: '#1e293b' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', height: 100, backgroundColor: '#fff', borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  cardDark: { backgroundColor: '#1e1e1e' },
  cardSub: { backgroundColor: '#2563eb' },
  cardText: { fontWeight: 'bold', color: '#1e293b', textAlign: 'center', paddingHorizontal: 5 },
  textWhite: { color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
  btnVoltar: { width: '100%', alignItems: 'center', padding: 20 },
  textVoltar: { color: '#64748b', fontWeight: 'bold' }
});