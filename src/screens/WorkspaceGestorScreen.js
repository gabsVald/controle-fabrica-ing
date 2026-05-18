import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Platform, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';
import HeaderApp from '../components/HeaderApp';
import { Folder, FileText, Image as ImageIcon, Plus, ArrowLeft, Trash2, Camera, XCircle, CheckCircle, Edit } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const gerarId = () => Date.now().toString() + Math.random().toString(36).slice(2);

export default function WorkspaceGestorScreen({ navigation }) {
  const { workspaceItems = [], setWorkspaceItems, isDarkMode } = useContext(AppContext);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  // Modals
  const [modalFolderVisible, setModalFolderVisible] = useState(false);
  const [modalTextVisible, setModalTextVisible] = useState(false);
  const [modalViewVisible, setModalViewVisible] = useState(false);

  // Form states
  const [tituloItem, setTituloItem] = useState('');
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [itemVisualizado, setItemVisualizado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Derivando a pasta atual e seu caminho
  const currentFolder = workspaceItems.find(item => item.id === currentFolderId);
  const getParentId = (folderId) => {
    const f = workspaceItems.find(i => i.id === folderId);
    return f ? f.parentId : null;
  };

  const handleBackFolder = () => {
    if (currentFolderId) {
      setCurrentFolderId(getParentId(currentFolderId));
    }
  };

  const currentItems = workspaceItems.filter(item => item.parentId === currentFolderId);

  const criarPasta = () => {
    if (!tituloItem.trim()) return Alert.alert("Erro", "Digite um nome para a pasta");
    const novaPasta = {
      id: gerarId(),
      type: 'folder',
      parentId: currentFolderId,
      title: tituloItem,
      data: new Date().toLocaleDateString('pt-BR')
    };
    setWorkspaceItems([...workspaceItems, novaPasta]);
    setTituloItem('');
    setModalFolderVisible(false);
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setTituloItem(item.title);
    setConteudoTexto(item.content);
    setModalTextVisible(true);
  };

  const criarTexto = () => {
    if (!tituloItem.trim() || !conteudoTexto.trim()) return Alert.alert("Erro", "Preencha o título e o conteúdo");

    if (editingItemId) {
      const updatedItems = workspaceItems.map(item =>
        item.id === editingItemId
          ? { ...item, title: tituloItem, content: conteudoTexto, data: new Date().toLocaleDateString('pt-BR') }
          : item
      );
      setWorkspaceItems(updatedItems);

      if (itemVisualizado && itemVisualizado.id === editingItemId) {
        setItemVisualizado({ ...itemVisualizado, title: tituloItem, content: conteudoTexto });
      }
    } else {
      const novoTexto = {
        id: gerarId(),
        type: 'text',
        parentId: currentFolderId,
        title: tituloItem,
        content: conteudoTexto,
        data: new Date().toLocaleDateString('pt-BR')
      };
      setWorkspaceItems([...workspaceItems, novoTexto]);
    }
    setTituloItem('');
    setConteudoTexto('');
    setEditingItemId(null);
    setModalTextVisible(false);
  };

  const criarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão negada", "Precisamos de acesso à câmera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled) {
      setEnviando(true);
      try {
        let fotoUrl = null;
        if (Platform.OS === 'web') {
          // Usa base64 na web para a imagem não sumir ao recarregar a página (o blob URI expira)
          const b64 = result.assets[0].base64;
          fotoUrl = b64.includes('base64,') ? b64 : `data:image/jpeg;base64,${b64}`;
        } else {
          const idFoto = gerarId();
          const fotoRef = ref(storage, `workspace_fotos/${idFoto}.jpg`);
          const base64Data = result.assets[0].base64.includes('base64,')
            ? result.assets[0].base64.split('base64,')[1]
            : result.assets[0].base64;
          await uploadString(fotoRef, base64Data, 'base64', { contentType: 'image/jpeg' });
          fotoUrl = await getDownloadURL(fotoRef);
        }

        const novaFoto = {
          id: gerarId(),
          type: 'photo',
          parentId: currentFolderId,
          title: "Foto - " + new Date().toLocaleTimeString('pt-BR'),
          fotoUrl,
          data: new Date().toLocaleDateString('pt-BR')
        };
        setWorkspaceItems([...workspaceItems, novaFoto]);
      } catch (e) {
        Alert.alert("Erro", "Falha ao salvar a foto.");
        console.error(e);
      } finally {
        setEnviando(false);
      }
    }
  };

  const excluirItem = (id) => {
    // Apaga o item e todos os filhos se for pasta
    const idsParaApagar = [id];
    const encontrarFilhos = (parentId) => {
      workspaceItems.forEach(item => {
        if (item.parentId === parentId) {
          idsParaApagar.push(item.id);
          encontrarFilhos(item.id);
        }
      });
    };
    encontrarFilhos(id);

    const apagar = () => {
      setWorkspaceItems(prev => prev.filter(item => !idsParaApagar.includes(item.id)));
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Deseja excluir este item e seus conteúdos?")) apagar();
    } else {
      Alert.alert("Excluir", "Deseja excluir este item e todos os seus conteúdos?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: apagar }
      ]);
    }
  };

  const renderItem = ({ item }) => {
    let icon = <Folder size={30} color={isDarkMode ? "#60a5fa" : "#3b82f6"} />;
    if (item.type === 'text') icon = <FileText size={30} color={isDarkMode ? "#34d399" : "#10b981"} />;
    if (item.type === 'photo') icon = <ImageIcon size={30} color={isDarkMode ? "#f472b6" : "#ec4899"} />;

    return (
      <TouchableOpacity
        style={[styles.itemCard, isDarkMode && styles.itemCardDark]}
        onPress={() => {
          if (item.type === 'folder') {
            setCurrentFolderId(item.id);
          } else {
            setItemVisualizado(item);
            setModalViewVisible(true);
          }
        }}
      >
        <View style={styles.itemRow}>
          {icon}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, isDarkMode && styles.textDark]}>{item.title}</Text>
            <Text style={styles.itemDate}>{item.data}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {item.type === 'text' && (
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.trashBtn}>
              <Edit size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => excluirItem(item.id)} style={styles.trashBtn}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.bgDark]}>
      <HeaderApp
        title={currentFolder ? currentFolder.title : "Workspace Gestor"}
        onBack={currentFolderId ? handleBackFolder : null}
      />

      <FlatList
        data={currentItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDarkMode && styles.textDark]}>
            Nenhum item encontrado nesta pasta.
          </Text>
        }
      />

      {/* Ações Inferiores */}
      <View style={[styles.actionRow, isDarkMode && styles.actionRowDark]}>
        {!currentFolderId ? (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setModalFolderVisible(true)}>
              <Folder size={24} color="#fff" />
              <Text style={styles.actionText}>Criar Pasta</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.btnText]} onPress={() => {
              setEditingItemId(null);
              setTituloItem('');
              setConteudoTexto('');
              setModalTextVisible(true);
            }}>
              <FileText size={24} color="#fff" />
              <Text style={styles.actionText}>Novo Texto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.btnPhoto]} onPress={criarFoto} disabled={enviando}>
              {enviando ? <ActivityIndicator color="#fff" /> : <Camera size={24} color="#fff" />}
              <Text style={styles.actionText}>{enviando ? "Enviando..." : "Nova Foto"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal Criar Pasta */}
      <Modal visible={modalFolderVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Nova Pasta</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Nome da pasta"
              placeholderTextColor="#94a3b8"
              value={tituloItem}
              onChangeText={setTituloItem}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => { setModalFolderVisible(false); setTituloItem(''); }}>
                <Text style={styles.btnTextCancel}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={criarPasta}>
                <Text style={styles.btnTextBold}>CRIAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Criar Texto */}
      <Modal visible={modalTextVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
              {editingItemId ? "Editar Anotação" : "Nova Anotação"}
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Título"
              placeholderTextColor="#94a3b8"
              value={tituloItem}
              onChangeText={setTituloItem}
            />
            <TextInput
              style={[styles.inputMulti, isDarkMode && styles.inputDark]}
              placeholder="Conteúdo..."
              placeholderTextColor="#94a3b8"
              value={conteudoTexto}
              onChangeText={setConteudoTexto}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => { setModalTextVisible(false); setTituloItem(''); setConteudoTexto(''); setEditingItemId(null); }}>
                <Text style={styles.btnTextCancel}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={criarTexto}>
                <Text style={styles.btnTextBold}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Visualizar Item (Texto/Foto) */}
      <Modal visible={modalViewVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalViewContent, isDarkMode && styles.modalContentDark]}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
              {itemVisualizado?.type === 'text' && (
                <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {
                  setModalViewVisible(false);
                  openEditModal(itemVisualizado);
                }}>
                  <Edit size={28} color={isDarkMode ? "#60a5fa" : "#3b82f6"} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setModalViewVisible(false)}>
                <XCircle size={28} color={isDarkMode ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.viewTitle, isDarkMode && styles.textDark]}>
              {itemVisualizado?.title}
            </Text>

            {itemVisualizado?.type === 'text' && (
              <FlatList
                data={[1]}
                renderItem={() => <Text style={[styles.viewText, isDarkMode && styles.textDark]}>{itemVisualizado.content}</Text>}
              />
            )}

            {itemVisualizado?.type === 'photo' && (
              <Image source={{ uri: itemVisualizado.fotoUrl }} style={styles.viewImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  bgDark: { backgroundColor: '#121212' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b', fontSize: 16 },
  textDark: { color: '#f8fafc' },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  itemCardDark: { backgroundColor: '#1e1e1e' },
  itemRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemInfo: { marginLeft: 15, flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  itemDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  trashBtn: { padding: 5 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionRowDark: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  actionBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  btnText: { backgroundColor: '#10b981' },
  btnPhoto: { backgroundColor: '#ec4899' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 15,
    padding: 20,
    elevation: 5
  },
  modalContentDark: { backgroundColor: '#1e1e1e' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  inputDark: { backgroundColor: '#2d2d2d', color: '#fff' },
  inputMulti: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top'
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtnCancel: { padding: 10, marginRight: 10, justifyContent: 'center' },
  modalBtnSave: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 8, paddingHorizontal: 20 },
  btnTextBold: { fontWeight: 'bold', color: '#fff' },
  btnTextCancel: { fontWeight: 'bold', color: '#64748b' },

  modalViewContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  btnCloseView: { alignSelf: 'flex-end', marginBottom: 10 },
  viewTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  viewText: { fontSize: 16, color: '#334155', lineHeight: 24 },
  viewImage: { width: '100%', height: 300, borderRadius: 10 }
});
