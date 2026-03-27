import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialUsers } from '../data/data';
import { setoresDB } from '../data/setoresDB';

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

  useEffect(() => {
    const load = async () => {
      try {
        // Adicionámos o '@users' à lista de ficheiros a carregar
        const [p, s, c, a, ch, theme, u] = await Promise.all([
          AsyncStorage.getItem('@ponto'),
          AsyncStorage.getItem('@servicos'),
          AsyncStorage.getItem('@compras'),
          AsyncStorage.getItem('@atividade'),
          AsyncStorage.getItem('@chamados'),
          AsyncStorage.getItem('@theme'),
          AsyncStorage.getItem('@users') 
        ]);
        
        if (p) setRegistrosPonto(JSON.parse(p) || []);
        if (s) setServicosIncompletos(JSON.parse(s) || []);
        if (c) setSolicitacoesCompra(JSON.parse(c) || []);
        if (ch) setChamados(JSON.parse(ch) || []);
        if (theme) setIsDarkMode(JSON.parse(theme));
        
        // Se encontrar utilizadores guardados, carrega-os para a lista
        if (u) {
          const parsedUsers = JSON.parse(u);
          if (parsedUsers && parsedUsers.length > 0) {
            setUsersList(parsedUsers);
          }
        }

        if (a) {
          const act = JSON.parse(a);
          if (act) {
            setDadosAtividade(act);
            setStatusPonto(act.inicio ? 'trabalhando' : 'ausente');
          }
        }
      } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
      }
    };
    load();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@ponto', JSON.stringify(registrosPonto));
        await AsyncStorage.setItem('@servicos', JSON.stringify(servicosIncompletos));
        await AsyncStorage.setItem('@compras', JSON.stringify(solicitacoesCompra));
        await AsyncStorage.setItem('@chamados', JSON.stringify(chamados));
        await AsyncStorage.setItem('@atividade', JSON.stringify(dadosAtividade));
        await AsyncStorage.setItem('@theme', JSON.stringify(isDarkMode));
        // Guarda a lista de utilizadores sempre que alguém criar uma conta nova
        await AsyncStorage.setItem('@users', JSON.stringify(usersList)); 
      } catch (e) { console.error("Erro ao salvar:", e); }
    };
    saveData();
  // Adicionámos usersList aqui para que o sistema saiba que deve guardar ao haver alterações nela
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, dadosAtividade, isDarkMode, usersList]);

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