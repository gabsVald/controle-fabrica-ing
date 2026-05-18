import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { initialUsers } from '../data/data';
import { setoresDB } from '../data/setoresDB';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);
  const [setores] = useState(setoresDB || []);

  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [servicosIncompletos, setServicosIncompletos] = useState([]);
  const [solicitacoesCompra, setSolicitacoesCompra] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [workspaceItems, setWorkspaceItems] = useState([]);

  const [statusPonto, setStatusPonto] = useState('ausente');
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '', fotoProvisoria: null, observacaoServico: '' });

  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);
  const [notifiedTasks, setNotifiedTasks] = useState([]);
  const isPrimeiroLoad = useRef(true);
  const isLocalLoadedRef = useRef(false);

  useEffect(() => {
    const docRef = doc(db, "banco_ing", "dados_globais");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const dadosNuvem = docSnap.data();
        if (dadosNuvem.registrosPonto) setRegistrosPonto(dadosNuvem.registrosPonto);
        if (dadosNuvem.servicosIncompletos) setServicosIncompletos(dadosNuvem.servicosIncompletos);
        if (dadosNuvem.solicitacoesCompra) setSolicitacoesCompra(dadosNuvem.solicitacoesCompra);
        if (dadosNuvem.chamados) setChamados(dadosNuvem.chamados);
        if (dadosNuvem.workspaceItems) setWorkspaceItems(dadosNuvem.workspaceItems);
        setUsersList(dadosNuvem.usersList || initialUsers);
      }
      setIsFirebaseLoaded(true);
      isPrimeiroLoad.current = false;
    });

    const loadLocal = async () => {
      try {
        const theme = await AsyncStorage.getItem('@theme');
        const ativ = await AsyncStorage.getItem('@atividade');
        const userSaved = await AsyncStorage.getItem('@user'); // ✅ Recupera a sessão
        const savedNotified = await AsyncStorage.getItem('@notifiedTasks'); // ✅ Recupera tarefas notificadas

        if (theme) setIsDarkMode(JSON.parse(theme));
        if (userSaved) setLoggedUser(JSON.parse(userSaved)); // ✅ Restaura o login
        if (savedNotified) setNotifiedTasks(JSON.parse(savedNotified));

        if (ativ) {
          const act = JSON.parse(ativ);
          setDadosAtividade(act);
          setStatusPonto(act.inicio ? 'trabalhando' : 'ausente');
        }
      } catch (error) {
        console.error("Erro ao carregar dados locais:", error);
      } finally {
        isLocalLoadedRef.current = true;
      }
    };

    loadLocal();
    return () => unsubscribe();
  }, []);

  // Salva dados locais incluindo o usuário logado
  useEffect(() => {
    if (isLocalLoadedRef.current) {
      AsyncStorage.setItem('@atividade', JSON.stringify(dadosAtividade));
      AsyncStorage.setItem('@theme', JSON.stringify(isDarkMode));

      if (loggedUser) {
        AsyncStorage.setItem('@user', JSON.stringify(loggedUser)); // ✅ Mantém logado
      } else {
        AsyncStorage.removeItem('@user'); // ✅ Garante o deslogue total
      }
    }
  }, [dadosAtividade, isDarkMode, loggedUser]);

  useEffect(() => {
    if (!isFirebaseLoaded || isPrimeiroLoad.current) return;
    const salvarNaNuvem = async () => {
      try {
        const docRef = doc(db, "banco_ing", "dados_globais");
        await setDoc(docRef, { registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, workspaceItems, usersList }, { merge: true });
      } catch (e) { console.error("Firebase Sync Error:", e); }
    };
    salvarNaNuvem();
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, workspaceItems, usersList]);

  // ✅ Verifica tarefas designadas ao usuário logado e exibe notificação
  useEffect(() => {
    if (!loggedUser || loggedUser.perfil === 'gestor' || !chamados.length || !isLocalLoadedRef.current) return;

    let updatedNotified = [...notifiedTasks];
    let hasNew = false;

    chamados.forEach(chamado => {
      if (chamado.atribuidoA === loggedUser.nome && !updatedNotified.includes(chamado.id)) {
        if (Platform.OS === 'web') {
          window.alert(`Nova Tarefa! ${chamado.setor} - ${chamado.descricao}`);
        } else {
          Alert.alert("Nova Tarefa!", `${chamado.setor} - ${chamado.descricao}`);
        }
        updatedNotified.push(chamado.id);
        hasNew = true;
      }
    });

    if (hasNew) {
      setNotifiedTasks(updatedNotified);
      AsyncStorage.setItem('@notifiedTasks', JSON.stringify(updatedNotified));
    }
  }, [chamados, loggedUser]);

  return (
    <AppContext.Provider value={{
      isDarkMode, setIsDarkMode, usersList, setUsersList,
      loggedUser, setLoggedUser, setores, registrosPonto, setRegistrosPonto,
      servicosIncompletos, setServicosIncompletos, solicitacoesCompra, setSolicitacoesCompra,
      chamados, setChamados, workspaceItems, setWorkspaceItems, statusPonto, setStatusPonto, dadosAtividade, setDadosAtividade,
      isFirebaseLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
};