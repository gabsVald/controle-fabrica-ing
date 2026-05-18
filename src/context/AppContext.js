import React, { createContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native'; // ✅ Adicionado
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications'; // ✅ Adicionado
import * as Device from 'expo-device'; // ✅ Adicionado
import Constants from 'expo-constants'; // ✅ Adicionado
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

  // ✅ 1. CARREGAR DADOS GLOBAIS DO FIREBASE
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
        const userSaved = await AsyncStorage.getItem('@user'); 
        
        if (theme) setIsDarkMode(JSON.parse(theme));
        if (userSaved) setLoggedUser(JSON.parse(userSaved)); 
        
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

  // ✅ 2. REGISTRAR PUSH TOKEN DO DISPOSITIVO
  useEffect(() => {
    if (loggedUser && isFirebaseLoaded && Device.isDevice) {
      const registerPush = async () => {
        try {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }

          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') return; // Bloqueou a notificação

          const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : {});
          const token = tokenData.data;

          // Se o token mudou ou não existe, salva no banco de dados para os outros poderem notificar ele
          if (token && loggedUser.expoPushToken !== token) {
            console.log("Registrando novo Token:", token);
            const updatedUser = { ...loggedUser, expoPushToken: token };
            setLoggedUser(updatedUser);
            setUsersList(prev => prev.map(u => u.usuario === loggedUser.usuario ? updatedUser : u));
          }
        } catch (error) {
          console.error("Erro no Push Notification:", error);
        }
      };
      registerPush();
    }
  }, [loggedUser?.usuario, isFirebaseLoaded]);

  // ✅ 3. FUNÇÃO GLOBAL PARA ENVIAR NOTIFICAÇÕES (API EXPO)
  const enviarNotificacao = async (expoPushToken, titulo, mensagem) => {
    if (!expoPushToken) return;
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: titulo,
        body: mensagem,
        data: { modulo: 'chamados' },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      console.log(`Notificação enviada para: ${expoPushToken}`);
    } catch (error) {
      console.error("Falha ao enviar HTTP Push:", error);
    }
  };

  // ✅ 4. SALVAR DADOS LOCAIS
  useEffect(() => {
    if (isLocalLoadedRef.current) {
      AsyncStorage.setItem('@atividade', JSON.stringify(dadosAtividade));
      AsyncStorage.setItem('@theme', JSON.stringify(isDarkMode));
      if (loggedUser) AsyncStorage.setItem('@user', JSON.stringify(loggedUser));
      else AsyncStorage.removeItem('@user');
    }
  }, [dadosAtividade, isDarkMode, loggedUser]);

  // ✅ 5. SINCRONIZAR COM A NUVEM
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
      isFirebaseLoaded, enviarNotificacao, // ✅ Função exposta
    }}>
      {children}
    </AppContext.Provider>
  );
};