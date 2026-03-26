import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function PontoEntradaScreen({ navigation }) {
  const { setores, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, loggedUser } = useContext(AppContext);
  const [setorSel, setSetorSel] = useState(null);
  const [subSel, setSubSel] = useState(null);

  // Segurança: Garante que setores seja sempre uma lista para o .map não quebrar
  const listaSetores = setores || [];

  const handleConfirmar = () => {
    if (!setorSel || !subSel) {
      Alert.alert("Atenção", "Selecione o setor e a máquina antes de confirmar.");
      return;
    }

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Salva o estado da atividade atual
    setDadosAtividade({
      inicio: agora.toISOString(),
      setor: setorSel,
      subsetor: subSel
    });

    // Cria o registro histórico
    const novo = {
      id: Math.random().toString(),
      nome: loggedUser?.nome || "Operador",
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: horaFormatada,
      setor: setorSel,
      subsetor: subSel,
      status: 'trabalhando'
    };

    setRegistrosPonto([novo, ...registrosPonto]);
    setStatusPonto('trabalhando');
    
    navigation.navigate('MainFunc');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderApp onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Entrada</Text>
        
        <Text style={styles.label}>1. Selecione o Setor</Text>
        <View style={styles.grid}>
          {listaSetores.map(s => (
            <TouchableOpacity 
              key={s.id} 
              style={[styles.chip, setorSel === s.nome && styles.chipActive]} 
              onPress={() => { 
                setSetorSel(s.nome); 
                setSubSel(null); // Reseta a máquina ao trocar de setor
              }}
            >
              <Text style={[styles.chipText, setorSel === s.nome && styles.textWhite]}>{s.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {setorSel && (
          <>
            <Text style={styles.label}>2. Selecione a Máquina</Text>
            <View style={styles.grid}>
              {/* O segredo aqui: o find procura o objeto e o map percorre os subsetores com segurança */}
              {(listaSetores.find(s => s.nome === setorSel)?.subsetores || []).map(sub => (
                <TouchableOpacity 
                  key={sub.id} 
                  style={[styles.chip, subSel === sub.nome && styles.chipActiveBlue]} 
                  onPress={() => setSubSel(sub.nome)}
                >
                  <Text style={[styles.chipText, subSel === sub.nome && styles.textWhite]}>{sub.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.btnFinal, (!setorSel || !subSel) ? styles.btnDisabled : styles.btnEnabled]} 
          onPress={handleConfirmar}
          disabled={!setorSel || !subSel} // Impede o clique se não estiver selecionado
        >
          <Text style={styles.btnText}>CONFIRMAR ENTRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#4b5563' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipActiveBlue: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontWeight: 'bold' },
  textWhite: { color: '#fff' },
  btnFinal: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnEnabled: { backgroundColor: '#16a34a' },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});