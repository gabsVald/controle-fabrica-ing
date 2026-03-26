import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialUsers } from '../data/data';
import { setoresDB } from '../data/setoresDB';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usersList, setUsersList] = useState(initialUsers);
  const [loggedUser, setLoggedUser] = useState(null);
  const [setores] = useState(setoresDB || []);

  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [servicosIncompletos, setServicosIncompletos] = useState([]); // Pendentes
  const [solicitacoesCompra, setSolicitacoesCompra] = useState([]);
  const [chamados, setChamados] = useState([]);

  const [statusPonto, setStatusPonto] = useState('ausente'); 
  const [dadosAtividade, setDadosAtividade] = useState({ inicio: null, setor: '', subsetor: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s, c, a, ch] = await Promise.all([
          AsyncStorage.getItem('@ponto'), AsyncStorage.getItem('@servicos'),
          AsyncStorage.getItem('@compras'), AsyncStorage.getItem('@atividade'),
          AsyncStorage.getItem('@chamados')
        ]);
        if (p) setRegistrosPonto(JSON.parse(p));
        if (s) setServicosIncompletos(JSON.parse(s));
        if (c) setSolicitacoesCompra(JSON.parse(c));
        if (ch) setChamados(JSON.parse(ch));
        if (a) {
          const act = JSON.parse(a);
          setDadosAtividade(act);
          setStatusPonto(act.inicio ? 'trabalhando' : 'ausente');
        }
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@ponto', JSON.stringify(registrosPonto));
    AsyncStorage.setItem('@servicos', JSON.stringify(servicosIncompletos));
    AsyncStorage.setItem('@compras', JSON.stringify(solicitacoesCompra));
    AsyncStorage.setItem('@atividade', JSON.stringify(dadosAtividade));
    AsyncStorage.setItem('@chamados', JSON.stringify(chamados));
  }, [registrosPonto, servicosIncompletos, solicitacoesCompra, dadosAtividade, chamados]);

  return (
    <AppContext.Provider value={{
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