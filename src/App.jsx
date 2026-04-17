// MedBridge · App.jsx
// Firebase-интеграция: Auth + Firestore + Storage
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  useAuth,
  loadVerifiedDoctors,
  searchDoctors,
  uploadPatientFile,
  loadPatientFiles,
  toggleCardAccess,
  createAppointment,
  updateAppointment,
  subscribePatientAppointments,
  subscribeDoctorAppointments,
  updateUserProfile,
} from "./firebaseHooks";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#F4F7F6", card: "#FFFFFF",
  primary: "#2A7A6F", primaryLight: "#E6F3F1", primaryDark: "#1D5C54",
  accent: "#4ECDC4", text: "#1A2A28", muted: "#6B8A86",
  border: "#E2EEEC", success: "#27AE60", warning: "#F39C12", danger: "#E74C3C",
};
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`;
const serif = (size, color = C.text) => ({ fontFamily: "'Instrument Serif', serif", fontSize: size, color });
const sans  = (size, weight = 400, color = C.text) => ({ fontFamily: "'DM Sans', sans-serif", fontSize: size, fontWeight: weight, color });

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 10px rgba(42,122,111,0.06)", border: `1px solid ${C.border}`, cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}
function Btn({ children, onClick, variant = "primary", style, disabled, small }) {
  const vs = {
    primary: { background: C.primary, color: "#fff", border: "none" },
    outline:  { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` },
    ghost:    { background: C.primaryLight, color: C.primary, border: "none" },
    danger:   { background: C.danger, color: "#fff", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...vs[variant], padding: small ? "8px 16px" : "12px 22px", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: small ? 13 : 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}>
      {children}
    </button>
  );
}
function Input({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ ...sans(13, 600), marginBottom: 5 }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, ...sans(14), outline: "none", background: "#fff", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}
function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ ...sans(13, 600), marginBottom: 5 }}>{label}</div>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, ...sans(14), outline: "none", background: "#fff", boxSizing: "border-box", resize: "none" }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}
function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ ...sans(13, 600), marginBottom: 5 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, ...sans(14), outline: "none", background: "#fff", appearance: "none" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}
function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "13px 18px 11px", background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 20 }}>
      {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 10px 4px 0", fontSize: 20, color: C.primary }}>←</button>}
      <span style={{ flex: 1, ...serif(19) }}>{title}</span>
      {right}
    </div>
  );
}
function Badge({ color = "teal", children }) {
  const map = { teal: [C.primaryLight, C.primary], green: ["#E8F5E9","#2E7D32"], orange: ["#FFF3E0","#E65100"], red: ["#FFEBEE","#C62828"], gray: ["#F5F5F5","#616161"] };
  const [bg, text] = map[color] || map.teal;
  return <span style={{ background: bg, color: text, padding: "3px 10px", borderRadius: 20, ...sans(11, 600) }}>{children}</span>;
}
function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.primary, animation: "spin 0.8s linear infinite" }} /></div>;
}
function PhotoPicker({ value, onChange, size = 80 }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
      <div onClick={() => ref.current.click()} style={{ width: size, height: size, borderRadius: size * 0.28, background: C.primaryLight, border: `2px dashed ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
        {value ? <img src={value} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: size * 0.4 }}>📷</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div>
        <div style={{ ...sans(13, 600), marginBottom: 3 }}>Фото профиля</div>
        <div style={{ ...sans(12, 400, C.muted) }}>Нажмите для загрузки</div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(""); setLoading(true);
    const err = await onLogin(email, password);
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(145deg, ${C.primaryDark} 0%, ${C.primary} 55%, #3aada3 100%)`, padding: "40px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🌉</div>
          <div>
            <div style={{ ...sans(22, 700, "#fff"), letterSpacing: -0.5 }}>MedBridge</div>
            <div style={{ ...sans(12, 400, "rgba(255,255,255,0.65)") }}>Мост между пациентом и врачом</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🪪</div>
            <div style={{ ...sans(13, 700, "#fff") }}>MedBridge</div>
            <div style={{ ...sans(10, 400, "rgba(255,255,255,0.7)") }}>Моя карта</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>⚕️</div>
            <div style={{ ...sans(13, 700, "#fff") }}>MedBridge <span style={{ ...sans(11, 400, "rgba(255,255,255,0.75)") }}>Pro</span></div>
            <div style={{ ...sans(10, 400, "rgba(255,255,255,0.7)") }}>Кабинет врача</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "24px 20px" }}>
        <div style={{ ...serif(22), marginBottom: 20 }}>Вход в аккаунт</div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" required />
        <Input label="Пароль" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
        {error && <div style={{ ...sans(13, 500, C.danger), marginBottom: 14, background: "#FFEBEE", padding: "10px 14px", borderRadius: 10 }}>⚠️ {error}</div>}
        <Btn onClick={handleLogin} disabled={loading || !email || !password} style={{ width: "100%", marginBottom: 14 }}>
          {loading ? "Вход..." : "Войти →"}
        </Btn>
        <div style={{ textAlign: "center" }}>
          <span style={{ ...sans(13, 400, C.muted) }}>Нет аккаунта? </span>
          <button onClick={goRegister} style={{ background: "none", border: "none", ...sans(13, 600, C.primary), cursor: "pointer" }}>Зарегистрироваться</button>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterScreen({ onRegister, goLogin }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [services, setServices] = useState([{ name: "", type: "online", price: "" }]);
  const [payment, setPayment] = useState("");
  const [resume, setResume] = useState("");
  const [education, setEducation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateService = (i, field, val) => setServices(s => s.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    const data = {
      email, password, role, name, photo,
      ...(role === "patient" ? { birthDate, bloodType } : {
        specialty, experience, city: cityInput,
        services: services.filter(s => s.name).map(s => ({ ...s, price: parseInt(s.price) || 0, currency: "RUB" })),
        payment, resume, education,
      })
    };
    const err = await onRegister(data);
    setLoading(false);
    if (err) { setError(err); return; }
    if (role === "doctor") setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
        <div style={{ ...sans(12, 700, C.primary), letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>MedBridge Pro</div>
        <div style={{ ...serif(24), marginBottom: 10 }}>Заявка отправлена!</div>
        <div style={{ ...sans(14, 400, C.muted), lineHeight: 1.6, maxWidth: 280, marginBottom: 24 }}>Ваш профиль врача проверяется администратором. Публикация займёт 1–3 рабочих дня.</div>
        <Btn onClick={goLogin} variant="ghost">← Войти</Btn>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", padding: "24px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={step === 1 ? goLogin : () => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.primary }}>←</button>
        <div style={{ ...serif(22) }}>Регистрация</div>
        <div style={{ ...sans(12, 400, C.muted), marginLeft: "auto" }}>{step}/2</div>
      </div>

      {step === 1 && (
        <div>
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Пароль (мин. 6 символов)" type="password" value={password} onChange={setPassword} required />
          <Input label="Полное имя" value={name} onChange={setName} placeholder="Иванов Иван Иванович" required />
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...sans(13, 600), marginBottom: 8 }}>Я регистрируюсь как <span style={{ color: C.danger }}>*</span></div>
            <div style={{ display: "flex", gap: 12 }}>
              {["patient","doctor"].map(r => (
                <div key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "16px 12px", borderRadius: 14, cursor: "pointer", textAlign: "center", border: `2px solid ${role === r ? C.primary : C.border}`, background: role === r ? C.primaryLight : "#fff" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{r === "patient" ? "🧑" : "👨‍⚕️"}</div>
                  <div style={{ ...sans(14, 600, role === r ? C.primary : C.text) }}>{r === "patient" ? "Пациент" : "Врач"}</div>
                  <div style={{ ...sans(10, 400, C.muted), marginTop: 2 }}>{r === "patient" ? "MedBridge" : "MedBridge Pro"}</div>
                </div>
              ))}
            </div>
          </div>
          {error && <div style={{ ...sans(13, 500, C.danger), padding: "10px 14px", background: "#FFEBEE", borderRadius: 10, marginBottom: 12 }}>⚠️ {error}</div>}
          <Btn onClick={() => { if (!email || !password || !name || !role) { setError("Заполните все поля"); return; } setError(""); setStep(2); }} style={{ width: "100%" }}>Далее →</Btn>
        </div>
      )}

      {step === 2 && role === "patient" && (
        <div>
          <PhotoPicker value={photo} onChange={setPhoto} />
          <Input label="Дата рождения" type="date" value={birthDate} onChange={setBirthDate} />
          <Select label="Группа крови" value={bloodType} onChange={setBloodType} placeholder="Выберите группу крови"
            options={["O(I) Rh+","O(I) Rh−","A(II) Rh+","A(II) Rh−","B(III) Rh+","B(III) Rh−","AB(IV) Rh+","AB(IV) Rh−"]} />
          {error && <div style={{ ...sans(13, 500, C.danger), padding: "10px 14px", background: "#FFEBEE", borderRadius: 10, marginBottom: 12 }}>⚠️ {error}</div>}
          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>{loading ? "Создаём аккаунт..." : "Создать аккаунт"}</Btn>
        </div>
      )}

      {step === 2 && role === "doctor" && (
        <div>
          <PhotoPicker value={photo} onChange={setPhoto} size={90} />
          <Input label="Специализация" value={specialty} onChange={setSpecialty} placeholder="Терапевт, кардиолог..." required />
          <Input label="Стаж (лет)" type="number" value={experience} onChange={setExperience} placeholder="10" />
          <Input label="Город(а) офлайн приёма" value={cityInput} onChange={setCityInput} placeholder="Москва, Санкт-Петербург" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...sans(13, 600), marginBottom: 8 }}>Услуги</div>
            {services.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 8 }}>
                <input value={s.name} onChange={e => updateService(i, "name", e.target.value)} placeholder="Название"
                  style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, ...sans(13), outline: "none" }} />
                <select value={s.type} onChange={e => updateService(i, "type", e.target.value)}
                  style={{ padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${C.border}`, ...sans(12), background: "#fff" }}>
                  <option value="online">Онлайн</option>
                  <option value="offline">Офлайн</option>
                </select>
                <input value={s.price} onChange={e => updateService(i, "price", e.target.value)} placeholder="₽"
                  style={{ width: 64, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${C.border}`, ...sans(13), outline: "none", textAlign: "center" }} />
              </div>
            ))}
            <button onClick={() => setServices(s => [...s, { name: "", type: "online", price: "" }])} style={{ background: "none", border: "none", ...sans(13, 600, C.primary), cursor: "pointer" }}>+ Услуга</button>
          </div>
          <Input label="Способ оплаты" value={payment} onChange={setPayment} placeholder="Перевод на карту / ссылка..." />
          <Input label="Образование" value={education} onChange={setEducation} placeholder="ВУЗ, год окончания" />
          <Textarea label="Резюме / Опыт работы" value={resume} onChange={setResume} placeholder="Опишите опыт..." rows={4} />
          <div style={{ background: "#FFF3E0", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <div style={{ ...sans(12, 400, "#7B4A00"), lineHeight: 1.5 }}><b>Верификация:</b> Профиль будет проверен администратором перед публикацией (1–3 дня).</div>
          </div>
          {error && <div style={{ ...sans(13, 500, C.danger), padding: "10px 14px", background: "#FFEBEE", borderRadius: 10, marginBottom: 12 }}>⚠️ {error}</div>}
          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>{loading ? "Отправляем..." : "Отправить на верификацию"}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── PATIENT APP ──────────────────────────────────────────────────────────────
function PatientApp({ profile, currentUser, logout }) {
  const [tab, setTab]           = useState("home");
  const [subScreen, setSubScreen] = useState(null);
  const [doctors, setDoctors]   = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles]       = useState([]);

  // Загрузить врачей и файлы при монтировании
  useEffect(() => {
    loadVerifiedDoctors().then(setDoctors);
    loadPatientFiles(currentUser.uid).then(setFiles);
    // Подписка на записи в реальном времени
    const unsub = subscribePatientAppointments(currentUser.uid, setAppointments);
    return unsub;
  }, [currentUser.uid]);

  const handleAddFile = async (fileData) => {
    const saved = await uploadPatientFile(currentUser.uid, fileData);
    setFiles(f => [saved, ...f]);
  };

  const handleGrantAccess = async (doctorId) => {
    const granted = profile.card?.accessGranted || [];
    const give = !granted.includes(doctorId);
    await toggleCardAccess(currentUser.uid, doctorId, give);
    // Обновляем локально сразу (оптимистично)
    // Реальные данные подтянутся при следующем refreshProfile
  };

  const handleCreateAppointment = async (data) => {
    await createAppointment({ ...data, patientId: currentUser.uid });
  };

  const TABS = [
    { id: "home",  icon: "🏠", label: "Главная" },
    { id: "files", icon: "📁", label: "Файлы" },
    { id: "access",icon: "🔑", label: "Доступ" },
    { id: "book",  icon: "📅", label: "Запись" },
  ];

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {subScreen?.screen === "bookDoctor" && (
        <BookScreen doctor={subScreen.doctor} profile={profile} onBack={() => setSubScreen(null)} onCreate={handleCreateAppointment} />
      )}
      {!subScreen && <>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "home"   && <PatientHome profile={profile} appointments={appointments} doctors={doctors} onBook={d => setSubScreen({ screen: "bookDoctor", doctor: d })} onLogout={logout} />}
          {tab === "files"  && <PatientFiles files={files} onAddFile={handleAddFile} />}
          {tab === "access" && <PatientAccess profile={profile} onGrantAccess={handleGrantAccess} />}
          {tab === "book"   && <PatientBook doctors={doctors} onBook={d => setSubScreen({ screen: "bookDoctor", doctor: d })} />}
        </div>
        <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", padding: "6px 0 10px", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ ...sans(10, tab === t.id ? 700 : 400, tab === t.id ? C.primary : C.muted) }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

function PatientHome({ profile, appointments, doctors, onBook, onLogout }) {
  const upcoming = appointments.find(a => a.status === "confirmed");
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, padding: "24px 20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ ...sans(11, 600, "rgba(255,255,255,0.6)"), letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>MedBridge · Моя карта</div>
            <div style={{ ...serif(22, "#fff") }}>{profile.name}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {profile.photoURL
              ? <img src={profile.photoURL} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} />
              : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑</div>
            }
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", ...sans(11, 500, "#fff"), cursor: "pointer" }}>Выйти</button>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {upcoming && (
          <Card style={{ background: C.primaryLight, border: `1.5px solid ${C.primary}22` }}>
            <div style={{ ...sans(11, 600, C.muted), letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Ближайший приём</div>
            <div style={{ ...sans(15, 600), marginBottom: 2 }}>{doctors.find(d => d.id === upcoming.doctorId)?.name}</div>
            <div style={{ ...sans(13, 500, C.primary) }}>🗓 {upcoming.chosenSlot}</div>
          </Card>
        )}
        <div style={{ ...sans(14, 600), marginBottom: 4 }}>Специалисты</div>
        {doctors.slice(0, 3).map(d => <DoctorCard key={d.id} doctor={d} onBook={() => onBook(d)} />)}
      </div>
    </div>
  );
}

function DoctorCard({ doctor: d, onBook }) {
  const dp = d.doctorProfile;
  return (
    <Card>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {d.photoURL
          ? <img src={d.photoURL} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👨‍⚕️</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...sans(14, 600), marginBottom: 2 }}>{d.name}</div>
          <div style={{ ...sans(12, 500, C.primary), marginBottom: 6 }}>{dp.specialty} · {dp.experience} лет стажа</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {dp.services?.some(s => s.type === "online")  && <Badge color="teal">Онлайн</Badge>}
            {dp.services?.some(s => s.type === "offline") && <Badge color="orange">Офлайн</Badge>}
            {dp.rating && <Badge color="green">⭐ {dp.rating}</Badge>}
          </div>
          {dp.services?.length > 0 && <div style={{ ...sans(12, 400, C.muted), marginBottom: 8 }}>от {Math.min(...dp.services.map(s => s.price)).toLocaleString("ru-RU")} ₽</div>}
          <Btn onClick={onBook} small style={{ width: "100%" }}>Записаться</Btn>
        </div>
      </div>
    </Card>
  );
}

function PatientFiles({ files, onAddFile }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fileBase64, setFileBase64] = useState(null);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setFileBase64(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!name) return;
    setSaving(true);
    await onAddFile({ name, comment, date, fileBase64, fileName });
    setSaving(false);
    setShowAdd(false); setName(""); setComment(""); setFileBase64(null); setFileName("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div style={{ minHeight: "100%" }}>
      <TopBar title="Мои файлы" right={<Btn onClick={() => setShowAdd(true)} small variant="ghost">+ Добавить</Btn>} />
      {showAdd && (
        <div style={{ padding: 16 }}>
          <Card>
            <div style={{ ...serif(18), marginBottom: 16 }}>Новый файл</div>
            <Input label="Название" value={name} onChange={setName} placeholder="Анализ крови март 2025" required />
            <Input label="Дата (примерная)" type="date" value={date} onChange={setDate} />
            <Textarea label="Комментарий" value={comment} onChange={setComment} placeholder="Краткое описание..." rows={2} />
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...sans(13, 600), marginBottom: 6 }}>Файл или фото</div>
              <div onClick={() => fileRef.current.click()} style={{ padding: 16, borderRadius: 12, border: `2px dashed ${C.border}`, textAlign: "center", cursor: "pointer", background: C.primaryLight }}>
                {fileBase64
                  ? fileBase64.startsWith("data:image") ? <img src={fileBase64} style={{ maxHeight: 120, borderRadius: 8 }} /> : <div style={{ ...sans(13, 500, C.primary) }}>📄 {fileName}</div>
                  : <div style={{ ...sans(13, 400, C.muted) }}>📎 Нажмите для загрузки</div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFile} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => setShowAdd(false)} variant="outline" style={{ flex: 1 }}>Отмена</Btn>
              <Btn onClick={save} disabled={!name || saving} style={{ flex: 1 }}>{saving ? "Загрузка..." : "Сохранить"}</Btn>
            </div>
          </Card>
        </div>
      )}
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {files.length === 0 && !showAdd && (
          <div style={{ textAlign: "center", padding: "48px 0", ...sans(14, 400, C.muted) }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            Файлов пока нет.<br />Загрузите первый анализ.
          </div>
        )}
        {files.map(f => (
          <Card key={f.id}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.fileType === "image" ? "#E3F2FD" : C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {f.fileType === "image" ? "🖼️" : "📄"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...sans(14, 600), marginBottom: 2 }}>{f.name}</div>
                <div style={{ ...sans(12, 400, C.muted), marginBottom: f.comment ? 4 : 0 }}>{f.date}</div>
                {f.comment && <div style={{ ...sans(12, 400, C.muted) }}>{f.comment}</div>}
                {f.fileURL && f.fileType === "image" && (
                  <img src={f.fileURL} style={{ marginTop: 8, maxWidth: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover" }} />
                )}
                {f.fileURL && f.fileType !== "image" && (
                  <a href={f.fileURL} target="_blank" rel="noreferrer" style={{ ...sans(12, 600, C.primary), display: "inline-block", marginTop: 6 }}>📥 Открыть файл</a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PatientAccess({ profile, onGrantAccess }) {
  const [search, setSearch]     = useState("");
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [granted, setGranted]   = useState(profile.card?.accessGranted || []);

  useEffect(() => {
    setLoading(true);
    searchDoctors("").then(d => { setDoctors(d); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!search) { searchDoctors("").then(setDoctors); return; }
    const t = setTimeout(() => searchDoctors(search).then(setDoctors), 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggle = async (doctorId) => {
    const give = !granted.includes(doctorId);
    setGranted(g => give ? [...g, doctorId] : g.filter(x => x !== doctorId));
    await onGrantAccess(doctorId);
  };

  return (
    <div style={{ minHeight: "100%" }}>
      <TopBar title="Доступ к карте" />
      <div style={{ padding: "16px 16px 24px" }}>
        <div style={{ ...sans(13, 400, C.muted), lineHeight: 1.6, marginBottom: 16 }}>
          Разрешите врачу просматривать вашу карту и файлы анализов.
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Поиск по имени или специальности..."
          style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, ...sans(14), outline: "none", boxSizing: "border-box", marginBottom: 14 }}
        />
        {loading ? <Spinner /> : doctors.map(d => {
          const hasAccess = granted.includes(d.id);
          return (
            <Card key={d.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {d.photoURL
                  ? <img src={d.photoURL} style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>👨‍⚕️</div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ ...sans(14, 600), marginBottom: 2 }}>{d.name}</div>
                  <div style={{ ...sans(12, 400, C.muted) }}>{d.doctorProfile?.specialty}</div>
                </div>
                <button onClick={() => toggle(d.id)} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${hasAccess ? C.danger : C.primary}`, background: hasAccess ? "#FFEBEE" : C.primaryLight, ...sans(12, 600, hasAccess ? C.danger : C.primary), cursor: "pointer" }}>
                  {hasAccess ? "Закрыть" : "Открыть"}
                </button>
              </div>
              {hasAccess && <div style={{ marginTop: 8, ...sans(11, 500, C.success) }}>✓ Доступ открыт</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PatientBook({ doctors, onBook }) {
  return (
    <div style={{ minHeight: "100%" }}>
      <TopBar title="Запись к врачу" />
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {doctors.map(d => <DoctorCard key={d.id} doctor={d} onBook={() => onBook(d)} />)}
      </div>
    </div>
  );
}

// ─── BOOKING FLOW ─────────────────────────────────────────────────────────────
function BookScreen({ doctor, profile, onBack, onCreate }) {
  const [step, setStep]             = useState(1);
  const [window_, setWindow]         = useState("");
  const [half, setHalf]             = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [paymentOk, setPaymentOk]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const dp = doctor.doctorProfile;

  const handleSend = async () => {
    setLoading(true);
    await onCreate({ doctorId: doctor.id, requestedWindow: window_, preferredHalf: half, selectedService, paymentApproved: paymentOk, doctorSlots: [], chosenSlot: null });
    setLoading(false);
    setStep(3);
  };

  if (step === 3) return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📨</div>
      <div style={{ ...serif(24), marginBottom: 10 }}>Запрос отправлен!</div>
      <div style={{ ...sans(14, 400, C.muted), lineHeight: 1.6, maxWidth: 280, marginBottom: 24 }}>Врач {doctor.name} получил запрос и предложит подходящее время.</div>
      <Btn onClick={onBack} variant="ghost">← Назад</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: C.bg }}>
      <TopBar title="Запись на приём" onBack={onBack} right={<span style={{ ...sans(12, 400, C.muted) }}>{step}/2</span>} />
      <div style={{ height: 4, background: C.border }}><div style={{ height: "100%", background: C.primary, width: `${step * 50}%`, transition: "width 0.3s" }} /></div>
      <div style={{ padding: 16 }}>
        {step === 1 && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              {doctor.photoURL ? <img src={doctor.photoURL} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover" }} /> : <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👨‍⚕️</div>}
              <div><div style={{ ...sans(15, 600) }}>{doctor.name}</div><div style={{ ...sans(12, 400, C.primary) }}>{dp.specialty}</div></div>
            </div>
            <div style={{ ...serif(18), marginBottom: 12 }}>Когда вам удобно?</div>
            {["Ближайшие 2 дня","На этой неделе","В течение месяца","В течение 2 месяцев"].map(w => (
              <button key={w} onClick={() => setWindow(w)} style={{ width: "100%", marginBottom: 8, padding: "13px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer", border: `1.5px solid ${window_ === w ? C.primary : C.border}`, background: window_ === w ? C.primaryLight : "#fff", ...sans(14, window_ === w ? 600 : 400, window_ === w ? C.primary : C.text) }}>{w}</button>
            ))}
            <div style={{ ...serif(18), marginBottom: 12, marginTop: 8 }}>Предпочтительное время</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[["Первая половина дня","🌅 Утро","09:00–13:00"],["Вторая половина дня","🌆 Вечер","13:00–20:00"]].map(([key, label, time]) => (
                <button key={key} onClick={() => setHalf(key)} style={{ flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${half === key ? C.primary : C.border}`, background: half === key ? C.primaryLight : "#fff", ...sans(13, half === key ? 600 : 400, half === key ? C.primary : C.text) }}>
                  {label}<br /><span style={{ fontSize: 11, color: C.muted }}>{time}</span>
                </button>
              ))}
            </div>
            <Btn onClick={() => setStep(2)} disabled={!window_ || !half} style={{ width: "100%" }}>Далее →</Btn>
          </div>
        )}
        {step === 2 && (
          <div>
            <div style={{ ...serif(18), marginBottom: 12 }}>Услуга</div>
            {dp.services?.map((s, i) => (
              <button key={i} onClick={() => setSelectedService(s)} style={{ width: "100%", marginBottom: 8, padding: "13px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer", border: `1.5px solid ${selectedService === s ? C.primary : C.border}`, background: selectedService === s ? C.primaryLight : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ ...sans(14, 600, selectedService === s ? C.primary : C.text) }}>{s.name}</div><div style={{ ...sans(12, 400, C.muted) }}>{s.type === "online" ? "💬 Онлайн" : "🏥 Офлайн"}</div></div>
                <div style={{ ...sans(15, 700, C.primary) }}>{s.price?.toLocaleString("ru-RU")} ₽</div>
              </button>
            ))}
            <div style={{ ...serif(18), marginBottom: 10, marginTop: 16 }}>Оплата</div>
            <Card style={{ marginBottom: 16 }}>
              {dp.payment?.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < dp.payment.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 18 }}>💳</span><span style={{ ...sans(13, 500) }}>{p}</span>
                </div>
              ))}
            </Card>
            <div onClick={() => setPaymentOk(!paymentOk)} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${paymentOk ? C.primary : C.border}`, background: paymentOk ? C.primaryLight : "#fff", marginBottom: 20 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${paymentOk ? C.primary : C.border}`, background: paymentOk ? C.primary : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {paymentOk && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ ...sans(13, 500, paymentOk ? C.primary : C.text) }}>Способ оплаты мне подходит</span>
            </div>
            <Btn onClick={handleSend} disabled={!selectedService || !paymentOk || loading} style={{ width: "100%" }}>
              {loading ? "Отправляем..." : "Отправить запрос врачу"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DOCTOR APP ───────────────────────────────────────────────────────────────
function DoctorApp({ profile, currentUser, logout }) {
  const [tab, setTab]               = useState("home");
  const [appointments, setAppointments] = useState([]);
  const [allUsers, setAllUsers]     = useState({});

  useEffect(() => {
    const unsub = subscribeDoctorAppointments(currentUser.uid, async (appts) => {
      setAppointments(appts);
      // Подгрузить данные пациентов
      const ids = [...new Set(appts.map(a => a.patientId))];
      for (const id of ids) {
        if (!allUsers[id]) {
          const { getDoc, doc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          const snap = await getDoc(doc(db, "users", id));
          if (snap.exists()) setAllUsers(u => ({ ...u, [id]: { id, ...snap.data() } }));
        }
      }
    });
    return unsub;
  }, [currentUser.uid]);

  const dp = profile.doctorProfile;
  const pending = appointments.filter(a => a.status === "pending");

  if (!dp?.verified) {
    return (
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
        <div style={{ ...sans(12, 700, C.primary), letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>MedBridge Pro</div>
        <div style={{ ...serif(24), marginBottom: 10 }}>Профиль на верификации</div>
        <div style={{ ...sans(14, 400, C.muted), lineHeight: 1.6, maxWidth: 280, marginBottom: 24 }}>Документы проверяются администратором. После подтверждения профиль будет опубликован (1–3 дня).</div>
        <Btn onClick={logout} variant="outline">Выйти</Btn>
      </div>
    );
  }

  const TABS = [
    { id: "home",     icon: "🏠", label: "Главная" },
    { id: "requests", icon: "📋", label: "Запросы" },
    { id: "profile",  icon: "👤", label: "Профиль" },
  ];

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "home"     && <DoctorHome profile={profile} appointments={appointments} allUsers={allUsers} onLogout={logout} />}
        {tab === "requests" && <DoctorRequests profile={profile} currentUser={currentUser} appointments={appointments} allUsers={allUsers} />}
        {tab === "profile"  && <DoctorProfile profile={profile} onLogout={logout} />}
      </div>
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", padding: "6px 0 10px", flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.id === "requests" && pending.length > 0 && <span style={{ position: "absolute", top: 0, right: "20%", background: C.danger, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{pending.length}</span>}
            <span style={{ ...sans(10, tab === t.id ? 700 : 400, tab === t.id ? C.primary : C.muted) }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function DoctorHome({ profile, appointments, allUsers, onLogout }) {
  const confirmed = appointments.filter(a => a.status === "confirmed");
  const dp = profile.doctorProfile;
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, padding: "24px 20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ ...sans(11, 600, "rgba(255,255,255,0.6)"), letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>MedBridge Pro · Кабинет врача</div>
            <div style={{ ...serif(20, "#fff"), marginBottom: 2 }}>{profile.name}</div>
            <div style={{ ...sans(13, 500, "rgba(255,255,255,0.8)") }}>{dp.specialty} · {dp.experience} лет</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {profile.photoURL ? <img src={profile.photoURL} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} /> : <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👨‍⚕️</div>}
            <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", ...sans(11, 500, "#fff"), cursor: "pointer" }}>Выйти</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[["📋", confirmed.length, "Записей"],["⭐", dp.rating || "—", "Рейтинг"],["💬", dp.reviewCount, "Отзывов"]].map(([icon, val, label]) => (
            <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 12 }}>
              <div style={{ ...sans(20, 700, "#fff") }}>{val}</div>
              <div style={{ ...sans(11, 400, "rgba(255,255,255,0.75)") }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {confirmed.length > 0 && <>
          <div style={{ ...sans(14, 600) }}>Ближайшие приёмы</div>
          {confirmed.slice(0, 3).map(a => {
            const patient = allUsers[a.patientId];
            return (
              <Card key={a.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑</div>
                  <div style={{ flex: 1 }}><div style={{ ...sans(13, 600) }}>{patient?.name || "Пациент"}</div><div style={{ ...sans(12, 400, C.muted) }}>🗓 {a.chosenSlot}</div></div>
                  <Badge color="green">Подтверждено</Badge>
                </div>
              </Card>
            );
          })}
        </>}
        {confirmed.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", ...sans(14, 400, C.muted) }}><div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>Подтверждённых записей нет</div>}
      </div>
    </div>
  );
}

function DoctorRequests({ profile, currentUser, appointments, allUsers }) {
  const [selected, setSelected] = useState(null);
  const [slots, setSlots]       = useState(["", "", ""]);
  const [saving, setSaving]     = useState(false);
  const pending  = appointments.filter(a => a.status === "pending");
  const offered  = appointments.filter(a => a.status === "offered");

  const sendOffer = async () => {
    const filled = slots.filter(s => s.trim());
    if (!filled.length) return;
    setSaving(true);
    await updateAppointment(selected, { status: "offered", doctorSlots: filled });
    setSaving(false);
    setSelected(null); setSlots(["", "", ""]);
  };

  if (selected) {
    const appt = appointments.find(a => a.id === selected);
    const patient = allUsers[appt?.patientId];
    return (
      <div style={{ minHeight: "100%", background: C.bg }}>
        <TopBar title="Запрос пациента" onBack={() => setSelected(null)} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ ...sans(11, 600, C.muted), letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Пациент</div>
            <div style={{ ...sans(15, 600), marginBottom: 2 }}>{patient?.name || "—"}</div>
          </Card>
          <Card>
            <div style={{ ...sans(11, 600, C.muted), letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Пожелания</div>
            <div style={{ ...sans(13, 500), marginBottom: 4 }}>📅 {appt?.requestedWindow}</div>
            <div style={{ ...sans(13, 500), marginBottom: 4 }}>🕐 {appt?.preferredHalf}</div>
            {appt?.selectedService && <div style={{ ...sans(13, 500) }}>🩺 {appt.selectedService.name}</div>}
          </Card>
          <Card>
            <div style={{ ...serif(16), marginBottom: 12 }}>Предложите 2–3 варианта времени</div>
            {slots.map((s, i) => (
              <input key={i} value={s} onChange={e => setSlots(sl => sl.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`Вариант ${i + 1}: напр. 15 мар, 10:00`}
                style={{ width: "100%", marginBottom: 8, padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, ...sans(13), outline: "none", boxSizing: "border-box" }}
              />
            ))}
            <Btn onClick={sendOffer} disabled={slots.filter(s => s.trim()).length === 0 || saving} style={{ width: "100%" }}>
              {saving ? "Отправляем..." : "Отправить варианты пациенту"}
            </Btn>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%" }}>
      <TopBar title="Запросы на приём" />
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.length > 0 && <>
          <div style={{ ...sans(13, 600, C.danger), marginBottom: 4 }}>🔴 Новые запросы</div>
          {pending.map(a => {
            const patient = allUsers[a.patientId];
            return (
              <Card key={a.id} onClick={() => setSelected(a.id)} style={{ border: `1.5px solid ${C.danger}44` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑</div>
                  <div style={{ flex: 1 }}><div style={{ ...sans(14, 600) }}>{patient?.name || "Пациент"}</div><div style={{ ...sans(12, 400, C.muted) }}>{a.requestedWindow} · {a.preferredHalf}</div></div>
                  <Badge color="red">Новый</Badge>
                </div>
              </Card>
            );
          })}
        </>}
        {offered.length > 0 && <>
          <div style={{ ...sans(13, 600, C.warning), marginBottom: 4, marginTop: 8 }}>🟡 Ожидают выбора пациента</div>
          {offered.map(a => {
            const patient = allUsers[a.patientId];
            return (
              <Card key={a.id} style={{ opacity: 0.85 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑</div>
                  <div style={{ flex: 1 }}><div style={{ ...sans(14, 600) }}>{patient?.name || "Пациент"}</div><div style={{ ...sans(12, 400, C.muted) }}>Предложено {a.doctorSlots?.length} вариантов</div></div>
                  <Badge color="orange">Ожидание</Badge>
                </div>
              </Card>
            );
          })}
        </>}
        {pending.length === 0 && offered.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", ...sans(14, 400, C.muted) }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>Новых запросов нет</div>}
      </div>
    </div>
  );
}

function DoctorProfile({ profile, onLogout }) {
  const dp = profile.doctorProfile;
  return (
    <div style={{ minHeight: "100%" }}>
      <TopBar title="Мой профиль" right={<Btn onClick={onLogout} small variant="outline">Выйти</Btn>} />
      <div style={{ padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Card style={{ textAlign: "center", padding: "24px 20px" }}>
          {profile.photoURL ? <img src={profile.photoURL} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }} /> : <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 12px" }}>👨‍⚕️</div>}
          <div style={{ ...serif(20), marginBottom: 4 }}>{profile.name}</div>
          <div style={{ ...sans(13, 500, C.primary), marginBottom: 8 }}>{dp.specialty}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <Badge color="teal">Стаж {dp.experience} лет</Badge>
            <Badge color="green">✓ Верифицирован</Badge>
            {dp.rating && <Badge color="gray">⭐ {dp.rating}</Badge>}
          </div>
        </Card>
        {dp.city?.length > 0 && <Card><div style={{ ...sans(13, 600), marginBottom: 8 }}>📍 Города</div>{dp.city.map((c, i) => <div key={i} style={{ ...sans(14), padding: "4px 0" }}>• {c}</div>)}</Card>}
        <Card>
          <div style={{ ...sans(13, 600), marginBottom: 10 }}>🩺 Услуги</div>
          {dp.services?.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < dp.services.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div><div style={{ ...sans(13, 500) }}>{s.name}</div><div style={{ ...sans(11, 400, C.muted) }}>{s.type === "online" ? "💬 Онлайн" : "🏥 Офлайн"}</div></div>
              <div style={{ ...sans(14, 700, C.primary) }}>{s.price?.toLocaleString("ru-RU")} ₽</div>
            </div>
          ))}
        </Card>
        {dp.payment?.length > 0 && <Card><div style={{ ...sans(13, 600), marginBottom: 8 }}>💳 Оплата</div>{dp.payment.map((p, i) => <div key={i} style={{ ...sans(13), padding: "4px 0" }}>• {p}</div>)}</Card>}
        {dp.resume && <Card><div style={{ ...sans(13, 600), marginBottom: 8 }}>📋 Резюме</div><div style={{ ...sans(13, 400, C.muted), lineHeight: 1.6 }}>{dp.resume}</div></Card>}
        {dp.education && <Card><div style={{ ...sans(13, 600), marginBottom: 8 }}>🎓 Образование</div><div style={{ ...sans(13) }}>{dp.education}</div></Card>}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { currentUser, profile, loading, login, register, logout } = useAuth();
  const [screen, setScreen] = useState("login"); // login | register

  // Если авторизован — сразу показываем приложение
  useEffect(() => {
    if (!loading && currentUser) setScreen("app");
    if (!loading && !currentUser) setScreen("login");
  }, [currentUser, loading]);

  return (
    <>
      <style>{FONTS}</style>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } ::-webkit-scrollbar{width:0} body{background:#1a2a3a} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", padding: 20 }}>
        <div style={{ width: 390, height: 780, borderRadius: 44, background: C.bg, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5),0 0 0 2px #333,inset 0 0 0 1px #555", display: "flex", flexDirection: "column" }}>

          {/* Status bar */}
          <div style={{ background: C.card, padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ ...sans(13, 600) }}>9:41</span>
            <div style={{ display: "flex", gap: 6, fontSize: 13 }}><span>●●●</span><span>WiFi</span><span>🔋</span></div>
          </div>

          {/* Telegram-style header */}
          <div style={{ background: C.primary, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌉</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...sans(14, 700, "#fff") }}>MedBridge</div>
              <div style={{ ...sans(10, 400, "rgba(255,255,255,0.7)") }}>by MedBridge</div>
            </div>
            {profile && (
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "3px 10px" }}>
                <span style={{ ...sans(10, 600, "#fff") }}>{profile.role === "patient" ? "🪪 Моя карта" : "⚕️ Pro"}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <Spinner />}

            {!loading && screen === "login" && (
              <LoginScreen onLogin={login} goRegister={() => setScreen("register")} />
            )}
            {!loading && screen === "register" && (
              <RegisterScreen onRegister={register} goLogin={() => setScreen("login")} />
            )}
            {!loading && screen === "app" && profile?.role === "patient" && (
              <PatientApp profile={profile} currentUser={currentUser} logout={logout} />
            )}
            {!loading && screen === "app" && profile?.role === "doctor" && (
              <DoctorApp profile={profile} currentUser={currentUser} logout={logout} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
