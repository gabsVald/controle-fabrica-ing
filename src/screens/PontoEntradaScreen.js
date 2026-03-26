import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';

export default function PontoEntradaScreen({ navigation }) {
  const { setores, setRegistrosPonto, registrosPonto, setStatusPonto, setDadosAtividade, loggedUser } = useContext(AppContext);
  const [setorSel, setSetorSel] = useState(null);
  const [subSel, setSubSel] = useState(null);

  const handleConfirmar = () => {
    if (!setorSel || !subSel) return Alert.alert("Aviso", "Selecione o setor e a máquina.");
    const agora = new Date();
    
    setDadosAtividade({ inicio: agora.toISOString(), setor: setorSel, subsetor: subSel });
    setRegistrosPonto([{
      id: Math.random().toString(),
      nome: loggedUser.nome,
      data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
      setor: setorSel, subsetor: subSel, status: 'trabalhando'
    }, ...registrosPonto]);

    setStatusPonto('trabalhando');
    navigation.navigate('MainFunc');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderApp onBack={() => navigation.goBack()} />
      <ScrollView padding={20}>
        <Text style={styles.title}>Registrar Entrada</Text>
        <Text style={styles.label}>Setor:</Text>
        <View style={styles.grid}>
          {setores.map(s => (
            <TouchableOpacity key={s.id} style={[styles.chip, setorSel === s.nome && styles.active]} onPress={() => {setSetorSel(s.nome); setSubSel(null);}}>
              <Text style={setorSel === s.nome && {color:'#fff'}}>{s.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {setorSel && (
          <>
            <Text style={styles.label}>Subsetor:</Text>
            <View style={styles.grid}>
              {setores.find(s => s.nome === setorSel).subsetores.map(sub => (
                <TouchableOpacity key={sub} style={[styles.chip, subSel === sub && styles.activeBlue]} onPress={() => setSubSel(sub)}>
                  <Text style={subSel === sub && {color:'#fff'}}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={[styles.btn, (!setorSel || !subSel) ? styles.disabled : styles.enabled]} onPress={handleConfirmar}>
          <Text style={styles.btnText}>CONFIRMAR ENTRADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontWeight: 'bold', marginVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  active: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  activeBlue: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  btn: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  enabled: { backgroundColor: '#16a34a' },
  disabled: { backgroundColor: '#cbd5e1' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});