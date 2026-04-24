import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  const [statusPonto, setStatusPonto] = useState('ausente'); 
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '', fotoProvisoria: null });

  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);
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
        
        if (theme) setIsDarkMode(JSON.parse(theme));
        if (userSaved) setLoggedUser(JSON.parse(userSaved)); // ✅ Restaura o login
        
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
        await setDoc(docRef, { registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, usersList }, { merge: true });
      } catch (e) { console.error("Firebase Sync Error:", e); }
    };
    salvarNaNuvem();
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, usersList]);

  return (
    <AppContext.Provider value={{
      isDarkMode, setIsDarkMode, usersList, setUsersList,
      loggedUser, setLoggedUser, setores, registrosPonto, setRegistrosPonto,
      servicosIncompletos, setServicosIncompletos, solicitacoesCompra, setSolicitacoesCompra,
      chamados, setChamados, statusPonto, setStatusPonto, dadosAtividade, setDadosAtividade,
      isFirebaseLoaded,
    }}>
      {children}
    </AppContext.Provider>
  );
};