import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function PontoEntradaScreen({ navigation }) {
  // ADICIONADO: isDarkMode
  const { setores, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, loggedUser, isDarkMode } = useContext(AppContext);
  const [setorSel, setSetorSel] = useState(null);
  const [subSel, setSubSel] = useState(null);

  const listaSetores = setores || [];

  const handleConfirmar = () => {
    if (!setorSel || !subSel) {
      Alert.alert("Atenção", "Selecione o setor e a máquina antes de confirmar.");
      return;
    }

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setDadosAtividade({ inicio: agora.toISOString(), setor: setorSel, subsetor: subSel });

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
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.bgDark]}>
      <HeaderApp onBack={() => navigation.goBack()} title="Entrada" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, isDarkMode && styles.textWhite]}>Registrar Entrada</Text>
        
        {/* TEXTO CENTRALIZADO */}
        <Text style={[styles.label, isDarkMode && styles.textGray]}>1. Selecione o Setor</Text>
        <View style={styles.grid}>
          {listaSetores.map(s => (
            <TouchableOpacity 
              key={s.id} 
              style={[styles.chip, isDarkMode && styles.chipDark, setorSel === s.nome && styles.chipActive]} 
              onPress={() => { setSetorSel(s.nome); setSubSel(null); }}
            >
              <Text style={[styles.chipText, isDarkMode && styles.textWhite, setorSel === s.nome && styles.textWhite]}>{s.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {setorSel && (
          <>
            {/* TEXTO CENTRALIZADO */}
            <Text style={[styles.label, isDarkMode && styles.textGray, {marginTop: 25}]}>2. Selecione a Máquina</Text>
            <View style={styles.grid}>
              {(listaSetores.find(s => s.nome === setorSel)?.subsetores || []).map(sub => (
                <TouchableOpacity 
                  key={sub.id} 
                  style={[styles.chip, isDarkMode && styles.chipDark, subSel === sub.nome && styles.chipActiveBlue]} 
                  onPress={() => setSubSel(sub.nome)}
                >
                  <Text style={[styles.chipText, isDarkMode && styles.textWhite, subSel === sub.nome && styles.textWhite]}>{sub.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.btnFinal, (!setorSel || !subSel) ? styles.btnDisabled : styles.btnEnabled]} 
          onPress={handleConfirmar}
          disabled={!setorSel || !subSel}
        >
          <Text style={styles.btnText}>CONFIRMAR ENTRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' }, // PRETO REAL PARA MODO ESCURO
  
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 20, textAlign: 'center', color: '#1e293b' },
  
  // LABEL CENTRALIZADA
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 15, color: '#4b5563', textAlign: 'center', fontSize: 16 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }, // Centraliza os botões de setor também
  
  chip: { padding: 12, backgroundColor: '#fff', borderRadius: 10, margin: 5, borderWidth: 1, borderColor: '#ddd' },
  chipDark: { backgroundColor: '#1e1e1e', borderColor: '#333' }, // Cinza escuro
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipActiveBlue: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontWeight: 'bold', color: '#1e293b' },
  
  btnFinal: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 40 },
  btnEnabled: { backgroundColor: '#16a34a' },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  textWhite: { color: '#ffffff' },
  textGray: { color: '#a1a1aa' }
});