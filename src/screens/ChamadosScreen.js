import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { PlusCircle, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker'; // ✅ NOVO IMPORT PARA O DROPDOWN

const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function ChamadosScreen({ navigation }) {
  const { chamados, setChamados, loggedUser, isDarkMode, statusPonto, setDadosAtividade, setRegistrosPonto, registrosPonto, setStatusPonto, usersList } = useContext(AppContext);
  
  const [novoChamado, setNovoChamado] = useState(false);
  const [setor, setSetor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [atribuidoA, setAtribuidoA] = useState('Todos'); // ✅ Estado do select de atribuição

  const criarChamado = () => {
    if (!setor || !descricao) return Alert.alert("Erro", "Preencha setor e descrição.");
    
    const chamado = { 
        id: gerarId(), 
        setor, 
        subsetor: 'Programado', 
        descricao, 
        criadoPor: loggedUser.nome, 
        status: 'Aberto',
        atribuidoA: atribuidoA === 'Todos' ? null : atribuidoA // ✅ Salva para quem foi direcionado
    };
    
    setChamados([chamado, ...chamados]);
    setSetor(''); setDescricao(''); setAtribuidoA('Todos'); setNovoChamado(false);
    if (Platform.OS !== 'web') Alert.alert("Sucesso", "Chamado programado criado!");
  };

  const excluirChamado = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Deseja realmente apagar este chamado?")) {
        setChamados(prev => prev.filter(c => c.id !== id));
      }
    } else {
      Alert.alert("Excluir", "Deseja realmente apagar este chamado?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => setChamados(prev => prev.filter(c => c.id !== id)) }
      ]);
    }
  };

  // ✅ Função para o Gestor trocar o dono do chamado sem precisar recriar
  const atualizarAtribuicao = (id, novoUsuario) => {
    setChamados(prev => prev.map(c => 
      c.id === id ? { ...c, atribuidoA: novoUsuario === 'Todos' ? null : novoUsuario } : c
    ));
  };

  const comecarChamado = (item) => {
    if (statusPonto === 'trabalhando') return Alert.alert("Erro", "Finalize a tarefa atual.");
    const agora = new Date();
    setDadosAtividade({ inicio: agora.toISOString(), setor: item.setor, subsetor: item.subsetor });
    setRegistrosPonto([{
      id: gerarId(), nome: loggedUser.nome, data: agora.toLocaleDateString('pt-BR'),
      horaEntrada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      setor: item.setor, subsetor: item.subsetor, status: 'trabalhando'
    }, ...registrosPonto]);
    setStatusPonto('trabalhando');
    setChamados(chamados.filter(c => c.id !== item.id));
    navigation.navigate('Início');
  };

  // ✅ Filtro Mestre: Define quem enxerga qual chamado
  const chamadosVisiveis = chamados.filter(c => {
    if (loggedUser?.perfil === 'gestor') return true; // Gestor vê e organiza tudo
    if (!c.atribuidoA) return true; // Se não tiver dono (livre), o funcionário vê
    return c.atribuidoA === loggedUser?.nome; // Se tiver dono, só enxerga se for ele
  });

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp title="Chamados" />
      <View style={{ padding: 20, flex: 1 }}>
        {novoChamado ? (
          <View style={[styles.form, isDarkMode && styles.formDark]}>
            <Text style={[styles.label, isDarkMode && styles.textDark]}>Setor / Máquina</Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={setor} onChangeText={setSetor} />
            
            <Text style={[styles.label, isDarkMode && styles.textDark]}>Descrição do Serviço</Text>
            <TextInput style={[styles.input, isDarkMode && styles.inputDark]} value={descricao} onChangeText={setDescricao} multiline />
            
            {/* ✅ Caixa de Atribuição no Cadastro */}
            {loggedUser?.perfil === 'gestor' && (
              <>
                <Text style={[styles.label, isDarkMode && styles.textDark]}>Direcionar para (Opcional):</Text>
                <View style={[styles.pickerContainer, isDarkMode && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={atribuidoA}
                    onValueChange={(itemValue) => setAtribuidoA(itemValue)}
                    style={{ color: isDarkMode ? '#fff' : '#1e293b' }}
                  >
                    <Picker.Item label="Todos (Qualquer um pode pegar)" value="Todos" />
                    {/* Lista dinâmica com os funcionários do sistema */}
                    {usersList.filter(u => u.perfil === 'funcionario').map(u => (
                      <Picker.Item key={u.id} label={u.nome} value={u.nome} />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setNovoChamado(false)}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={criarChamado}><Text style={styles.btnText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.btnCreate} onPress={() => setNovoChamado(true)}>
              <PlusCircle size={24} color="#fff" />
              <Text style={styles.btnText}>NOVO CHAMADO</Text>
            </TouchableOpacity>
            
            <FlatList
              data={chamadosVisiveis} // Usa a lista filtrada segura
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.empty}>Nenhum chamado programado no momento.</Text>}
              renderItem={({ item }) => (
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tag}>{item.setor}</Text>
                      <Text style={[styles.desc, isDarkMode && styles.textDark]}>{item.descricao}</Text>
                    </View>
                    {loggedUser?.perfil === 'gestor' && (
                      <TouchableOpacity onPress={() => excluirChamado(item.id)} style={{ padding: 5 }}>
                        <Trash2 size={22} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* ✅ Edição de dono do chamado (Apenas Gestor) */}
                  {loggedUser?.perfil === 'gestor' && (
                    <View style={styles.editAtribuicao}>
                      <Text style={styles.editLabel}>Atribuído a:</Text>
                      <View style={[styles.pickerInlineContainer, isDarkMode && styles.pickerContainerDark]}>
                        <Picker
                          selectedValue={item.atribuidoA || 'Todos'}
                          onValueChange={(val) => atualizarAtribuicao(item.id, val)}
                          style={{ height: 40, color: isDarkMode ? '#fff' : '#1e293b' }}
                        >
                          <Picker.Item label="Todos (Livre)" value="Todos" />
                          {usersList.filter(u => u.perfil === 'funcionario').map(u => (
                            <Picker.Item key={u.id} label={u.nome} value={u.nome} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  )}

                  {/* ✅ Aviso para o Funcionário saber que o chamado é obrigatório para ele */}
                  {loggedUser?.perfil !== 'gestor' && item.atribuidoA === loggedUser?.nome && (
                    <Text style={styles.badgeDirecionado}>⚠️ Direcionado para você</Text>
                  )}

                  {loggedUser?.perfil !== 'gestor' && (
                    <TouchableOpacity style={styles.btnStart} onPress={() => comecarChamado(item)}>
                      <Text style={styles.btnText}>COMEÇAR SERVIÇO</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  btnCreate: { backgroundColor: '#2563eb', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '80%', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  formDark: { backgroundColor: '#1e1e1e' },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#1e293b' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, color: '#1e293b' },
  inputDark: { borderColor: '#333', color: '#fff', backgroundColor: '#121212' },
  textDark: { color: '#fff' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 15, backgroundColor: '#f8fafc' },
  pickerContainerDark: { borderColor: '#333', backgroundColor: '#121212' },
  btnSave: { backgroundColor: '#16a34a', padding: 12, borderRadius: 10, marginLeft: 10, width: 120, alignItems: 'center' },
  btnCancel: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, width: 120, alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardDark: { backgroundColor: '#1e1e1e' },
  tag: { color: '#2563eb', fontWeight: 'bold', fontSize: 12 },
  desc: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#1e293b' },
  editAtribuicao: { marginTop: 5, marginBottom: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  editLabel: { fontSize: 12, color: '#64748b', marginBottom: 5, fontWeight: 'bold' },
  pickerInlineContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc', overflow: 'hidden' },
  badgeDirecionado: { color: '#ea580c', fontWeight: 'bold', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  btnStart: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, alignItems: 'center', alignSelf: 'center', width: '70%' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 30 }
});