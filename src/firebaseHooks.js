// ─────────────────────────────────────────────────────────────────────────────
// MedBridge · Firebase хуки
// Все операции с базой данных собраны здесь
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
  addDoc, onSnapshot, serverTimestamp,
  arrayUnion, arrayRemove,
} from "firebase/firestore";
import {
  ref, uploadString, getDownloadURL,
} from "firebase/storage";
import { auth, db, storage } from "./firebase";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase User object
  const [profile, setProfile]         = useState(null);   // Firestore profile doc
  const [loading, setLoading]         = useState(true);

  // Слушаем состояние авторизации
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setProfile({ id: user.uid, ...snap.data() });
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Освежить профиль из базы (после изменений)
  const refreshProfile = async () => {
    if (!currentUser) return;
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    if (snap.exists()) setProfile({ id: currentUser.uid, ...snap.data() });
  };

  // Логин
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null; // нет ошибки
    } catch (e) {
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential")
        return "Неверный email или пароль";
      if (e.code === "auth/too-many-requests")
        return "Слишком много попыток. Попробуйте позже.";
      return "Ошибка входа: " + e.message;
    }
  };

  // Регистрация
  const register = async (data) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Загрузить фото если есть
      let photoURL = null;
      if (data.photo) {
        const photoRef = ref(storage, `avatars/${user.uid}`);
        await uploadString(photoRef, data.photo, "data_url");
        photoURL = await getDownloadURL(photoRef);
      }

      // Создать профиль в Firestore
      const profileData = {
        email: data.email,
        name: data.name,
        role: data.role,
        photoURL,
        createdAt: serverTimestamp(),
        ...(data.role === "patient" ? {
          card: {
            birthDate: data.birthDate || "",
            bloodType: data.bloodType || "",
            allergies: data.allergies || "",
            chronic: data.chronic || "",
            accessGranted: [],
          }
        } : {
          doctorProfile: {
            specialty: data.specialty || "",
            experience: parseInt(data.experience) || 0,
            city: data.city ? data.city.split(",").map(s => s.trim()) : [],
            services: data.services || [],
            payment: data.payment ? [data.payment] : [],
            resume: data.resume || "",
            education: data.education || "",
            verified: false,
            verifiedAt: null,
            rating: null,
            reviewCount: 0,
          }
        })
      };

      await setDoc(doc(db, "users", user.uid), profileData);
      return null;
    } catch (e) {
      if (e.code === "auth/email-already-in-use") return "Этот email уже зарегистрирован";
      if (e.code === "auth/weak-password") return "Пароль слишком короткий (мин. 6 символов)";
      return "Ошибка регистрации: " + e.message;
    }
  };

  const logout = () => signOut(auth);

  return { currentUser, profile, loading, login, register, logout, refreshProfile };
}

// ─── ПОЛЬЗОВАТЕЛИ ─────────────────────────────────────────────────────────────

// Загрузить всех верифицированных врачей
export async function loadVerifiedDoctors() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "doctor"),
    where("doctorProfile.verified", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Поиск врача по имени для экрана "Доступ"
export async function searchDoctors(nameQuery) {
  const q = query(collection(db, "users"), where("role", "==", "doctor"), where("doctorProfile.verified", "==", true));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!nameQuery) return all;
  const lower = nameQuery.toLowerCase();
  return all.filter(d =>
    d.name.toLowerCase().includes(lower) ||
    d.doctorProfile?.specialty?.toLowerCase().includes(lower)
  );
}

// Обновить профиль пользователя
export async function updateUserProfile(uid, changes) {
  await updateDoc(doc(db, "users", uid), changes);
}

// Выдать / отозвать доступ к карте
export async function toggleCardAccess(patientUid, doctorUid, grant) {
  await updateDoc(doc(db, "users", patientUid), {
    "card.accessGranted": grant ? arrayUnion(doctorUid) : arrayRemove(doctorUid)
  });
}

// ─── ФАЙЛЫ ПАЦИЕНТА ───────────────────────────────────────────────────────────

// Добавить файл (base64 → Storage → Firestore)
export async function uploadPatientFile(uid, fileData) {
  const { name, comment, date, fileBase64, fileName } = fileData;

  let fileURL = null;
  let fileType = "file";

  if (fileBase64) {
    const isImage = fileBase64.startsWith("data:image");
    fileType = isImage ? "image" : "file";
    const fileRef = ref(storage, `patient-files/${uid}/${Date.now()}_${fileName || "file"}`);
    await uploadString(fileRef, fileBase64, "data_url");
    fileURL = await getDownloadURL(fileRef);
  }

  const fileDoc = {
    name, comment, date, fileType, fileURL,
    fileName: fileName || "",
    createdAt: serverTimestamp(),
    patientId: uid,
  };

  const docRef = await addDoc(collection(db, "patientFiles"), fileDoc);
  return { id: docRef.id, ...fileDoc };
}

// Загрузить файлы пациента
export async function loadPatientFiles(uid) {
  const q = query(collection(db, "patientFiles"), where("patientId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

// ─── ЗАПИСИ НА ПРИЁМ ──────────────────────────────────────────────────────────

// Создать запрос
export async function createAppointment(data) {
  const docRef = await addDoc(collection(db, "appointments"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

// Обновить статус записи
export async function updateAppointment(id, changes) {
  await updateDoc(doc(db, "appointments", id), changes);
}

// Реалтайм-подписка на записи пациента
export function subscribePatientAppointments(patientId, callback) {
  const q = query(collection(db, "appointments"), where("patientId", "==", patientId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// Реалтайм-подписка на записи врача
export function subscribeDoctorAppointments(doctorId, callback) {
  const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
