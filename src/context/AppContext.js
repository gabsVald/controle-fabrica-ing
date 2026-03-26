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
  const [chamados, setChamados] = useState([]); // NOVO ESTADO

  const [statusPonto, setStatusPonto] = useState('ausente'); 
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, c, a, ch, theme] = await Promise.all([
          AsyncStorage.getItem('@ponto'),
          AsyncStorage.getItem('@servicos'),
          AsyncStorage.getItem('@compras'),
          AsyncStorage.getItem('@atividade'),
          AsyncStorage.getItem('@chamados'),
          AsyncStorage.getItem('@theme')
        ]);
        
        if (p) setRegistrosPonto(JSON.parse(p) || []);
        if (s) setServicosIncompletos(JSON.parse(s) || []);
        if (c) setSolicitacoesCompra(JSON.parse(c) || []);
        if (ch) setChamados(JSON.parse(ch) || []);
        if (theme) setIsDarkMode(JSON.parse(theme));
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
      } catch (e) { console.error("Erro ao salvar:", e); }
    };
    saveData();
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, chamados, dadosAtividade, isDarkMode]);

  return (
    <AppContext.Provider value={{
      isDarkMode, setIsDarkMode,
      usersList, loggedUser, setLoggedUser, setores,
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