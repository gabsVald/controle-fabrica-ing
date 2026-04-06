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
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '' });

  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false); // ✅ exposto no contexto para tela de loading
  const isPrimeiroLoad = useRef(true);

  // 1. CARREGAR DADOS DO FIREBASE
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
      } else {
        setUsersList(initialUsers);
        console.log("Banco na nuvem vazio. Usando usuários padrão.");
      }
      
      setIsFirebaseLoaded(true);
      isPrimeiroLoad.current = false;
    });

    const loadLocal = async () => {
      const theme = await AsyncStorage.getItem('@theme');
      const ativ = await AsyncStorage.getItem('@atividade');
      if (theme) setIsDarkMode(JSON.parse(theme));
      if (ativ) {
        const act = JSON.parse(ativ);
        setDadosAtividade(act);
        setStatusPonto(act.inicio ? 'trabalhando' : 'ausente');
      }
    };
    loadLocal();

    return () => unsubscribe();
  }, []);

  // 2. SALVAR DADOS NO FIREBASE
  useEffect(() => {
    const salvarNaNuvem = async () => {
      if (!isFirebaseLoaded) return;
      if (isPrimeiroLoad.current) return;

      try {
        const docRef = doc(db, "banco_ing", "dados_globais");
        await setDoc(docRef, {
          registrosPonto,
          servicosIncompletos,
          solicitacoesCompra,
          chamados,
          usersList
        }, { merge: true });
      } catch (e) {
        console.error("Erro ao salvar no Firebase:", e);
      }
    };

    salvarNaNuvem();
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, usersList, isFirebaseLoaded]);

  // 3. SALVAR DADOS LOCAIS
  useEffect(() => {
    AsyncStorage.setItem('@atividade', JSON.stringify(dadosAtividade));
    AsyncStorage.setItem('@theme', JSON.stringify(isDarkMode));
  }, [dadosAtividade, isDarkMode]);

  return (
    <AppContext.Provider value={{
      isDarkMode, setIsDarkMode,
      usersList, setUsersList,
      loggedUser, setLoggedUser, setores,
      registrosPonto, setRegistrosPonto,
      servicosIncompletos, setServicosIncompletos,
      solicitacoesCompra, setSolicitacoesCompra,
      chamados, setChamados,
      statusPonto, setStatusPonto, dadosAtividade, setDadosAtividade,
      isFirebaseLoaded, // ✅ exposto para uso na tela de loading
    }}>
      {children}
    </AppContext.Provider>
  );
};