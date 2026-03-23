import { useState } from "react";

const COLORS = {
  bg: "#F7F9F8",
  card: "#FFFFFF",
  primary: "#2A7A6F",
  primaryLight: "#E8F5F3",
  primaryDark: "#1D5C54",
  accent: "#4ECDC4",
  accentWarm: "#FF6B6B",
  text: "#1A2A28",
  textMuted: "#6B8A86",
  border: "#E2EEEC",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#E74C3C",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

// ── DEMO DATA ────────────────────────────────────────────────────────────────

const DOCTORS = [
  { id: 1, name: "Анна Петровна Соколова", specialty: "Терапевт", exp: 14, online: true, emoji: "👩‍⚕️", slots: ["09:00","10:00","14:00","15:30"], rating: 4.9 },
  { id: 2, name: "Дмитрий Игоревич Власов", specialty: "Кардиолог", exp: 20, online: false, emoji: "👨‍⚕️", slots: ["11:00","12:00","16:00"], rating: 4.8 },
  { id: 3, name: "Мария Александровна Белова", specialty: "Дерматолог", exp: 9, online: true, emoji: "👩‍⚕️", slots: ["09:30","13:00","17:00"], rating: 5.0 },
  { id: 4, name: "Сергей Николаевич Орлов", specialty: "Хирург", exp: 22, online: false, emoji: "👨‍⚕️", slots: ["10:00","15:00"], rating: 4.7 },
];

const SERVICES = [
  { id: 1, name: "Консультация терапевта", price: 2500, duration: 30, online: true, category: "Консультации", icon: "🩺" },
  { id: 2, name: "ЭКГ с расшифровкой", price: 1800, duration: 20, online: false, category: "Диагностика", icon: "💓" },
  { id: 3, name: "Онлайн-консультация", price: 1500, duration: 30, online: true, category: "Онлайн", icon: "💬" },
  { id: 4, name: "УЗИ брюшной полости", price: 3200, duration: 40, online: false, category: "Диагностика", icon: "🔬" },
  { id: 5, name: "Анализ крови (общий)", price: 800, duration: 10, online: false, category: "Анализы", icon: "🩸" },
  { id: 6, name: "Дерматоскопия", price: 2200, duration: 25, online: false, category: "Диагностика", icon: "🔍" },
  { id: 7, name: "Консультация кардиолога", price: 3000, duration: 40, online: false, category: "Консультации", icon: "❤️" },
  { id: 8, name: "Биохимия крови", price: 1400, duration: 10, online: false, category: "Анализы", icon: "🧪" },
];

const RESULTS = [
  { id: 1, name: "Общий анализ крови", date: "02 мар 2025", status: "ready", values: [
    { label: "Гемоглобин", value: "138 г/л", norm: "120–160", ok: true },
    { label: "Лейкоциты", value: "7.2 × 10⁹/л", norm: "4.0–9.0", ok: true },
    { label: "Тромбоциты", value: "180 × 10⁹/л", norm: "150–400", ok: true },
    { label: "СОЭ", value: "22 мм/ч", norm: "2–15", ok: false },
  ], doctor: "Соколова А.П.", comment: "Незначительное повышение СОЭ. Рекомендую повторить через 2 недели." },
  { id: 2, name: "Биохимия крови", date: "28 фев 2025", status: "ready", values: [
    { label: "Глюкоза", value: "4.8 ммоль/л", norm: "3.9–6.1", ok: true },
    { label: "Холестерин", value: "5.2 ммоль/л", norm: "до 5.2", ok: true },
    { label: "АЛТ", value: "28 Ед/л", norm: "до 40", ok: true },
  ], doctor: "Власов Д.И.", comment: "Показатели в норме." },
  { id: 3, name: "Анализ мочи", date: "01 мар 2025", status: "pending" },
];

const PRESCRIPTIONS = [
  { id: 1, drug: "Амоксициллин 500мг", dosage: "1 таб × 3 раза в день", duration: "7 дней", doctor: "Соколова А.П.", date: "01 мар 2025", active: true, instructions: "Принимать после еды, запивать водой. Не пропускать приём." },
  { id: 2, drug: "Лоратадин 10мг", dosage: "1 таб × 1 раз в день", duration: "14 дней", doctor: "Белова М.А.", date: "20 фев 2025", active: true, instructions: "Принимать утром натощак." },
  { id: 3, drug: "Омепразол 20мг", dosage: "1 кап × 2 раза в день", duration: "21 день", doctor: "Соколова А.П.", date: "10 фев 2025", active: false, instructions: "" },
];

const CHAT_HISTORY = {
  1: [
    { from: "doctor", text: "Добрый день! Как вы себя чувствуете после курса лечения?", time: "10:02" },
    { from: "me", text: "Здравствуйте! Намного лучше, температура прошла.", time: "10:15" },
    { from: "doctor", text: "Отлично. Продолжайте принимать антибиотик до конца курса, даже если почувствуете себя полностью здоровым.", time: "10:17" },
    { from: "me", text: "Понял, спасибо!", time: "10:18" },
  ],
};

const MY_DOCTORS_DATA = [
  {
    id: 1, doctorId: 1, lastVisit: "01 мар 2025", nextVisit: "15 мар 2025",
    status: "active",
    history: [
      { from: "doctor", text: "Добрый день! Как вы себя чувствуете после курса лечения?", time: "10:02", date: "01 мар" },
      { from: "me", text: "Намного лучше, температура прошла.", time: "10:15", date: "01 мар" },
      { from: "doctor", text: "Отлично. Продолжайте принимать антибиотик до конца курса.", time: "10:17", date: "01 мар" },
    ],
  },
  {
    id: 2, doctorId: 3, lastVisit: "20 фев 2025", nextVisit: null,
    status: "closed",
    history: [
      { from: "doctor", text: "Результаты дерматоскопии в норме. Рекомендую повторный осмотр через год.", time: "14:30", date: "20 фев" },
      { from: "me", text: "Спасибо! Нужно ли что-то особенное использовать для профилактики?", time: "14:45", date: "20 фев" },
      { from: "doctor", text: "Используйте SPF 30+ ежедневно, особенно весной и летом.", time: "14:50", date: "20 фев" },
    ],
  },
];

const SUPPORT_SCENARIOS = [
  {
    id: "headache",
    trigger: "Голова",
    questions: [
      { id: "q1", text: "Как давно болит голова?", options: ["Первый раз", "Несколько дней", "Больше недели", "Хроническая боль"] },
      { id: "q2", text: "Где локализуется боль?", options: ["Висок/Лоб", "Затылок", "Вся голова", "Одна сторона"] },
      { id: "q3", text: "Есть ли сопутствующие симптомы?", options: ["Тошнота", "Светобоязнь", "Давление", "Ничего"] },
    ],
    result: { doctor: 1, specialty: "Терапевт", urgency: "normal", message: "По вашим симптомам рекомендуем консультацию терапевта. Это поможет исключить причины и подобрать лечение." },
  },
  {
    id: "skin",
    trigger: "Кожа",
    questions: [
      { id: "q1", text: "Что вас беспокоит?", options: ["Высыпания", "Родинка изменилась", "Сухость/зуд", "Другое"] },
      { id: "q2", text: "Как давно это началось?", options: ["Только появилось", "Несколько недель", "Больше месяца"] },
      { id: "q3", text: "Есть ли аллергия или хронические болезни кожи?", options: ["Да", "Нет", "Не знаю"] },
    ],
    result: { doctor: 3, specialty: "Дерматолог", urgency: "normal", message: "Рекомендуем консультацию дерматолога. Специалист проведёт осмотр и при необходимости назначит дерматоскопию." },
  },
  {
    id: "heart",
    trigger: "Сердце",
    questions: [
      { id: "q1", text: "Что беспокоит?", options: ["Боль в груди", "Учащённый пульс", "Одышка", "Давление"] },
      { id: "q2", text: "Боль возникает?", options: ["В покое", "При нагрузке", "Постоянно", "Периодически"] },
      { id: "q3", text: "Бывают обмороки или головокружение?", options: ["Да, часто", "Иногда", "Нет"] },
    ],
    result: { doctor: 2, specialty: "Кардиолог", urgency: "high", message: "Симптомы требуют консультации кардиолога. При острой боли в груди — немедленно вызовите скорую." },
  },
];

// ── REUSABLE UI ──────────────────────────────────────────────────────────────

const css = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (vals[i] ?? ""), "");

function Badge({ color, children }) {
  const colors = {
    green: { bg: "#E8F5E9", text: "#2E7D32" },
    teal: { bg: COLORS.primaryLight, text: COLORS.primary },
    orange: { bg: "#FFF3E0", text: "#E65100" },
    red: { bg: "#FFEBEE", text: "#C62828" },
    gray: { bg: "#F5F5F5", text: "#616161" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3 }}>
      {children}
    </span>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: COLORS.card, borderRadius: 16, padding: "16px 18px",
      boxShadow: "0 2px 12px rgba(42,122,111,0.07)", border: `1px solid ${COLORS.border}`,
      cursor: onClick ? "pointer" : "default", transition: "transform 0.15s, box-shadow 0.15s",
      ...style
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(42,122,111,0.13)"; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(42,122,111,0.07)"; } }}
    >
      {children}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 18px 10px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px 4px 0", fontSize: 20, color: COLORS.primary }}>←</button>
      )}
      <span style={{ flex: 1, fontFamily: "'Instrument Serif', serif", fontSize: 20, color: COLORS.text }}>{title}</span>
      {right}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled }) {
  const styles = {
    primary: { background: COLORS.primary, color: "#fff" },
    outline: { background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    danger: { background: COLORS.danger, color: "#fff" },
    ghost: { background: COLORS.primaryLight, color: COLORS.primary },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: "12px 22px", borderRadius: 12, border: "none",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "opacity 0.15s, transform 0.1s", ...style
    }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

// ── SCREENS ──────────────────────────────────────────────────────────────────

function HomeScreen({ navigate }) {
  const today = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, ${COLORS.accent} 100%)`, padding: "28px 20px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, right: 30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 4, textTransform: "capitalize" }}>{today}</div>
        <div style={{ fontFamily: "'Instrument Serif', serif", color: "#fff", fontSize: 26, lineHeight: 1.2, marginBottom: 6 }}>Добрый день,<br /><em>Алексей!</em></div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>МедЦентр Здоровье · ul. Swobodna 1, Wrocław</div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Next appointment banner */}
        <Card style={{ background: `linear-gradient(120deg, ${COLORS.primaryLight} 0%, #fff 100%)`, border: `1.5px solid ${COLORS.primary}22` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32 }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Ближайший приём</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>Соколова А.П. — Терапевт</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontSize: 13, fontWeight: 500, marginBottom: 5 }}>15 марта, 10:00</div>
              <Badge color="orange">🏥 В клинике</Badge>
            </div>
            <Badge color="teal">Завтра</Badge>
          </div>
        </Card>

        {/* Main menu grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "👨‍⚕️", label: "Врачи", sub: "4 специалиста", screen: "doctors", color: "#E8F5F3" },
            { icon: "🩺", label: "Услуги", sub: "8 позиций", screen: "services", color: "#FFF3E0" },
            { icon: "📋", label: "Записаться", sub: "Приём / Анализы", screen: "appointment", color: "#E8F5F3" },
            { icon: "🤖", label: "AI-помощник", sub: "Подбор специалиста", screen: "support", color: "#EDE7F6" },
            { icon: "💬", label: "Мои врачи", sub: "Переписка / история", screen: "mydoctors", color: "#F3E5F5" },
            { icon: "🧪", label: "Результаты", sub: "3 анализа", screen: "results", color: "#E3F2FD" },
            { icon: "💊", label: "Рецепты", sub: "2 активных", screen: "prescriptions", color: "#FCE4EC" },
            { icon: "💬", label: "Онлайн", sub: "Консультация", screen: "consult", color: "#E8F5F3" },
          ].map(item => (
            <Card key={item.screen} onClick={() => navigate(item.screen)} style={{ padding: "18px 16px", background: item.color, border: "none" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 15, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12 }}>{item.sub}</div>
            </Card>
          ))}
        </div>

        {/* Clinic info */}
        <Card>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14, marginBottom: 10 }}>🏥 О клинике</div>
          {[
            { icon: "📍", text: "ul. Swobodna 1, Wrocław" },
            { icon: "📞", text: "+7 (495) 123-45-67" },
            { icon: "🕐", text: "Пн-Пт: 8:00–20:00  |  Сб: 9:00–17:00" },
          ].map(item => (
            <div key={item.icon} style={{ display: "flex", gap: 10, marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted }}>
              <span>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function DoctorsScreen({ navigate }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const d = DOCTORS.find(x => x.id === selected);
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <TopBar title={d.specialty} onBack={() => setSelected(null)} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{d.emoji}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.text, marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{d.specialty}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <Badge color="teal">Опыт {d.exp} лет</Badge>
              {d.online && <Badge color="green">Онлайн ✓</Badge>}
              <Badge color="gray">⭐ {d.rating}</Badge>
            </div>
          </Card>
          <Card>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.text, marginBottom: 10 }}>Доступное время</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {d.slots.map(s => (
                <div key={s} style={{ padding: "8px 16px", borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>{s}</div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => navigate("appointment", "doctors")} style={{ flex: 1 }}>🏥 В клинику</Btn>
            {d.online
              ? <Btn onClick={() => navigate("consult")} variant="outline" style={{ flex: 1 }}>💬 Онлайн</Btn>
              : <Btn disabled variant="outline" style={{ flex: 1 }}>💬 Онлайн</Btn>
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Наши врачи" onBack={() => navigate("home")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {DOCTORS.map(d => (
          <Card key={d.id} onClick={() => setSelected(d.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{d.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 15, marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontSize: 13, marginBottom: 5 }}>{d.specialty} · опыт {d.exp} лет</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {d.online && <Badge color="green">Онлайн</Badge>}
                  <Badge color="gray">⭐ {d.rating}</Badge>
                </div>
              </div>
              <span style={{ color: COLORS.textMuted, fontSize: 18 }}>›</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServicesScreen({ navigate }) {
  const [format, setFormat] = useState(null); // null | "online" | "clinic"
  const [category, setCategory] = useState("Все");

  const onlineCategories = ["Все", "Консультации", "Онлайн"];
  const clinicCategories = ["Все", "Консультации", "Диагностика", "Анализы"];

  const categories = format === "online" ? onlineCategories : clinicCategories;

  const filtered = SERVICES.filter(s => {
    const matchFormat = format === "online" ? s.online : !s.online;
    const matchCat = category === "Все" || s.category === category;
    return matchFormat && matchCat;
  });

  // Step 1 — choose format
  if (!format) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <TopBar title="Услуги" onBack={() => navigate("home")} />
        <div style={{ padding: "24px 16px" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.text, marginBottom: 6 }}>Как удобнее?</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Выберите формат — покажем доступные услуги
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card onClick={() => { setFormat("online"); setCategory("Все"); }} style={{ padding: "24px 20px", background: "linear-gradient(120deg, #E8F5F3 0%, #fff 100%)", border: `1.5px solid ${COLORS.primary}33`, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>💬</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 16, marginBottom: 4 }}>Онлайн</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5 }}>Консультации с врачом<br />не выходя из дома</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 20, color: COLORS.primary }}>›</span>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>
                  {SERVICES.filter(s => s.online).length} услуг доступно
                </span>
              </div>
            </Card>

            <Card onClick={() => { setFormat("clinic"); setCategory("Все"); }} style={{ padding: "24px 20px", background: "linear-gradient(120deg, #FFF3E0 0%, #fff 100%)", border: "1.5px solid #E6521033", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E65100", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🏥</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 16, marginBottom: 4 }}>В клинике</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5 }}>Диагностика, анализы<br />и очный приём врача</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 20, color: "#E65100" }}>›</span>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#E65100", fontWeight: 600 }}>
                  {SERVICES.filter(s => !s.online).length} услуг доступно
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — list with category filter
  const isOnline = format === "online";
  const accentColor = isOnline ? COLORS.primary : "#E65100";

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar
        title={isOnline ? "Онлайн-услуги" : "Услуги в клинике"}
        onBack={() => { setFormat(null); setCategory("Все"); }}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: isOnline ? COLORS.primaryLight : "#FFF3E0" }}>
            <span style={{ fontSize: 14 }}>{isOnline ? "💬" : "🏥"}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: accentColor }}>{isOnline ? "Онлайн" : "В клинике"}</span>
          </div>
        }
      />

      {/* Category filter */}
      <div style={{ padding: "10px 16px 6px", display: "flex", gap: 8, overflowX: "auto" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
            background: category === c ? accentColor : (isOnline ? COLORS.primaryLight : "#FFF3E0"),
            color: category === c ? "#fff" : accentColor,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13
          }}>{c}</button>
        ))}
      </div>

      <div style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 14 }}>
            Нет услуг в этой категории
          </div>
        )}
        {filtered.map(s => (
          <Card key={s.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 28, marginTop: 2 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14, marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12, marginBottom: 8 }}>⏱ {s.duration} мин</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Badge color={isOnline ? "green" : "orange"}>{isOnline ? "Онлайн" : "В клинике"}</Badge>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: accentColor, fontSize: 15 }}>{s.price.toLocaleString("ru-RU")} ₽</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AppointmentScreen({ navigate, fromScreen = "home" }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [slot, setSlot] = useState(null);
  const [done, setDone] = useState(false);

  const dates = ["15 мар", "16 мар", "17 мар", "18 мар", "19 мар"];
  const [date, setDate] = useState(dates[0]);

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
    } else {
      navigate(fromScreen);
    }
  };

  const [surveyStep, setSurveyStep] = useState(0); // 0=not started, 1-4=questions, 5=done
  const [surveyAnswers, setSurveyAnswers] = useState({});

  const PRE_SURVEY = [
    { q: "Основная жалоба / причина визита?", type: "text", placeholder: "Опишите кратко..." },
    { q: "Как давно беспокоит?", type: "options", options: ["Впервые", "Несколько дней", "Несколько недель", "Больше месяца"] },
    { q: "Принимаете ли сейчас какие-то лекарства?", type: "options", options: ["Нет", "Да — постоянно", "Да — курсом"] },
    { q: "Есть ли аллергия на препараты?", type: "options", options: ["Нет", "Да", "Не знаю"] },
  ];

  if (done && surveyStep === 0) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: COLORS.text, marginBottom: 8 }}>Запись подтверждена!</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 14, marginBottom: 4 }}>{DOCTORS.find(d => d.id === doctor)?.name}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.primary, fontSize: 16, marginBottom: 24 }}>{date} · {slot}</div>
        <Card style={{ width: "100%", background: COLORS.primaryLight, border: `1.5px solid ${COLORS.primary}33`, textAlign: "left", marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 14, marginBottom: 6 }}>📋 Заполните опрос для врача</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>Займёт 1 минуту. Врач ознакомится с вашими ответами до приёма — это сэкономит время и поможет лучше подготовиться.</div>
          <Btn onClick={() => setSurveyStep(1)} style={{ width: "100%" }}>Заполнить сейчас</Btn>
        </Card>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, textDecoration: "underline" }}>Заполню позже</button>
      </div>
    );
  }

  if (done && surveyStep > 0 && surveyStep <= PRE_SURVEY.length) {
    const q = PRE_SURVEY[surveyStep - 1];
    const [textVal, setTextVal] = useState("");
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <div style={{ padding: "14px 18px 10px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSurveyStep(s => s - 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.primary }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: COLORS.text }}>Опрос для врача</div>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13 }}>{surveyStep}/{PRE_SURVEY.length}</span>
        </div>
        <div style={{ height: 4, background: COLORS.border }}>
          <div style={{ height: "100%", background: COLORS.accent, width: `${(surveyStep / PRE_SURVEY.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.primary, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Вопрос {surveyStep}</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, color: COLORS.text, marginBottom: 24, lineHeight: 1.3 }}>{q.q}</div>
          {q.type === "text" ? (
            <div>
              <textarea placeholder={q.placeholder} rows={4} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", background: "#fff" }} />
              <Btn style={{ width: "100%", marginTop: 16 }} onClick={() => setSurveyStep(s => s + 1)}>Далее →</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map(opt => (
                <button key={opt} onClick={() => { setSurveyAnswers(a => ({ ...a, [surveyStep]: opt })); setSurveyStep(s => s + 1); }}
                  style={{ padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${surveyAnswers[surveyStep] === opt ? COLORS.primary : COLORS.border}`, background: surveyAnswers[surveyStep] === opt ? COLORS.primaryLight : "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: COLORS.text, cursor: "pointer", textAlign: "left" }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (done && surveyStep > PRE_SURVEY.length) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: COLORS.text, marginBottom: 8 }}>Опрос отправлен врачу!</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginBottom: 28, lineHeight: 1.6, maxWidth: 280 }}>Врач ознакомится с вашими ответами до приёма. Напоминание придёт за день и за час.</div>
        <Btn onClick={() => navigate("home")}>На главную</Btn>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Запись" onBack={handleBack} right={
        <span style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13 }}>{step}/3</span>
      } />

      {/* Progress */}
      <div style={{ height: 4, background: COLORS.border }}>
        <div style={{ height: "100%", background: COLORS.primary, width: `${(step / 3) * 100}%`, transition: "width 0.3s" }} />
      </div>

      <div style={{ padding: 16 }}>
        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.text, marginBottom: 16 }}>Тип визита</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "doctor", icon: "👨‍⚕️", title: "Приём к врачу", sub: "Выбрать специалиста и время" },
                { key: "tests", icon: "🧪", title: "Сдача анализов", sub: "Лаборатория, без записи к врачу" },
              ].map(opt => (
                <Card key={opt.key} onClick={() => { setType(opt.key); setStep(2); }} style={{ border: type === opt.key ? `2px solid ${COLORS.primary}` : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 32 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 15 }}>{opt.title}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13 }}>{opt.sub}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.text, marginBottom: 16 }}>Выберите врача</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DOCTORS.map(d => (
                <Card key={d.id} onClick={() => { setDoctor(d.id); setStep(3); }} style={{ border: doctor === d.id ? `2px solid ${COLORS.primary}` : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 26 }}>{d.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{d.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontSize: 12 }}>{d.specialty}</div>
                    </div>
                    <span style={{ color: COLORS.textMuted }}>›</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: COLORS.text, marginBottom: 16 }}>Дата и время</div>
            {/* Date pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
              {dates.map(d => (
                <button key={d} onClick={() => setDate(d)} style={{
                  padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  background: date === d ? COLORS.primary : COLORS.primaryLight,
                  color: date === d ? "#fff" : COLORS.primary,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13
                }}>{d}</button>
              ))}
            </div>
            {/* Time slots */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {DOCTORS.find(d => d.id === doctor)?.slots.map(s => (
                <button key={s} onClick={() => setSlot(s)} style={{
                  padding: "12px 0", borderRadius: 12, border: `1.5px solid ${slot === s ? COLORS.primary : COLORS.border}`,
                  background: slot === s ? COLORS.primary : "#fff",
                  color: slot === s ? "#fff" : COLORS.text,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer"
                }}>{s}</button>
              ))}
            </div>
            <Btn onClick={() => setDone(true)} disabled={!slot} style={{ width: "100%" }}>Подтвердить запись</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsultScreen({ navigate }) {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(CHAT_HISTORY[1] || []);
  const [sending, setSending] = useState(false);

  if (selected) {
    const d = DOCTORS.find(x => x.id === selected);
    const send = () => {
      if (!input.trim()) return;
      setMessages(prev => [...prev, { from: "me", text: input.trim(), time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);
      setInput("");
      setSending(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { from: "doctor", text: "Понял, спасибо. Уточните, пожалуйста, когда это началось?", time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);
        setSending(false);
      }, 1400);
    };

    return (
      <div style={{ height: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, gap: 12 }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.primary }}>←</button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{d.emoji}</div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{d.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.success, fontSize: 12 }}>● Онлайн</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.from === "me" ? COLORS.primary : COLORS.card,
                color: m.from === "me" ? "#fff" : COLORS.text,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
              }}>
                {m.text}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.time}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 4 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, fontStyle: "italic" }}>врач печатает...</div>
            </div>
          )}
        </div>

        <div style={{ padding: "10px 12px", background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Написать врачу..." style={{
              flex: 1, padding: "11px 16px", borderRadius: 24, border: `1.5px solid ${COLORS.border}`,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", background: COLORS.bg
            }} />
          <button onClick={send} style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.primary, border: "none", cursor: "pointer", fontSize: 18 }}>↑</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Онлайн-консультация" onBack={() => navigate("home")} />
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
          Задайте вопрос врачу, не выходя из дома. Консультация проходит в чате в режиме реального времени.
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 15, marginBottom: 10 }}>Доступны онлайн</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DOCTORS.filter(d => d.online).map(d => (
            <Card key={d.id} onClick={() => setSelected(d.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{d.emoji}</div>
                  <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: COLORS.success, border: "2px solid #fff" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>{d.specialty}</div>
                  <Badge color="green">Онлайн сейчас</Badge>
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>1 500 ₽</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ navigate }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const r = RESULTS.find(x => x.id === selected);
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <TopBar title={r.name} onBack={() => setSelected(null)} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, marginBottom: 2 }}>Дата: {r.date} · Врач: {r.doctor}</div>
          </Card>
          {r.values?.map((v, i) => (
            <Card key={i}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{v.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12 }}>Норма: {v.norm}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: v.ok ? COLORS.success : COLORS.danger, fontSize: 16 }}>{v.value}</div>
                  <Badge color={v.ok ? "green" : "red"}>{v.ok ? "Норма" : "Выше нормы"}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {r.comment && (
            <Card style={{ background: "#FFFDE7", border: "1.5px solid #FDD835" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#795548", fontSize: 13, marginBottom: 4 }}>💬 Комментарий врача</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#5D4037", fontSize: 14, lineHeight: 1.6 }}>{r.comment}</div>
            </Card>
          )}
          <Btn style={{ width: "100%" }} variant="ghost">📥 Скачать PDF</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Результаты анализов" onBack={() => navigate("home")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {RESULTS.map(r => (
          <Card key={r.id} onClick={r.status === "ready" ? () => setSelected(r.id) : undefined} style={{ opacity: r.status === "pending" ? 0.65 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>🧪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14, marginBottom: 3 }}>{r.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12 }}>{r.date}</div>
              </div>
              {r.status === "ready" ? <Badge color="green">Готово</Badge> : <Badge color="orange">В обработке</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PrescriptionsScreen({ navigate }) {
  const [selected, setSelected] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  if (requesting) {
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <TopBar title="Запрос рецепта" onBack={() => setRequesting(false)} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6 }}>
            Врач рассмотрит ваш запрос и выпишет рецепт в течение 24 часов
          </div>
          {[
            { label: "Препарат", placeholder: "Название лекарства..." },
            { label: "Причина", placeholder: "Для чего нужен..." },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 13, marginBottom: 6 }}>{f.label}</div>
              <input placeholder={f.placeholder} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 13, marginBottom: 6 }}>Врач</div>
            <select style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, background: "#fff", outline: "none" }}>
              {DOCTORS.map(d => <option key={d.id}>{d.name} — {d.specialty}</option>)}
            </select>
          </div>
          {requested ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📨</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: COLORS.text }}>Запрос отправлен!</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>Врач ответит в течение 24 часов</div>
            </div>
          ) : (
            <Btn style={{ width: "100%" }} onClick={() => setRequested(true)}>Отправить запрос</Btn>
          )}
        </div>
      </div>
    );
  }

  if (selected) {
    const p = PRESCRIPTIONS.find(x => x.id === selected);
    return (
      <div style={{ minHeight: "100%", background: COLORS.bg }}>
        <TopBar title="Рецепт" onBack={() => setSelected(null)} />
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ background: p.active ? COLORS.primaryLight : "#F5F5F5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: COLORS.text }}>{p.drug}</div>
              <Badge color={p.active ? "green" : "gray"}>{p.active ? "Активен" : "Истёк"}</Badge>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13 }}>Выписан: {p.date} · {p.doctor}</div>
          </Card>
          {[
            { label: "Дозировка", val: p.dosage },
            { label: "Длительность", val: p.duration },
            { label: "Инструкции", val: p.instructions },
          ].map(item => item.val && (
            <Card key={item.label}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: COLORS.text, fontSize: 14 }}>{item.val}</div>
            </Card>
          ))}
          <Btn style={{ width: "100%" }} variant="ghost">📥 Скачать рецепт</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Рецепты" onBack={() => navigate("home")} right={
        <Btn onClick={() => setRequesting(true)} variant="ghost" style={{ padding: "7px 14px", fontSize: 13 }}>+ Запросить</Btn>
      } />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {PRESCRIPTIONS.map(p => (
          <Card key={p.id} onClick={() => setSelected(p.id)} style={{ opacity: p.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>💊</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14, marginBottom: 2 }}>{p.drug}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}>{p.dosage} · {p.duration}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 11 }}>{p.doctor} · {p.date}</div>
              </div>
              <Badge color={p.active ? "green" : "gray"}>{p.active ? "Активен" : "Истёк"}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT CHAT (AI diagnostics) ────────────────────────────────────────────

function SupportChatScreen({ navigate }) {
  const [phase, setPhase] = useState("greeting"); // greeting | scenario | survey | operator | done
  const [scenario, setScenario] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([
    { from: "bot", text: "Здравствуйте! Я помогу разобраться с вашей ситуацией и подскажу, к какому специалисту обратиться. Что вас беспокоит?", time: "сейчас" },
  ]);
  const [opInput, setOpInput] = useState("");
  const [opMessages, setOpMessages] = useState([
    { from: "op", text: "Добрый день! Я передаю вас оператору. Чем могу помочь?", time: "сейчас" },
  ]);
  const [typing, setTyping] = useState(false);

  const addBotMsg = (text, delay = 900) => {
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { from: "bot", text, time: "сейчас" }]);
      setTyping(false);
    }, delay);
  };

  const chooseSymptom = (sc) => {
    setScenario(sc);
    setMessages(m => [...m, { from: "me", text: sc.trigger, time: "сейчас" }]);
    setPhase("survey");
    setQIndex(0);
    addBotMsg(sc.questions[0].text);
  };

  const answerQuestion = (opt) => {
    const sc = scenario;
    const newAnswers = { ...answers, [qIndex]: opt };
    setAnswers(newAnswers);
    setMessages(m => [...m, { from: "me", text: opt, time: "сейчас" }]);
    if (qIndex + 1 < sc.questions.length) {
      setQIndex(qIndex + 1);
      addBotMsg(sc.questions[qIndex + 1].text);
    } else {
      setPhase("result");
      addBotMsg(sc.result.message, 1000);
    }
  };

  const sendOpMsg = () => {
    if (!opInput.trim()) return;
    setOpMessages(m => [...m, { from: "me", text: opInput.trim(), time: "сейчас" }]);
    setOpInput("");
    setTimeout(() => {
      setOpMessages(m => [...m, { from: "op", text: "Понял вас, уточняю информацию. Один момент...", time: "сейчас" }]);
    }, 1200);
  };

  if (phase === "operator") {
    return (
      <div style={{ height: "100%", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, gap: 12 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.primary }}>←</button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E8EAF6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👩‍💼</div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>Поддержка клиники</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.success, fontSize: 12 }}>● Онлайн</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {opMessages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? COLORS.primary : COLORS.card, color: m.from === "me" ? "#fff" : COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
          <input value={opInput} onChange={e => setOpInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendOpMsg()} placeholder="Написать оператору..." style={{ flex: 1, padding: "11px 16px", borderRadius: 24, border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", background: COLORS.bg }} />
          <button onClick={sendOpMsg} style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.primary, border: "none", cursor: "pointer", fontSize: 18 }}>↑</button>
        </div>
      </div>
    );
  }

  const sc = scenario;
  const currentQ = sc && phase === "survey" ? sc.questions[qIndex] : null;

  return (
    <div style={{ height: "100%", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, gap: 12 }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.primary }}>←</button>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>AI-помощник</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.success, fontSize: 12 }}>● Онлайн</div>
        </div>
        <button onClick={() => setPhase("operator")} style={{ background: COLORS.primaryLight, border: "none", borderRadius: 20, padding: "5px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: COLORS.primary, cursor: "pointer" }}>👩‍💼 Оператор</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? COLORS.primary : COLORS.card, color: m.from === "me" ? "#fff" : COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ background: COLORS.card, borderRadius: 16, padding: "10px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.textMuted, animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {/* Symptom buttons */}
        {phase === "greeting" && !typing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginBottom: 4 }}>Выберите тему или напишите сами</div>
            {SUPPORT_SCENARIOS.map(sc => (
              <button key={sc.id} onClick={() => chooseSymptom(sc)} style={{ padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: COLORS.card, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.text, cursor: "pointer", textAlign: "left" }}>
                {sc.id === "headache" ? "🤕 " : sc.id === "skin" ? "🔍 " : "❤️ "}{sc.trigger}
              </button>
            ))}
            <button onClick={() => setPhase("operator")} style={{ padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: "#F3E5F5", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#7B1FA2", cursor: "pointer", textAlign: "left" }}>
              💬 Другой вопрос — написать оператору
            </button>
          </div>
        )}

        {/* Survey options */}
        {phase === "survey" && currentQ && !typing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {currentQ.options.map(opt => (
              <button key={opt} onClick={() => answerQuestion(opt)} style={{ padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: COLORS.card, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: COLORS.text, cursor: "pointer", textAlign: "left" }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Result + booking CTA */}
        {phase === "result" && !typing && sc && (
          <div style={{ marginTop: 8 }}>
            {sc.result.urgency === "high" && (
              <Card style={{ background: "#FFEBEE", border: "1.5px solid #EF9A9A", marginBottom: 10 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#C62828", fontSize: 14 }}>⚠️ Требует внимания</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#C62828", fontSize: 13, marginTop: 4 }}>При острой боли — вызовите скорую (103)</div>
              </Card>
            )}
            <Card style={{ background: COLORS.primaryLight, border: `1.5px solid ${COLORS.primary}33` }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 14, marginBottom: 4 }}>Рекомендуем специалиста</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{DOCTORS.find(d => d.id === sc.result.doctorId)?.emoji || "👨‍⚕️"}</span>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{DOCTORS.find(d => d.id === sc.result.doctor)?.name}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontSize: 12 }}>{sc.result.specialty}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => navigate("appointment")} style={{ flex: 1, fontSize: 13, padding: "10px 12px" }}>📅 Записаться</Btn>
                <Btn onClick={() => navigate("consult")} variant="outline" style={{ flex: 1, fontSize: 13, padding: "10px 12px" }}>💬 Онлайн</Btn>
              </div>
            </Card>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ── MY DOCTORS ────────────────────────────────────────────────────────────────

function MyDoctorsScreen({ navigate }) {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [extraMessages, setExtraMessages] = useState([]);
  const [sending, setSending] = useState(false);

  if (selected) {
    const rec = MY_DOCTORS_DATA.find(r => r.id === selected);
    const doc = DOCTORS.find(d => d.id === rec.doctorId);
    const allMessages = [...rec.history, ...extraMessages];

    const send = () => {
      if (!input.trim()) return;
      setExtraMessages(m => [...m, { from: "me", text: input.trim(), time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), date: "сегодня" }]);
      setInput("");
      setSending(true);
      setTimeout(() => {
        setExtraMessages(m => [...m, { from: "doctor", text: "Спасибо за вопрос. Отвечу в ближайшее время в рабочие часы.", time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), date: "сегодня" }]);
        setSending(false);
      }, 1400);
    };

    return (
      <div style={{ height: "100%", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, gap: 12, flexShrink: 0 }}>
          <button onClick={() => { setSelected(null); setExtraMessages([]); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.primary }}>←</button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{doc.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{doc.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12 }}>{doc.specialty}</div>
          </div>
          {rec.status === "active" && <Badge color="green">Активно</Badge>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Date divider */}
          <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.textMuted, padding: "4px 0" }}>— История переписки —</div>

          {allMessages.map((m, i) => (
            <div key={i}>
              {i > 0 && allMessages[i-1].date !== m.date && (
                <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.textMuted, padding: "6px 0" }}>— {m.date} —</div>
              )}
              <div style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? COLORS.primary : COLORS.card, color: m.from === "me" ? "#fff" : COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  {m.text}
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.time}</div>
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", paddingLeft: 4 }}>врач печатает...</div>
          )}
        </div>

        {rec.status === "active" ? (
          <div style={{ padding: "10px 12px", background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Написать врачу..." style={{ flex: 1, padding: "11px 16px", borderRadius: 24, border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", background: COLORS.bg }} />
            <button onClick={send} style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.primary, border: "none", cursor: "pointer", fontSize: 18 }}>↑</button>
          </div>
        ) : (
          <div style={{ padding: "12px 16px", background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginBottom: 10 }}>Консультация завершена. Записаться снова?</div>
            <Btn onClick={() => navigate("appointment")} style={{ width: "100%" }} variant="ghost">📅 Записаться повторно</Btn>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <TopBar title="Мои врачи" onBack={() => navigate("home")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 13, marginBottom: 4, lineHeight: 1.6 }}>
          История консультаций и переписка с врачами
        </div>
        {MY_DOCTORS_DATA.map(rec => {
          const doc = DOCTORS.find(d => d.id === rec.doctorId);
          const lastMsg = rec.history[rec.history.length - 1];
          return (
            <Card key={rec.id} onClick={() => setSelected(rec.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{doc.emoji}</div>
                  {rec.status === "active" && <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: COLORS.success, border: "2px solid #fff" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{doc.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{rec.lastVisit}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.primary, fontSize: 12, marginBottom: 4 }}>{doc.specialty}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lastMsg.from === "doctor" ? "👨‍⚕️ " : "Вы: "}{lastMsg.text}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge color={rec.status === "active" ? "green" : "gray"}>{rec.status === "active" ? "Активная консультация" : "Завершено"}</Badge>
                {rec.nextVisit && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>Приём: {rec.nextVisit}</div>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── NAV BAR ──────────────────────────────────────────────────────────────────

const NAV = [
  { screen: "home", icon: "🏠", label: "Главная" },
  { screen: "appointment", icon: "📅", label: "Запись" },
  { screen: "support", icon: "🤖", label: "Помощник" },
  { screen: "mydoctors", icon: "💬", label: "Врачи" },
  { screen: "results", icon: "🧪", label: "Анализы" },
];

// ── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home");

  const [appointmentFrom, setAppointmentFrom] = useState("home");
  const navigateTo = (s, from) => {
    if (s === "appointment" && from) setAppointmentFrom(from);
    setScreen(s);
  };

  const screenMap = {
    home: <HomeScreen navigate={navigateTo} />,
    doctors: <DoctorsScreen navigate={navigateTo} />,
    services: <ServicesScreen navigate={navigateTo} />,
    appointment: <AppointmentScreen navigate={navigateTo} fromScreen={appointmentFrom} />,
    consult: <ConsultScreen navigate={navigateTo} />,
    results: <ResultsScreen navigate={navigateTo} />,
    prescriptions: <PrescriptionsScreen navigate={navigateTo} />,
    support: <SupportChatScreen navigate={navigateTo} />,
    mydoctors: <MyDoctorsScreen navigate={navigateTo} />,
  };

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        body { background: #1a1a2e; }
      `}</style>

      {/* Phone frame */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: 20 }}>
        <div style={{ width: 390, height: 780, borderRadius: 44, background: COLORS.bg, overflow: "hidden", position: "relative", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 2px #333, inset 0 0 0 1px #555", display: "flex", flexDirection: "column" }}>

          {/* Status bar */}
          <div style={{ background: COLORS.card, padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text }}>9:41</span>
            <div style={{ display: "flex", gap: 6, fontSize: 13, color: COLORS.text }}>
              <span>●●●</span><span>WiFi</span><span>🔋</span>
            </div>
          </div>

          {/* Telegram header */}
          <div style={{ background: COLORS.primary, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏥</div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#fff", fontSize: 14 }}>МедЦентр Здоровье</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Mini App</div>
            </div>
          </div>

          {/* Screen content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {screenMap[screen] || screenMap.home}
          </div>

          {/* Bottom nav */}
          <div style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "6px 0 10px", flexShrink: 0 }}>
            {NAV.map(n => (
              <button key={n.screen} onClick={() => navigateTo(n.screen)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: screen === n.screen ? 700 : 400, color: screen === n.screen ? COLORS.primary : COLORS.textMuted }}>{n.label}</span>
                {screen === n.screen && <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.primary, marginTop: 1 }} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
