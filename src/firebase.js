// ─────────────────────────────────────────────────────────────────────────────
// MedBridge · Firebase конфигурация
// ─────────────────────────────────────────────────────────────────────────────
//
// КАК ПОЛУЧИТЬ ЭТИ КЛЮЧИ:
// 1. Зайди на https://console.firebase.google.com
// 2. Создай проект → "Add app" → Web (</>)
// 3. Скопируй firebaseConfig и вставь сюда
// 4. В консоли включи:
//    - Authentication → Email/Password (Sign-in method)
//    - Firestore Database → Create database (production mode)
//    - Storage → Get started
//
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            "AIzaSyBFeoF_rGacmpiRmZh8lT8ctnBohcUn0nA",
  authDomain:        "medcomm-57b2c.firebaseapp.com",
  projectId:         "medcomm-57b2c",
  storageBucket:     "medcomm-57b2c.firebasestorage.app",
  messagingSenderId: "520656745468",
  appId:             "1:520656745468:web:d2bb567fd88e02f87df879",
  measurementId:     "G-EGTGHDYYKZ",
};

const app       = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
