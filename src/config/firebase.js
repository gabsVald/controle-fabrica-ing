import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ Importação do Storage

const firebaseConfig = {
  apiKey: "AIzaSyAsS4H_Cqd-0qLqWJgMrTQjCNek7SHKh_w",
  authDomain: "controle-fabrica-ing.firebaseapp.com",
  projectId: "controle-fabrica-ing",
  storageBucket: "controle-fabrica-ing.firebasestorage.app",
  messagingSenderId: "651271425709",
  appId: "1:651271425709:web:eefc6a69dde486b0498024"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Exportação do Storage para a app