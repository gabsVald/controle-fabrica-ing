import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialUsers } from '../data/data';
import { setoresDB } from '../data/setoresDB';

// IMPORTS DO FIREBASE (Novo!)
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase'; // <--- Confirme se o caminho está certo!

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [usersList, setUsersList] = useState(initialUsers);
  const [loggedUser, setLoggedUser] = useState(null);
  const [setores] = useState(setoresDB || []);

  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [servicosIncompletos, setServicosIncompletos] = useState([]);
  const [solicitacoesCompra, setSolicitacoesCompra] = useState([]);
  const [chamados, setChamados] = useState([]); 

  const [statusPonto, setStatusPonto] = useState('ausente'); 
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '' });

  // 1. CARREGAR DADOS DO FIREBASE EM TEMPO REAL
  useEffect(() => {
    // Referência para o nosso "Cofre" na nuvem
    const docRef = doc(db, "banco_ing", "dados_globais");

    // onSnapshot fica "escutando" o banco 24h por dia. 
    // Se o gestor mudar algo no PC, o celular do funcionário atualiza na mesma hora!
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const dadosNuvem = docSnap.data();
        
        if (dadosNuvem.registrosPonto) setRegistrosPonto(dadosNuvem.registrosPonto);
        if (dadosNuvem.servicosIncompletos) setServicosIncompletos(dadosNuvem.servicosIncompletos);
        if (dadosNuvem.solicitacoesCompra) setSolicitacoesCompra(dadosNuvem.solicitacoesCompra);
        if (dadosNuvem.chamados) setChamados(dadosNuvem.chamados);
        if (dadosNuvem.usersList) setUsersList(dadosNuvem.usersList);
      } else {
        // Se o documento não existir (primeira vez rodando o app), ele vai criar vazio
        console.log("Banco na nuvem vazio. Criando estrutura inicial...");
      }
    });

    // Carrega coisas locais que não precisam ir pra nuvem (ex: Tema Escuro e Estado atual do Ponto do celular)
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

    return () => unsubscribe(); // Para de escutar o banco se fechar o app
  }, []);

  // 2. SALVAR DADOS NO FIREBASE SEMPRE QUE HOUVER MUDANÇA
  useEffect(() => {
    const salvarNaNuvem = async () => {
      // Evita apagar os dados do Firebase na primeira fração de segundo que o app abre vazio
      if (usersList.length === 0) return; 

      try {
        const docRef = doc(db, "banco_ing", "dados_globais");
        
        // setDoc envia todos esses arrays para a nuvem
        await setDoc(docRef, {
          registrosPonto,
          servicosIncompletos,
          solicitacoesCompra,
          chamados,
          usersList
        }, { merge: true }); // merge: true garante que ele só atualize o que mudou

      } catch (e) {
        console.error("Erro ao salvar no Firebase:", e);
      }
    };

    salvarNaNuvem();
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, usersList]);

  // Salva os dados locais (apenas o que é do aparelho da pessoa)
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
      statusPonto, setStatusPonto, dadosAtividade, setDadosAtividade
    }}>
      {children}
    </AppContext.Provider>
  );
};