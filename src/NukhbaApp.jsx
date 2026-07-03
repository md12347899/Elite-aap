import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Anchor, Tag, Receipt, Gavel, Warehouse, Package, Waves, Flag, Stamp,
  CheckCircle2, PartyPopper, Ship, Mail, Lock, User, LogOut, Home,
  MapPin, Image as ImageIcon, FileText, Bell, MessageCircle, Plus,
  Upload, Users, Car, ChevronLeft, ChevronRight, Check, X, Loader2,
  Send, Download, Video as VideoIcon, Search, ShieldCheck, Clock3,
  Handshake, FileSpreadsheet, AlertTriangle, Compass, RefreshCw,
} from "lucide-react";
import { supabase, WHATSAPP_NUMBER, TRACKING_STEPS,
  sha256, getLocalSession, saveLocalSession, clearLocalSession,
  getUserById, getUserByEmail, getUserByAuthId,
  createUser, createUserFromGoogle,
  signInWithGoogle as googleOAuth, getGoogleSession, signOutGoogle,
} from "./supabaseClient";

/* =====================================================================
   نظام التصميم — "سجل الشحن" (Shipping Ledger)
   فكرة التصميم: وثيقة شحن بحري ورقية دافئة — مثل بوليصة شحن قديمة
   مطبوعة بحبر كستنائي على ورق عاجي، مع أختام جمركية كعلامات تتبع.
   ===================================================================== */
const C = {
  paper: "#FBF6EC",      // خلفية ورقية دافئة
  paperRaised: "#FFFFFF", // بطاقات مرتفعة
  ink: "#2C2620",         // نص أساسي (حبر داكن دافئ)
  inkSoft: "#6B6053",     // نص ثانوي
  navy: "#1F3A3D",        // أزرق بحري عميق — العناوين والهوية
  navySoft: "#2F5256",
  rust: "#B5562E",        // ختم جمركي / لون التمييز الرئيسي
  rustSoft: "#D97B4F",
  sand: "#EDE2CC",        // حدود وفواصل
  sandDeep: "#DCCBA8",
  gold: "#A8843A",        // تفاصيل ذهبية هادئة (للشارات المكتملة)
  success: "#3F7A4F",
  danger: "#B23B3B",
  info: "#2E5C73",
};

const FONT_DISPLAY = "'Markazi Text', 'Tajawal', serif";
const FONT_BODY = "'Tajawal', system-ui, sans-serif";

const ICONS = {
  tag: Tag, receipt: Receipt, gavel: Gavel, warehouse: Warehouse,
  package: Package, anchor: Anchor, waves: Waves, flag: Flag,
  stamp: Stamp, "check-circle": CheckCircle2, "party-popper": PartyPopper,
};

/* =====================================================================
   عناصر مشتركة
   ===================================================================== */
function Wordmark({ children }) {
  return (
    <span style={{ color: C.rust, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
      {children}
    </span>
  );
}

function Logo({ size = "md", dark }) {
  const dim = size === "lg" ? 60 : size === "sm" ? 38 : 46;
  const fs = size === "lg" ? 26 : size === "sm" ? 14 : 18;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: dim, height: dim, borderRadius: "50%",
          border: `2px solid ${C.rust}`, background: dark ? "rgba(255,255,255,0.08)" : "rgba(181,86,46,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          position: "relative",
        }}
      >
        <Ship size={dim * 0.46} color={C.rust} strokeWidth={1.8} />
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: fs, fontWeight: 700, color: dark ? C.paper : C.navy, fontFamily: FONT_DISPLAY, lineHeight: 1.1 }}>
          النخبة
        </div>
        <div style={{ fontSize: fs * 0.36, color: dark ? "rgba(251,246,236,0.6)" : C.inkSoft, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 2 }}>
          Elite Motors
        </div>
      </div>
    </div>
  );
}

function Card({ children, style = {}, hover = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: C.paperRaised,
        border: `1px solid ${hovered ? C.sandDeep : C.sand}`,
        borderRadius: 14,
        transition: "all 0.25s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 10px 28px rgba(44,38,32,0.08)" : "0 1px 3px rgba(44,38,32,0.04)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "rust", disabled, style = {}, size = "md", icon, type = "button" }) {
  const pad = size === "sm" ? "8px 16px" : size === "lg" ? "15px 36px" : "11px 22px";
  const fs = size === "sm" ? 12.5 : size === "lg" ? 15.5 : 14;
  const variants = {
    rust: { background: C.rust, color: "#fff", border: "none" },
    navy: { background: C.navy, color: C.paper, border: "none" },
    outline: { background: "transparent", color: C.navy, border: `1.5px solid ${C.sandDeep}` },
    danger: { background: "rgba(178,59,59,0.08)", color: C.danger, border: `1px solid rgba(178,59,59,0.25)` },
    ghost: { background: C.sand, color: C.ink, border: `1px solid ${C.sandDeep}` },
    success: { background: "#25D366", color: "#fff", border: "none" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: pad, fontSize: fs, borderRadius: 9, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        fontFamily: FONT_BODY, display: "inline-flex", alignItems: "center", gap: 8,
        justifyContent: "center", transition: "all 0.18s", letterSpacing: "0.01em",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {icon}
      {children}
    </button>
  );
}

function Badge({ children, color = C.rust, soft }) {
  return (
    <span
      style={{
        background: soft ? `${color}14` : `${color}1f`, color,
        border: `1px solid ${color}45`,
        borderRadius: 20, padding: "4px 13px", fontSize: 12.5, fontWeight: 700,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required, icon, ltr }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12.5, color: C.inkSoft, marginBottom: 7, fontWeight: 600 }}>
          {label}{required && <span style={{ color: C.rust }}> *</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", background: C.paper,
            border: `1.5px solid ${C.sand}`, borderRadius: 10,
            padding: icon ? "12px 44px 12px 14px" : "12px 14px", color: C.ink,
            fontSize: 14.5, outline: "none", boxSizing: "border-box",
            direction: ltr ? "ltr" : "rtl", fontFamily: FONT_BODY,
            textAlign: ltr ? "left" : "right", transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.rust)}
          onBlur={(e) => (e.target.style.borderColor = C.sand)}
        />
        {icon && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.inkSoft, pointerEvents: "none" }}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12.5, color: C.inkSoft, marginBottom: 7, fontWeight: 600 }}>
          {label}{required && <span style={{ color: C.rust }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: C.paper,
          border: `1.5px solid ${C.sand}`, borderRadius: 10,
          padding: "12px 14px", color: C.ink, fontSize: 14.5, outline: "none",
          fontFamily: FONT_BODY, cursor: "pointer",
        }}
      >
        {options.map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (msg) {
      const t = setTimeout(onClose, 4200);
      return () => clearTimeout(t);
    }
  }, [msg]);
  if (!msg) return null;
  const color = type === "success" ? C.success : type === "error" ? C.danger : C.navy;
  return (
    <div
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: C.paperRaised, border: `1.5px solid ${color}`, borderRadius: 12,
        padding: "14px 22px", color: C.ink, fontSize: 14, zIndex: 9999,
        boxShadow: `0 8px 32px rgba(44,38,32,0.18)`, direction: "rtl",
        display: "flex", alignItems: "flex-start", gap: 10, fontFamily: FONT_BODY,
        maxWidth: "92vw", lineHeight: 1.6,
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 2 }}>
        {type === "success" ? <Check size={18} color={color} /> : type === "error" ? <AlertTriangle size={18} color={color} /> : <Bell size={18} color={color} />}
      </span>
      <span>{msg}</span>
    </div>
  );
}

function ModalShell({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(44,38,32,0.55)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.paperRaised, border: `1px solid ${C.sand}`,
          borderRadius: 18, padding: 30, maxWidth: 620, width: "100%",
          maxHeight: "88vh", overflowY: "auto", direction: "rtl", fontFamily: FONT_BODY,
          boxShadow: "0 24px 60px rgba(44,38,32,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <button onClick={onClose} style={{ background: C.sand, border: "none", color: C.ink, cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "80px 20px" }}>
      <Loader2 size={40} color={C.rust} style={{ animation: "spin 1s linear infinite" }} />
      {label && <p style={{ color: C.inkSoft, fontSize: 14 }}>{label}</p>}
    </div>
  );
}

/* =====================================================================
   خريطة حية — Leaflet بطابع ورقي دافئ
   ===================================================================== */
function LiveMap({ lat = 25, lng = 55, originLat = 29.7604, originLng = -95.3698 }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return;
    let mounted = true;

    import("leaflet").then((L) => {
      if (!mounted || !mapRef.current || instanceRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([25, 30], 3);
      instanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB", maxZoom: 19,
      }).addTo(map);

      const mk = (color, size = 14) =>
        L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          className: "", iconAnchor: [size / 2, size / 2],
        });

      L.marker([originLat, originLng], { icon: mk(C.success) }).addTo(map).bindPopup("<b>ميناء المصدر</b><br>Houston, USA");
      L.marker([lat, lng], { icon: mk(C.rust, 20) }).addTo(map).bindPopup("<b>موقع الشحنة الحالي</b>").openPopup();
      L.marker([30.03, 47.92], { icon: mk(C.navy) }).addTo(map).bindPopup("<b>ميناء الوصول</b><br>Umm Qasr, Iraq");

      const route = L.polyline(
        [[originLat, originLng], [lat, lng], [30.03, 47.92]],
        { color: C.rust, weight: 2.5, opacity: 0.65, dashArray: "8,6" }
      ).addTo(map);
      map.fitBounds(route.getBounds(), { padding: [40, 40] });
    });

    return () => {
      mounted = false;
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: 300, borderRadius: 12, overflow: "hidden", background: C.sand, border: `1px solid ${C.sand}` }}
    />
  );
}


/* =====================================================================
   Auth Hook — نفس أسلوب Nexa (جدول مخصص + SHA-256 + localStorage)
   ===================================================================== */
function useNukhbaAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleSession, setGoogleSession] = useState(null); // لإكمال تسجيل Google

  useEffect(() => {
    (async () => {
      // 1) حاول استرجاع الجلسة المحفوظة محلياً
      const localId = getLocalSession();
      if (localId) {
        const u = await getUserById(localId);
        if (u) { setUser(u); setLoading(false); return; }
      }
      // 2) تحقق من رجوع Google OAuth
      const session = await getGoogleSession();
      if (session?.user) {
        const existing = await getUserByAuthId(session.user.id);
        if (existing) {
          saveLocalSession(existing.id);
          setUser(existing);
        } else {
          // مستخدم Google جديد — يحتاج إكمال بيانات
          setGoogleSession(session);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email, password) => {
    const u = await getUserByEmail(email);
    if (!u) return { error: "لا يوجد حساب بهذا البريد الإلكتروني" };
    const hash = await sha256(password + "::nukhba::" + email.trim().toLowerCase());
    if (hash !== u.passHash) return { error: "كلمة المرور غير صحيحة" };
    saveLocalSession(u.id);
    setUser(u);
    return {};
  };

  const signUp = async (email, password, fullName) => {
    const existing = await getUserByEmail(email);
    if (existing) return { error: "هذا البريد مسجّل مسبقاً، جرّب تسجيل الدخول" };
    const passHash = await sha256(password + "::nukhba::" + email.trim().toLowerCase());
    const u = await createUser({ email, fullName, passHash, role: "client" });
    if (!u) return { error: "تعذّر إنشاء الحساب، حاول مجدداً" };
    saveLocalSession(u.id);
    setUser(u);
    return {};
  };

  const completeGoogleSignup = async (fullName) => {
    if (!googleSession) return;
    const u = await createUserFromGoogle(
      googleSession.user.id,
      googleSession.user.email,
      fullName || googleSession.user.user_metadata?.full_name || googleSession.user.email?.split("@")[0]
    );
    if (u) { saveLocalSession(u.id); setUser(u); setGoogleSession(null); }
  };

  const signOut = async () => {
    clearLocalSession();
    await signOutGoogle();
    setUser(null);
    setGoogleSession(null);
  };

  const startGoogle = async () => {
    const ok = await googleOAuth();
    if (!ok) return { error: "تعذّر بدء تسجيل الدخول بجوجل" };
    return {};
  };

  return { user, loading, googleSession, setGoogleSession,
    signIn, signUp, signOut, startGoogle, completeGoogleSignup,
    // aliases للتوافق مع بقية الكود
    session: user ? { user } : null,
    profile: user,
    authError: null,
    clearAuthError: () => {},
  };
}

/* =====================================================================
   الصفحة الرئيسية
   ===================================================================== */
function HomePage({ onGoLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const services = [
    { icon: <Search size={28} color={C.rust} />, title: "شفافية كاملة", body: "تتبع سيارتك لحظة بلحظة من لحظة الشراء بالمزاد حتى وصولها لبابك" },
    { icon: <ShieldCheck size={28} color={C.rust} />, title: "أمان وضمان", body: "نضمن لك سلامة الإجراءات وصحة المستندات من البداية للنهاية" },
    { icon: <Clock3 size={28} color={C.rust} />, title: "خبرة طويلة", body: "سنوات من العمل باستيراد السيارات من المزادات الأمريكية إلى العراق" },
    { icon: <Handshake size={28} color={C.rust} />, title: "خدمة متكاملة", body: "نتولى كل شيء: الشراء، الشحن، التخليص، التسليم" },
  ];

  const steps = [
    "التصفح والاختيار", "الشراء من المزاد", "الفحص والتجهيز",
    "الشحن البحري", "التخليص الجمركي", "التسليم"
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.paper, color: C.ink, fontFamily: FONT_BODY }}>
      <style>{CSS_GLOBAL}</style>

      {/* شريط التنقل */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? `rgba(251,246,236,0.97)` : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.sand}` : "none",
        padding: "0 40px", height: 68, display: "flex", alignItems: "center",
        justifyContent: "space-between", transition: "all 0.3s",
      }}>
        <Logo />
        <div style={{ display: "flex", gap: 28, fontSize: 14, color: C.inkSoft }}>
          {["الرئيسية", "عن الشركة", "خدماتنا", "تواصل معنا"].map(t => (
            <span key={t} style={{ cursor: "pointer", transition: "color 0.2s", fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = C.rust}
              onMouseLeave={e => e.target.style.color = C.inkSoft}>{t}</span>
          ))}
        </div>
        <Btn onClick={onGoLogin} variant="rust" size="sm">دخول الحساب</Btn>
      </nav>

      {/* الهيرو — طابع وثيقة شحن */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative", overflow: "hidden",
        background: `linear-gradient(160deg, ${C.navy} 0%, #2A4D52 60%, #1F3A3D 100%)`,
      }}>
        {/* ختم ديكوري */}
        <div style={{
          position: "absolute", left: "8%", top: "50%", transform: "translateY(-50%)",
          width: 260, height: 260, borderRadius: "50%",
          border: `3px solid rgba(251,246,236,0.06)`, opacity: 0.5,
        }} />
        <div style={{
          position: "absolute", left: "9.5%", top: "50%", transform: "translateY(-50%)",
          width: 220, height: 220, borderRadius: "50%",
          border: `1.5px solid rgba(251,246,236,0.08)`,
        }} />
        <Ship size={100} color="rgba(251,246,236,0.04)" style={{ position: "absolute", left: "8%", top: "50%", transform: "translateY(-50%)" }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "110px 24px 70px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.35em", color: `rgba(181,86,46,0.9)`, marginBottom: 22, fontWeight: 700, textTransform: "uppercase" }}>
            Elite Motors Iraq — منصة الاستيراد
          </div>
          <h1 style={{ fontSize: "clamp(62px,10vw,120px)", fontWeight: 700, lineHeight: 0.95, marginBottom: 14, fontFamily: FONT_DISPLAY, color: C.paper }}>
            النخبة
          </h1>
          <div style={{ width: 60, height: 3, background: C.rust, margin: "0 auto 22px", borderRadius: 2 }} />
          <h2 style={{ fon
