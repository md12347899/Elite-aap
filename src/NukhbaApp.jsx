import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Car, Home, MapPin, Image as Img, FileText, Bell, MessageCircle,
  User, Settings, LogOut, Plus, ChevronLeft, ChevronRight, ChevronDown,
  Check, X, Search, Filter, Star, Heart, Share2, Download, Eye,
  Shield, Lock, Mail, Phone, Upload, Send, Anchor, Ship,
  Package, Waves, Flag, Compass, BarChart3, Users, Truck,
  Clock, AlertCircle, CheckCircle2, Loader2, Menu, ArrowLeft,
  Camera, Video, FileImage, Zap, Globe, RefreshCw, MoreVertical,
  Edit3, Trash2, PlusCircle, QrCode, ExternalLink, Info,
} from "lucide-react";
import {
  supabase, WA, STEPS, getUID, saveUID, clearUID, sha256,
  dbGetById, dbGetByEmail, dbGetByAuth, dbCreateUser, dbCreateFromGoogle,
  googleSignIn, googleSignOut, googleGetSession,
} from "./supabaseClient";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — النخبة Elite Motors
   Dark luxury: deep navy + warm amber/gold accent
   ═══════════════════════════════════════════════════════════ */
const T = {
  bg:       "#0D1B2A",   // الخلفية الرئيسية
  bg2:      "#162032",   // خلفية ثانوية
  card:     "#1A2740",   // البطاقات
  card2:    "#1F2F4A",   // بطاقات داخلية
  border:   "rgba(255,255,255,0.07)",
  accent:   "#C4883E",   // ذهبي دافئ (النخبة)
  accentL:  "#D4A55A",   // أفتح
  accentD:  "#A36A28",   // أغمق
  teal:     "#00B896",   // تيل للنجاح
  danger:   "#EF4444",
  warning:  "#F59E0B",
  text:     "#F0EDE8",   // نص أساسي (بيج فاتح)
  text2:    "#8A9BB8",   // نص ثانوي
  text3:    "#5A6B84",   // نص ثالثي
};

const F = "'Cairo', 'Tajawal', system-ui, sans-serif";

const GLOW = `0 0 20px rgba(196,136,62,0.25), 0 4px 20px rgba(0,0,0,0.4)`;
const SHADOW = `0 4px 24px rgba(0,0,0,0.35)`;
const SHADOW_LG = `0 8px 40px rgba(0,0,0,0.5)`;

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS
   ═══════════════════════════════════════════════════════════ */
const G = `
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body{background:${T.bg};color:${T.text};font-family:${F};overscroll-behavior:none;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(196,136,62,0.3);border-radius:2px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
  @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
  @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(196,136,62,0.3);}50%{box-shadow:0 0 25px rgba(196,136,62,0.7);}}
  @keyframes slideIn{from{transform:translateX(100%);}to{transform:translateX(0);}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
  .fade-up{animation:fadeUp 0.4s ease both;}
  .fade-in{animation:fadeIn 0.3s ease both;}
  .slide-up{animation:slideUp 0.35s cubic-bezier(.4,0,.2,1) both;}
  .shimmer{background:linear-gradient(90deg,${T.card} 25%,${T.card2} 50%,${T.card} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
  input,textarea,select{font-family:${F};}
  input:focus,textarea:focus{outline:none;}
  button{font-family:${F};cursor:pointer;}
  .no-select{user-select:none;-webkit-user-select:none;}
  img{object-fit:cover;}
`;

/* ═══════════════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════════════ */
const Spinner = ({ size = 24, color = T.accent }) => (
  <Loader2 size={size} color={color} style={{ animation: "spin 0.8s linear infinite" }} />
);

const PageLoader = () => (
  <div style={{ position: "fixed", inset: 0, background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
    <style>{G}</style>
    <EliteLogo size={80} />
    <div style={{ marginTop: 32, width: 200, height: 3, background: T.card2, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: "60%", background: `linear-gradient(90deg,${T.accentD},${T.accent},${T.accentL})`, borderRadius: 2, animation: "shimmer 1.2s infinite", backgroundSize: "200% 100%" }} />
    </div>
    <p style={{ marginTop: 16, fontSize: 13, color: T.text3, letterSpacing: "0.1em" }}>نرافق سيارتك من المزاد حتى باب منزلك</p>
  </div>
);

function EliteLogo({ size = 48, text = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.25,
        background: `linear-gradient(135deg, ${T.accentD} 0%, ${T.accent} 50%, ${T.accentL} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: GLOW, flexShrink: 0,
      }}>
        <Ship size={size * 0.48} color="#0D1B2A" strokeWidth={2} />
      </div>
      {text && (
        <div>
          <div style={{ fontSize: size * 0.38, fontWeight: 800, color: T.text, lineHeight: 1.1, letterSpacing: "-0.01em" }}>النخبة</div>
          <div style={{ fontSize: size * 0.18, color: T.accent, letterSpacing: "0.18em", fontWeight: 500 }}>ELITE MOTORS</div>
        </div>
      )}
    </div>
  );
}

const Btn = ({ children, onClick, variant = "accent", size = "md", disabled, style: s = {}, icon, full }) => {
  const pad = size === "sm" ? "9px 18px" : size === "lg" ? "16px 36px" : "13px 24px";
  const fs  = size === "sm" ? 13 : size === "lg" ? 16 : 14.5;
  const V = {
    accent:  { background: `linear-gradient(135deg,${T.accentD},${T.accent})`, color: "#0D1B2A", border: "none", boxShadow: GLOW },
    outline: { background: "transparent", color: T.accent, border: `1.5px solid ${T.accent}40` },
    ghost:   { background: T.card2, color: T.text, border: `1px solid ${T.border}` },
    danger:  { background: "rgba(239,68,68,0.12)", color: T.danger, border: `1px solid rgba(239,68,68,0.25)` },
    teal:    { background: `linear-gradient(135deg,#009B7D,${T.teal})`, color: "#0D1B2A", border: "none" },
    wa:      { background: "#25D366", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        ...V[variant], padding: pad, fontSize: fs, fontWeight: 700,
        borderRadius: 14, display: "inline-flex", alignItems: "center",
        justifyContent: "center", gap: 8, transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : undefined, fontFamily: F,
        ...s,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >{icon}{children}</button>
  );
};

const Card = ({ children, style: s = {}, onClick, glow }) => (
  <div
    onClick={onClick}
    style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
      boxShadow: glow ? GLOW : SHADOW, transition: "all 0.2s",
      cursor: onClick ? "pointer" : "default", ...s,
    }}
  >{children}</div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  const color = type === "success" ? T.teal : type === "error" ? T.danger : T.accent;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: T.card2, border: `1px solid ${color}50`, borderRadius: 16,
      padding: "14px 20px", color: T.text, fontSize: 14, zIndex: 9998,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}20`,
      display: "flex", alignItems: "center", gap: 10, fontFamily: F,
      maxWidth: "90vw", animation: "slideUp 0.3s ease",
    }}>
      {type === "success" ? <CheckCircle2 size={18} color={color} /> : type === "error" ? <AlertCircle size={18} color={color} /> : <Bell size={18} color={color} />}
      {msg}
    </div>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: T.bg2, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto", direction: "rtl", fontFamily: F, animation: "slideUp 0.3s ease" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: "sticky", top: 0, background: T.bg2, padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <button onClick={onClose} style={{ background: T.card2, border: "none", color: T.text2, borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
          <div style={{ width: 34 }} />
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder, icon, ltr, required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12.5, color: T.text2, marginBottom: 7, fontWeight: 600 }}>{label}{required && <span style={{ color: T.accent }}> *</span>}</label>}
    <div style={{ position: "relative" }}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: T.card2, border: `1.5px solid ${T.border}`, borderRadius: 14,
          padding: icon ? "13px 44px 13px 16px" : "13px 16px", color: T.text, fontSize: 15,
          direction: ltr ? "ltr" : "rtl", textAlign: ltr ? "left" : "right",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = T.accent + "80"}
        onBlur={e => e.target.style.borderColor = T.border}
      />
      {icon && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.text3 }}>{icon}</span>}
    </div>
  </div>
);

const SF = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12.5, color: T.text2, marginBottom: 7, fontWeight: 600 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", background: T.card2, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "13px 16px", color: T.text, fontSize: 15, fontFamily: F }}>
      {options.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  </div>
);

const Badge = ({ children, color = T.accent }) => (
  <span style={{ background: `${color}18`, color, border: `1px solid ${color}35`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
    {children}
  </span>
);

const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
    <div style={{ flex: 1, height: 1, background: T.border }} />
    {label && <span style={{ fontSize: 12, color: T.text3, flexShrink: 0 }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: T.border }} />
  </div>
);

const ProgressBar = ({ value, max = 11, color = T.accent }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div style={{ height: 6, background: T.card2, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${T.accentD},${T.accent})`, borderRadius: 3, transition: "width 1s ease", boxShadow: `0 0 8px ${T.accent}60` }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAP COMPONENT
   ═══════════════════════════════════════════════════════════ */
function LiveMap({ lat = 25, lng = 55, originLat = 29.76, originLng = -95.37 }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (inst.current || !ref.current) return;
    let alive = true;
    import("leaflet").then(L => {
      if (!alive || !ref.current || inst.current) return;
      const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([25, 30], 2);
      inst.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);
      const mk = (color, s = 14) => L.divIcon({
        html: `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color};"></div>`,
        className: "", iconAnchor: [s / 2, s / 2],
      });
      L.marker([originLat, originLng], { icon: mk("#22C55E") }).addTo(map).bindPopup("ميناء المصدر — هيوستن");
      L.marker([lat, lng], { icon: mk(T.accent, 20) }).addTo(map).bindPopup("الموقع الحالي").openPopup();
      L.marker([30.03, 47.92], { icon: mk(T.teal) }).addTo(map).bindPopup("ميناء أم قصر — العراق");
      const r = L.polyline([[originLat, originLng], [lat, lng], [30.03, 47.92]], { color: T.accent, weight: 2, opacity: 0.7, dashArray: "8,5" }).addTo(map);
      map.fitBounds(r.getBounds(), { padding: [30, 30] });
    });
    return () => { alive = false; if (inst.current) { inst.current.remove(); inst.current = null; } };
  }, [lat, lng]);
  return <div ref={ref} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />;
}

/* ═══════════════════════════════════════════════════════════
   AUTH HOOK
   ═══════════════════════════════════════════════════════════ */
function useAuth() {
  const [user, setUser] = useState(null);
  const [gSess, setGSess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const id = getUID();
      if (id) { const u = await dbGetById(id); if (u) { setUser(u); setLoading(false); return; } }
      const s = await googleGetSession();
      if (s?.user) {
        const ex = await dbGetByAuth(s.user.id);
        if (ex) { saveUID(ex.id); setUser(ex); }
        else setGSess(s);
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email, pass) => {
    const u = await dbGetByEmail(email);
    if (!u) return { error: "لا يوجد حساب بهذا البريد" };
    const h = await sha256(pass + "::elite::" + email.trim().toLowerCase());
    if (h !== u.hash) return { error: "كلمة المرور غير صحيحة" };
    saveUID(u.id); setUser(u); return {};
  };

  const signUp = async (email, pass, name) => {
    if (await dbGetByEmail(email)) return { error: "البريد مسجّل مسبقاً" };
    const hash = await sha256(pass + "::elite::" + email.trim().toLowerCase());
    const u = await dbCreateUser({ email, name, hash });
    if (!u) return { error: "تعذّر إنشاء الحساب" };
    saveUID(u.id); setUser(u); return {};
  };

  const finishGoogle = async (name) => {
    if (!gSess) return;
    const u = await dbCreateFromGoogle(gSess.user.id, gSess.user.email,
      name || gSess.user.user_metadata?.full_name || gSess.user.email?.split("@")[0]);
    if (u) { saveUID(u.id); setUser(u); setGSess(null); }
  };

  const signOut = async () => { clearUID(); await googleSignOut(); setUser(null); setGSess(null); };
  const startGoogle = async () => { const ok = await googleSignIn(); return ok ? {} : { error: "تعذّر بدء تسجيل الدخول" }; };

  return { user, loading, gSess, signIn, signUp, signOut, startGoogle, finishGoogle };
}

/* ═══════════════════════════════════════════════════════════
   SPLASH SCREEN
   ═══════════════════════════════════════════════════════════ */
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${T.bg2} 0%, ${T.bg} 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, direction: "rtl" }}>
      <style>{G}</style>
      <div style={{ animation: "fadeUp 0.8s ease both" }}>
        <EliteLogo size={90} />
      </div>
      <p style={{ marginTop: 24, fontSize: 16, color: T.text2, animation: "fadeUp 0.8s 0.4s ease both", textAlign: "center", maxWidth: 280, lineHeight: 1.7 }}>
        نرافق سيارتك من المزاد حتى باب منزلك
      </p>
      <div style={{ marginTop: 48, width: 180, height: 3, background: T.card2, borderRadius: 2, overflow: "hidden", animation: "fadeIn 0.5s 0.8s ease both", opacity: 0 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${T.accentD},${T.accent},${T.accentL})`, borderRadius: 2, animation: "shimmer 1.2s 0.8s infinite", backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
function LoginPage({ auth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [toast, setToast] = useState({});

  const submit = async () => {
    if (!email || !pass) return setToast({ msg: "البريد وكلمة المرور مطلوبان", type: "error" });
    setBusy(true);
    if (mode === "login") {
      const r = await auth.signIn(email, pass);
      if (r.error) setToast({ msg: r.error, type: "error" });
    } else {
      if (!name) { setBusy(false); return setToast({ msg: "الاسم مطلوب", type: "error" }); }
      const r = await auth.signUp(email, pass, name);
      if (r.error) setToast({ msg: r.error, type: "error" });
      else setToast({ msg: "تم إنشاء الحساب!", type: "success" });
    }
    setBusy(false);
  };

  const google = async () => {
    setGBusy(true);
    const r = await auth.startGoogle();
    if (r.error) { setToast({ msg: r.error, type: "error" }); setGBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% 20%, ${T.bg2} 0%, ${T.bg} 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", direction: "rtl", fontFamily: F }}>
      <style>{G}</style>

      {/* Logo */}
      <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
        <EliteLogo size={64} />
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: "28px 24px", boxShadow: SHADOW_LG, animation: "fadeUp 0.5s 0.1s ease both", opacity: 0 }}>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          {mode === "login" ? "مرحباً بعودتك" : "إنشاء حساب"}
        </h2>
        <p style={{ fontSize: 13.5, color: T.text2, marginBottom: 24 }}>
          {mode === "login" ? "سجّل دخولك لمتابعة سيارتك" : "أنشئ حسابك للوصول للمنصة"}
        </p>

        {/* Google */}
        <button onClick={google} disabled={gBusy} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, background: "#fff", color: "#3c4043", border: "none", borderRadius: 14,
          padding: "13px", fontWeight: 700, fontSize: 14.5, cursor: gBusy ? "not-allowed" : "pointer",
     
