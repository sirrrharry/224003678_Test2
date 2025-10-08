
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyBpTGLxVNmGuHdDRa7UVUdxfeGm3cASF2Y",
  authDomain: "shopez-18a05.firebaseapp.com",
  projectId: "shopez-18a05",
  storageBucket: "shopez-18a05.firebasestorage.app",
  messagingSenderId: "486690577369",
  appId: "1:486690577369:web:715e66bf63540c528d17c8",
  measurementId: "G-ZTCV3GJ8H1",
  databaseURL: "https://shopez-18a05-default-rtdb.firebaseio.com"
};
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getDatabase(app);