import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Trophy, Lock, Mail, Phone, User, LogOut, Home, MapPin, Image as ImageIcon,
  FileText, Bell, MessageCircle, Plus, Upload, Settings, Users, Car,
  ChevronLeft, Check, X, Loader2, Send, Download, Video as VideoIcon,
  Sparkles, ShieldCheck, Clock, Handshake, Search, FileSpreadsheet,
} from "lucide-react";
import { supabase, WHATSAPP_NUMBER, TRACKING_STEPS } from "./supabaseClient";

// =============================================
// ألوان الهوية البصرية — النخبة
// =============================================
const C = {
  obsidian: "#0A0A0B",
  gold: "#C9A84C",
  paleGold: "#E8D5A3",
  charcoal: "#1A1A1F",
  smoke: "#2A2A32",
  pearl: "#F5F3EE",
  steel: "#9A9AA8",
  success: "#52C07A",
  danger: "#E05252",
  info: "#5299E0",
};

const FONT = "'Noto Kufi Arabic', system-ui, sans-serif";

// =============================================
// مكونات مشتركة
// =============================================
function GoldText({ children }) {
  return (
    <span
      style={{
        background: `linear-gradient(135deg, ${C.gold} 0%, ${C.paleGold} 50%, ${C.gold} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

function Logo({ size = "md" }) {
  const dim = size === "lg" ? 56 : size === "sm" ? 36 : 42;
  const fs = size === "lg" ? 22 : size === "sm" ? 13 : 16;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: dim, height: dim, borderRadius: "50%",
          border: `2px solid ${C.gold}`, background: "rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Trophy size={dim * 0.45} color={C.gold} />
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: fs, fontWeight: 700, color: C.gold }}>النخبة</div>
        <div style={{ fontSize: fs * 0.55, color: C.steel, letterSpacing: "0.15em", textTransform: "uppercase" }}>
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
        background: "rgba(26,26,31,0.9)",
        border: `1px solid ${hovered ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.15)"}`,
        borderRadius: 16,
        transition: "all 0.25s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 28px rgba(201,168,76,0.12)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "gold", disabled, style = {}, size = "md", icon }) {
  const pad = size === "sm" ? "8px 16px" : size === "lg" ? "15px 38px" : "11px 24px";
  const fs = size === "sm" ? 12 : size === "lg" ? 15 : 14;
  const variants = {
    gold: { background: `linear-gradient(135deg,${C.gold},${C.paleGold})`, color: C.obsidian, border: "none" },
    outline: { background: "transparent", color: C.gold, border: `1px solid rgba(201,168,76,0.4)` },
    danger: { background: "rgba(224,82,82,0.12)", color: C.danger, border: `1px solid rgba(224,82,82,0.3)` },
    ghost: { background: "rgba(42,42,50,0.8)", color: C.pearl, border: `1px solid rgba(201,168,76,0.15)` },
    success: { background: "#25D366", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: pad, fontSize: fs, borderRadius: 10, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
        fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 8,
        justifyContent: "center", transition: "all 0.2s", ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Badge({ children, color = C.gold }) {
  return (
    <span
      style={{
        background: `${color}18`, color, border: `1px solid ${color}40`,
        borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >
      {children}
    </span>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, icon, ltr }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 6 }}>
          {label}{required && " *"}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", background: "rgba(42,42,50,0.8)",
            border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10,
            padding: icon ? "11px 44px 11px 14px" : "11px 14px", color: C.pearl,
            fontSize: 14, outline: "none", boxSizing: "border-box",
            direction: ltr ? "ltr" : "rtl", fontFamily: FONT,
            textAlign: ltr ? "left" : "right",
          }}
        />
        {icon && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.steel }}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 6 }}>
          {label}{required && " *"}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: "rgba(42,42,50,0.9)",
          border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10,
          padding: "11px 14px", color: C.pearl, fontSize: 14, outline: "none",
          fontFamily: FONT, cursor: "pointer",
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
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [msg]);
  if (!msg) return null;
  const color = type === "success" ? C.success : type === "error" ? C.danger : C.gold;
  return (
    <div
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: C.charcoal, border: `1px solid ${color}`, borderRadius: 12,
        padding: "14px 24px", color: C.pearl, fontSize: 14, zIndex: 9999,
        boxShadow: `0 4px 30px ${color}30`, direction: "rtl",
        display: "flex", alignItems: "center", gap: 10, fontFamily: FONT,
        maxWidth: "90vw",
      }}
    >
      {type === "success" ? <Check size={18} color={color} /> : type === "error" ? <X size={18} color={color} /> : <Bell size={18} color={color} />}
      {msg}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.charcoal, border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20, padding: 30, maxWidth: 620, width: "100%",
          maxHeight: "88vh", overflowY: "auto", direction: "rtl", fontFamily: FONT,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.steel, cursor: "pointer" }}>
            <X size={20} />
          </button>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.pearl }}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "80px 20px" }}>
      <Loader2 size={44} color={C.gold} style={{ animation: "spin 1s linear infinite" }} />
      {label && <p style={{ color: C.steel, fontSize: 14 }}>{label}</p>}
    </div>
  );
}

// =============================================
// خريطة Leaflet حقيقية
// =============================================
function LiveMap({ lat = 25, lng = 55, originLat = 29.7604, originLng = -95.3698, label = "موقع الشحنة" }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return;
    let mounted = true;

    import("leaflet").then((L) => {
      if (!mounted || !mapRef.current || instanceRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([25, 30], 3);
      instanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB", maxZoom: 19,
      }).addTo(map);

      const mk = (color, size = 14) =>
        L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:3px solid #fff;box-shadow:0 0 14px ${color};"></div>`,
          className: "", iconAnchor: [size / 2, size / 2],
        });

      L.marker([originLat, originLng], { icon: mk(C.success) }).addTo(map).bindPopup("<b>ميناء المصدر</b><br>Houston, USA");
      L.marker([lat, lng], { icon: mk(C.gold, 20) }).addTo(map).bindPopup(`<b>${label}</b>`).openPopup();
      L.marker([30.03, 47.92], { icon: mk(C.danger) }).addTo(map).bindPopup("<b>ميناء الوصول</b><br>Umm Qasr, Iraq");

      const route = L.polyline(
        [[originLat, originLng], [lat, lng], [30.03, 47.92]],
        { color: C.gold, weight: 2.5, opacity: 0.7, dashArray: "8,5" }
      ).addTo(map);
      map.fitBounds(route.getBounds(), { padding: [40, 40] });
    });

    return () => {
      mounted = false;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: 300, borderRadius: 12, overflow: "hidden", background: C.charcoal, border: "1px solid rgba(201,168,76,0.1)" }}
    />
  );
}

// =============================================
// Auth Hook
// =============================================
function useNukhbaAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin, queryParams: { access_type: "offline", prompt: "consent" } },
    });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email, password, fullName, phone) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName, phone } },
    });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return { session, profile, loading, signIn, signInWithGoogle, signUp, signOut };
}

// =============================================
// الصفحة الرئيسية
// =============================================
function HomePage({ onGoLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const services = [
    { icon: <Search size={32} color={C.gold} />, ar: "شفافية كاملة", desc: "تتبع سيارتك لحظة بلحظة من المزاد حتى بابك" },
    { icon: <ShieldCheck size={32} color={C.gold} />, ar: "أمان وموثوقية", desc: "ضمان كامل على جميع إجراءات الاستيراد" },
    { icon: <Clock size={32} color={C.gold} />, ar: "خبرة سنوات", desc: "سنوات من الخبرة في استيراد السيارات الأمريكية" },
    { icon: <Handshake size={32} color={C.gold} />, ar: "خدمة متكاملة", desc: "من الشراء من المزاد حتى التسليم في العراق" },
  ];
  const steps = ["التصفح والاختيار", "الشراء من المزاد", "الفحص والتجهيز", "الشحن البحري", "التخليص الجمركي", "التسليم"];

  return (
    <div style={{ minHeight: "100vh", background: C.obsidian, color: C.pearl, fontFamily: FONT }}>
      <style>{globalCSS}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(10,10,11,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(201,168,76,0.15)" : "none",
          padding: "0 40px", height: 70, display: "flex", alignItems: "center",
          justifyContent: "space-between", transition: "all 0.3s",
        }}
      >
        <Logo />
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: C.steel }}>
          {["الرئيسية", "عن الشركة", "خدماتنا", "تواصل معنا"].map((t) => (
            <span key={t} style={{ cursor: "pointer" }}>{t}</span>
          ))}
        </div>
        <Btn onClick={onGoLogin} size="sm">تسجيل الدخول</Btn>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "100px 24px 60px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: C.gold, marginBottom: 24, opacity: 0.8 }}>ELITE MOTORS — IRAQ</div>
          <h1 style={{ fontSize: "clamp(60px,9vw,110px)", fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>
            <GoldText>النخبة</GoldText>
          </h1>
          <h2 style={{ fontSize: "clamp(18px,3vw,30px)", fontWeight: 300, color: C.paleGold, marginBottom: 20, letterSpacing: "0.08em" }}>
            لاستيراد السيارات
          </h2>
          <p style={{ fontSize: 15, color: C.steel, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.9 }}>
            من المزادات الأمريكية والعالمية إلى العراق
            <br />
            نقدم خدمة متكاملة بشفافية كاملة وتتبع لحظي
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={onGoLogin} size="lg" icon={<ChevronLeft size={18} />}>تتبع سيارتك</Btn>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn variant="outline" size="lg">تواصل معنا</Btn>
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: C.gold, marginBottom: 12 }}>OUR ADVANTAGES</div>
          <h3 style={{ fontSize: 36, fontWeight: 700 }}>مزايا التعامل مع <GoldText>النخبة</GoldText></h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
          {services.map((s, i) => (
            <Card key={i} hover style={{ padding: "28px 24px" }}>
              <div style={{ marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.ar}</div>
              <div style={{ fontSize: 13, color: C.steel, lineHeight: 1.7 }}>{s.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: "80px 40px", background: "rgba(26,26,31,0.4)", borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: C.gold, marginBottom: 12 }}>HOW IT WORKS</div>
            <h3 style={{ fontSize: 36, fontWeight: 700 }}>خطوات <GoldText>الاستيراد</GoldText></h3>
          </div>
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: 8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: "1 0 150px", textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 18, left: "55%", right: "-45%", height: 2, background: "rgba(201,168,76,0.25)" }} />
                )}
                <div
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: `linear-gradient(135deg,${C.gold},${C.paleGold})`,
                    color: C.obsidian, fontWeight: 900, fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px", position: "relative", zIndex: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "60px 40px 30px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 40 }}>
          <div style={{ maxWidth: 300 }}>
            <Logo />
            <p style={{ color: C.steel, marginTop: 16, lineHeight: 1.8, fontSize: 14 }}>
              شركة النخبة متخصصة في استيراد السيارات من المزادات الأمريكية والعالمية إلى العراق.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 16 }}>تواصل معنا</div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "#25D366", textDecoration: "none", fontSize: 14, marginBottom: 10 }}>
              <MessageCircle size={16} /> واتساب: +{WHATSAPP_NUMBER}
            </a>
            <div style={{ color: C.steel, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={14} /> info@nukhba-motors.iq
            </div>
            <div style={{ color: C.steel, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={14} /> بغداد، العراق
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: 20, textAlign: "center", color: C.steel, fontSize: 12 }}>
          © 2024 النخبة لاستيراد السيارات — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}

// =============================================
// صفحة تسجيل الدخول
// =============================================
function LoginPage({ auth, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [toast, setToast] = useState({});

  const handle = async () => {
    if (!email || !password) return setToast({ msg: "يرجى إدخال البريد وكلمة المرور", type: "error" });
    setBusy(true);
    if (mode === "login") {
      const res = await auth.signIn(email, password);
      if (res.error) setToast({ msg: res.error, type: "error" });
    } else {
      if (!fullName) { setBusy(false); return setToast({ msg: "يرجى إدخال الاسم الكامل", type: "error" }); }
      const res = await auth.signUp(email, password, fullName, phone);
      if (res.error) setToast({ msg: res.error, type: "error" });
      else { setToast({ msg: "تم إنشاء الحساب! يمكنك تسجيل الدخول الآن", type: "success" }); setMode("login"); }
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    setGoogleBusy(true);
    const res = await auth.signInWithGoogle();
    if (res.error) { setToast({ msg: res.error, type: "error" }); setGoogleBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.obsidian, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
      <style>{globalCSS}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", cursor: "pointer" }} onClick={onBack}>
            <Logo size="lg" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.pearl, marginTop: 22, marginBottom: 6 }}>
            {mode === "login" ? <>مرحبًا بك في <GoldText>النخبة</GoldText></> : <>إنشاء حساب <GoldText>جديد</GoldText></>}
          </h2>
          <p style={{ color: C.steel, fontSize: 13 }}>
            {mode === "login" ? "سجّل الدخول لمتابعة سيارتك" : "أنشئ حسابك للوصول إلى منصة التتبع"}
          </p>
        </div>

        <Card style={{ padding: 30 }}>
          <button
            onClick={handleGoogle}
            disabled={googleBusy}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, background: "#fff", color: "#1f1f1f", border: "none", borderRadius: 10,
              padding: "12px", fontWeight: 600, fontSize: 14, cursor: googleBusy ? "not-allowed" : "pointer",
              marginBottom: 20, opacity: googleBusy ? 0.7 : 1, fontFamily: FONT,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.2 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 35.9 44 30.4 44 24c0-1.4-.1-2.5-.4-3.5z" />
            </svg>
            {googleBusy ? "جارٍ التحويل..." : "الدخول بحساب Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
            <span style={{ fontSize: 12, color: C.steel }}>أو</span>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>

          {mode === "register" && <Input label="الاسم الكامل" value={fullName} onChange={setFullName} placeholder="محمد أحمد" required icon={<User size={16} />} />}
          <Input label="البريد الإلكتروني" value={email} onChange={setEmail} type="email" placeholder="example@email.com" required icon={<Mail size={16} />} ltr />
          {mode === "register" && <Input label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="+964 780 000 0000" icon={<Phone size={16} />} />}
          <Input label="كلمة المرور" value={password} onChange={setPassword} type="password" placeholder="••••••••" required icon={<Lock size={16} />} ltr />

          <Btn onClick={handle} disabled={busy} style={{ width: "100%", marginTop: 8 }} size="lg">
            {busy ? "جارٍ المعالجة..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Btn>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.steel }}>
            {mode === "login" ? (
              <>ليس لديك حساب؟ <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => setMode("register")}>إنشاء حساب</span></>
            ) : (
              <>لديك حساب؟ <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => setMode("login")}>تسجيل الدخول</span></>
            )}
          </div>
        </Card>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span style={{ fontSize: 13, color: C.steel, cursor: "pointer" }} onClick={onBack}>← العودة للرئيسية</span>
        </div>
      </div>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({})} />
    </div>
  );
}

// =============================================
// لوحة العميل
// =============================================
function ClientDashboard({ auth }) {
  const [tab, setTab] = useState("home");
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCar(); }, []);

  const loadCar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cars")
      .select("*, shipments(*), tracking_steps(*), car_images(*), car_videos(*), documents(*), notifications(*)")
      .eq("client_id", auth.session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCar(data);
    setLoading(false);
  };

  const tabs = [
    { id: "home", icon: <Home size={18} />, label: "الرئيسية" },
    { id: "tracking", icon: <MapPin size={18} />, label: "تتبع الشحنة" },
    { id: "gallery", icon: <ImageIcon size={18} />, label: "الصور والفيديو" },
    { id: "docs", icon: <FileText size={18} />, label: "المستندات" },
    { id: "notifications", icon: <Bell size={18} />, label: "الإشعارات" },
    { id: "contact", icon: <MessageCircle size={18} />, label: "تواصل معنا" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.obsidian, color: C.pearl, display: "flex", direction: "rtl", fontFamily: FONT }}>
      <style>{globalCSS}</style>

      {/* Sidebar */}
      <aside style={{ width: 230, background: "rgba(26,26,31,0.98)", borderLeft: "1px solid rgba(201,168,76,0.12)", display: "flex", flexDirection: "column", position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: "22px 18px", borderBottom: "1px solid rgba(201,168,76,0.12)" }}><Logo /></div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {tabs.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 12px", borderRadius: 10, border: "none",
                background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
                color: tab === t.id ? C.gold : C.steel, cursor: "pointer", fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400, marginBottom: 3, fontFamily: FONT,
                textAlign: "right", transition: "all 0.2s",
              }}
            >
              {t.icon}<span style={{ flex: 1 }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 3, height: 18, background: C.gold, borderRadius: 2 }} />}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.paleGold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.obsidian, flexShrink: 0 }}>
              {(auth.profile?.full_name || "؟")[0]}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auth.profile?.full_name}</div>
              <div style={{ fontSize: 11, color: C.steel }}>عميل</div>
            </div>
          </div>
          <Btn variant="danger" onClick={auth.signOut} style={{ width: "100%" }} size="sm" icon={<LogOut size={14} />}>تسجيل الخروج</Btn>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginRight: 230, padding: "28px 24px", overflowY: "auto" }}>
        {loading ? (
          <Spinner label="جارٍ تحميل بياناتك..." />
        ) : !car ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Car size={56} color={C.steel} style={{ marginBottom: 18 }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>لا توجد سيارات حالياً</h3>
            <p style={{ color: C.steel }}>تواصل مع الشركة لإضافة سيارتك إلى حسابك</p>
          </div>
        ) : (
          <>
            {tab === "home" && <ClientHome car={car} profile={auth.profile} />}
            {tab === "tracking" && <ClientTracking car={car} />}
            {tab === "gallery" && <ClientGallery car={car} />}
            {tab === "docs" && <ClientDocs car={car} />}
            {tab === "notifications" && <ClientNotifications car={car} />}
            {tab === "contact" && <ClientContact car={car} />}
          </>
        )}
      </main>
    </div>
  );
}

function ClientHome({ car, profile }) {
  const progress = Math.round((car.current_status / 11) * 100);
  const step = TRACKING_STEPS[car.current_status - 1];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: C.steel }}>أهلاً،</p>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>{profile?.full_name} <Sparkles size={20} color={C.gold} style={{ display: "inline" }} /></h1>
      </div>

      <Card style={{ marginBottom: 24, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Badge color={C.gold}>{step?.ar}</Badge>
          <span style={{ fontSize: 12, color: C.steel }}>{car.order_number}</span>
        </div>
        <div style={{ display: "flex", gap: 22, padding: 22, flexWrap: "wrap" }}>
          {car.main_image_url ? (
            <img src={car.main_image_url} alt="car" style={{ width: 220, height: 145, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(201,168,76,0.2)", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 220, height: 145, borderRadius: 12, border: "1px solid rgba(201,168,76,0.2)", background: "rgba(42,42,50,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Car size={44} color={C.steel} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{car.car_name}</h2>
            <p style={{ fontSize: 12, color: C.steel, marginBottom: 2 }}>الموديل: {car.model} | السنة: {car.year}</p>
            <p style={{ fontSize: 12, color: C.steel, marginBottom: 2 }}>VIN: {car.vin}</p>
            <p style={{ fontSize: 12, color: C.steel, marginBottom: 18 }}>اللون: {car.color}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["تاريخ الشراء", car.purchase_date], ["الوصول المتوقع", car.estimated_arrival]].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(42,42,50,0.5)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: C.steel, marginBottom: 3 }}>{k}</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>المرحلة {car.current_status} من 11</span>
            <span style={{ fontSize: 12, color: C.steel }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(42,42,50,0.8)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(to left,${C.gold},${C.paleGold})`, borderRadius: 4, transition: "width 1s ease", boxShadow: "0 0 10px rgba(201,168,76,0.4)" }} />
          </div>
        </div>
      </Card>

      <Card style={{ padding: 22 }}>
        <p style={{ fontSize: 13, color: C.gold, marginBottom: 16 }}>المواصفات</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 14 }}>
          {[["المحرك", car.engine], ["الدفع", car.drive_type], ["ناقل الحركة", car.transmission], ["المسافة", car.mileage]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", paddingBottom: 10 }}>
              <p style={{ fontSize: 10, color: C.steel, marginBottom: 4 }}>{k}</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ClientTracking({ car }) {
  const shipment = car.shipments?.[0];
  const steps = car.tracking_steps || [];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>تتبع <GoldText>الشحنة</GoldText></h2>

      <Card style={{ padding: 22, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: C.gold, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={16} /> الموقع الحالي
        </p>
        <LiveMap lat={shipment?.current_lat || 25} lng={shipment?.current_lng || 55} />
        {shipment && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14, marginTop: 18 }}>
            {[["شركة الشحن", shipment.shipping_line], ["رقم الحاوية", shipment.container_number], ["ميناء المصدر", shipment.origin_port], ["ميناء الوصول", shipment.destination_port]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 10, color: C.steel, marginBottom: 4 }}>{k}</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ padding: 28 }}>
        <p style={{ fontSize: 13, color: C.gold, marginBottom: 24 }}>مراحل الشحنة</p>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", right: 19, top: 0, bottom: 0, width: 2, background: "rgba(201,168,76,0.12)" }} />
          {TRACKING_STEPS.map((ts, i) => {
            const dbStep = steps.find((s) => s.step_number === ts.num);
            const done = dbStep?.completed || car.current_status > ts.num;
            const active = ts.num === car.current_status;
            return (
              <div key={i} style={{ display: "flex", gap: 18, marginBottom: 26 }}>
                <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
                  <div
                    className={active ? "pulse-dot" : ""}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: done ? `linear-gradient(135deg,${C.gold},${C.paleGold})` : active ? "rgba(201,168,76,0.15)" : "rgba(42,42,50,0.8)",
                      border: active ? `2px solid ${C.gold}` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      color: done ? C.obsidian : C.pearl, transition: "all 0.3s",
                    }}
                  >
                    {done ? <Check size={18} /> : ts.icon}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: done || active ? 600 : 400, color: active ? C.gold : done ? C.pearl : C.steel }}>{ts.ar}</p>
                    {dbStep?.completed_at && <p style={{ fontSize: 11, color: C.steel, flexShrink: 0 }}>{new Date(dbStep.completed_at).toLocaleDateString("ar-IQ")}</p>}
                  </div>
                  {dbStep?.notes && <p style={{ fontSize: 12, color: C.steel, marginTop: 4 }}>{dbStep.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ClientGallery({ car }) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const images = car.car_images || [];
  const videos = car.car_videos || [];
  const stageLabels = { auction: "المزاد", post_purchase: "بعد الشراء", transit: "أثناء النقل", port: "الميناء", loading: "التحميل", arrival: "الوصول", other: "أخرى" };
  const filters = [["all", "الكل"], ...Object.entries(stageLabels)];
  const filtered = filter === "all" ? images : images.filter((i) => i.stage === filter);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>الصور <GoldText>والفيديو</GoldText></h2>

      {videos.length > 0 && (
        <Card style={{ padding: 22, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: C.gold, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <VideoIcon size={16} /> فيديوهات السيارة
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {videos.map((v, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(201,168,76,0.15)" }}>
                <video controls style={{ width: "100%", display: "block", maxHeight: 200, background: "#000" }} poster={v.thumbnail_url || undefined}>
                  <source src={v.url} />
                </video>
                {v.title && <p style={{ padding: "10px 14px", fontSize: 13, color: C.steel }}>{v.title}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {filters.map(([k, v]) => (
            <button
              key={k} onClick={() => setFilter(k)}
              style={{
                background: filter === k ? `linear-gradient(135deg,${C.gold},${C.paleGold})` : "rgba(42,42,50,0.8)",
                color: filter === k ? C.obsidian : C.steel, border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 12,
                fontWeight: filter === k ? 700 : 400, fontFamily: FONT,
              }}
            >
              {v}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px 0", color: C.steel }}>لا توجد صور</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {filtered.map((img, i) => (
              <Card key={i} hover onClick={() => setLightbox(img.url)} style={{ overflow: "hidden", position: "relative" }}>
                <img src={img.url} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top,rgba(10,10,11,0.9),transparent)", padding: "20px 12px 10px" }}>
                  <span style={{ fontSize: 11, color: C.gold }}>{stageLabels[img.stage] || img.stage_ar}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {lightbox && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: "90%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, left: 20, background: "rgba(42,42,50,0.8)", border: "none", color: C.pearl, borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function ClientDocs({ car }) {
  const docs = car.documents || [];
  const typeLabels = { invoice: "فاتورة الشراء", bill_of_lading: "بوليصة الشحن", inspection: "تقرير الفحص", damage: "تقرير الأضرار", clearance: "مستندات التخليص", title: "هوية المالك", other: "ملفات أخرى" };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>المستندات <GoldText>والوثائق</GoldText></h2>
      {docs.length === 0 ? (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <FileText size={40} color={C.steel} style={{ marginBottom: 16 }} />
          <p style={{ color: C.steel }}>لا توجد مستندات حالياً</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
          {docs.map((d, i) => (
            <Card key={i} hover style={{ padding: 22, textAlign: "center" }}>
              <FileText size={36} color={C.gold} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{d.name_ar || typeLabels[d.doc_type] || d.name}</p>
              {d.file_size && <p style={{ fontSize: 11, color: C.steel, marginBottom: 16 }}>PDF · {d.file_size}</p>}
              <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Btn size="sm" style={{ width: "100%" }} icon={<Download size={14} />}>تحميل</Btn>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientNotifications({ car }) {
  const [notifs, setNotifs] = useState(car.notifications || []);
  const markRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>الإشعارات <GoldText>والتنبيهات</GoldText></h2>
      {notifs.length === 0 ? (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <Bell size={40} color={C.steel} style={{ marginBottom: 16 }} />
          <p style={{ color: C.steel }}>لا توجد إشعارات</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifs.map((n, i) => (
            <div
              key={i} onClick={() => !n.read && markRead(n.id)}
              style={{
                background: n.read ? "rgba(26,26,31,0.6)" : "rgba(201,168,76,0.05)",
                border: `1px solid ${n.read ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.3)"}`,
                borderRadius: 14, padding: "16px 20px", display: "flex", gap: 16,
                cursor: n.read ? "default" : "pointer", transition: "all 0.2s",
              }}
            >
              <Bell size={20} color={C.gold} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, marginBottom: 4 }}>{n.title}</p>
                <p style={{ fontSize: 13, color: C.steel, marginBottom: 4 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: C.steel }}>{new Date(n.created_at).toLocaleString("ar-IQ")}</p>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 6 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientContact({ car }) {
  const msg = `مرحبا، أتواصل بخصوص الطلب ${car.order_number} - السيارة: ${car.car_name}`;
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>التواصل <GoldText>معنا</GoldText></h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 28 }}>
          <MessageCircle size={36} color="#25D366" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>واتساب المباشر</h3>
          <p style={{ color: C.steel, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>تواصل مباشرة مع موظف الشركة. رقم طلبك سيُرفق تلقائياً.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <Btn variant="success" style={{ width: "100%" }} icon={<MessageCircle size={16} />}>فتح واتساب</Btn>
          </a>
        </Card>
        <Card style={{ padding: 28 }}>
          <Mail size={36} color={C.gold} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>البريد الإلكتروني</h3>
          <p style={{ color: C.steel, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>للاستفسارات الرسمية والمراسلات المكتوبة.</p>
          <a href={`mailto:info@nukhba-motors.iq?subject=${encodeURIComponent(`استفسار - ${car.order_number}`)}`} style={{ textDecoration: "none", display: "block" }}>
            <Btn style={{ width: "100%" }} icon={<Mail size={16} />}>إرسال بريد</Btn>
          </a>
        </Card>
      </div>
    </div>
  );
}

// =============================================
// لوحة الإدارة
// =============================================
function AdminDashboard({ auth }) {
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState({});

  const tabs = [
    { id: "overview", icon: <Home size={18} />, label: "الرئيسية" },
    { id: "orders", icon: <FileText size={18} />, label: "الطلبات" },
    { id: "clients", icon: <Users size={18} />, label: "العملاء" },
    { id: "add_car", icon: <Plus size={18} />, label: "إضافة سيارة" },
    { id: "import", icon: <FileSpreadsheet size={18} />, label: "استيراد Excel" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.obsidian, color: C.pearl, display: "flex", direction: "rtl", fontFamily: FONT }}>
      <style>{globalCSS}</style>
      <aside style={{ width: 210, background: "rgba(26,26,31,0.98)", borderLeft: "1px solid rgba(201,168,76,0.12)", display: "flex", flexDirection: "column", position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
          <Logo />
          <div style={{ marginTop: 10, fontSize: 10, color: C.gold, background: "rgba(201,168,76,0.1)", borderRadius: 6, padding: "4px 8px", textAlign: "center", letterSpacing: "0.08em" }}>لوحة الإدارة</div>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {tabs.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, border: "none",
                background: tab === t.id ? "rgba(201,168,76,0.1)" : "transparent",
                color: tab === t.id ? C.gold : C.steel, cursor: "pointer", fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400, marginBottom: 2, fontFamily: FONT,
                textAlign: "right", transition: "all 0.2s",
              }}
            >
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <Btn variant="danger" onClick={auth.signOut} style={{ width: "100%" }} size="sm" icon={<LogOut size={14} />}>تسجيل الخروج</Btn>
        </div>
      </aside>

      <main style={{ flex: 1, marginRight: 210, padding: "28px 24px", overflowY: "auto" }}>
        {tab === "overview" && <AdminOverview />}
        {tab === "orders" && <AdminOrders setToast={setToast} />}
        {tab === "clients" && <AdminClients />}
        {tab === "add_car" && <AdminAddCar setToast={setToast} />}
        {tab === "import" && <AdminImport setToast={setToast} />}
      </main>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({})} />
    </div>
  );
}

function AdminOverview() {
  const [cars, setCars] = useState([]);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    supabase.from("cars").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(10).then(({ data }) => data && setCars(data));
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client").then(({ count }) => setClientCount(count || 0));
  }, []);

  const stats = [
    { label: "إجمالي السيارات", val: cars.length, icon: <Car size={22} />, color: C.gold },
    { label: "عدد العملاء", val: clientCount, icon: <Users size={22} />, color: C.info },
    { label: "في عرض البحر", val: cars.filter((c) => c.current_status >= 6 && c.current_status <= 8).length, icon: <span style={{ fontSize: 22 }}>🌊</span>, color: C.info },
    { label: "تم التسليم", val: cars.filter((c) => c.current_status === 11).length, icon: <Check size={22} />, color: C.success },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>لوحة <GoldText>الإدارة</GoldText></h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: "20px 22px" }}>
            <div style={{ marginBottom: 8, color: s.color }}>{s.icon}</div>
            <p style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.val}</p>
            <p style={{ fontSize: 12, color: C.steel, marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>
      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(201,168,76,0.1)", fontSize: 14, fontWeight: 600 }}>آخر الطلبات</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.08)", background: "rgba(42,42,50,0.3)" }}>
              {["رقم الطلب", "العميل", "السيارة", "الحالة", "التاريخ"].map((h) => (
                <th key={h} style={{ padding: "12px 18px", textAlign: "right", fontSize: 11, color: C.steel, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((c, i) => {
              const step = TRACKING_STEPS[c.current_status - 1];
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                  <td style={{ padding: "13px 18px", fontSize: 13, color: C.gold, fontWeight: 600 }}>{c.order_number}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13 }}>{c.profiles?.full_name || "—"}</td>
                  <td style={{ padding: "13px 18px", fontSize: 13 }}>{c.car_name}</td>
                  <td style={{ padding: "13px 18px" }}><Badge color={C.gold}>{step?.ar}</Badge></td>
                  <td style={{ padding: "13px 18px", fontSize: 12, color: C.steel }}>{c.purchase_date || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminOrders({ setToast }) {
  const [cars, setCars] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);
  const load = () => {
    supabase.from("cars").select("*, profiles(full_name,phone), shipments(*)").order("created_at", { ascending: false }).then(({ data }) => data && setCars(data));
  };

  const updateStatus = async (id, status) => {
    await supabase.from("cars").update({ current_status: status }).eq("id", id);
    await supabase.from("tracking_steps").update({ completed: true, completed_at: new Date().toISOString() }).eq("car_id", id).eq("step_number", status);
    setCars((c) => c.map((x) => (x.id === id ? { ...x, current_status: status } : x)));
    setToast({ msg: "تم تحديث الحالة", type: "success" });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>إدارة <GoldText>الطلبات</GoldText></h2>
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.12)", background: "rgba(42,42,50,0.3)" }}>
              {["رقم الطلب", "العميل", "السيارة", "الحالة", "تعديل الحالة", "إجراءات"].map((h) => (
                <th key={h} style={{ padding: "13px 16px", textAlign: "right", fontSize: 11, color: C.steel, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.gold, fontWeight: 600 }}>{c.order_number}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.profiles?.full_name}<br /><span style={{ fontSize: 11, color: C.steel }}>{c.profiles?.phone}</span></td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{c.car_name} {c.year}</td>
                <td style={{ padding: "12px 16px" }}><Badge color={C.gold}>{TRACKING_STEPS[c.current_status - 1]?.ar}</Badge></td>
                <td style={{ padding: "12px 16px" }}>
                  <select value={c.current_status} onChange={(e) => updateStatus(c.id, parseInt(e.target.value))} style={{ background: "rgba(42,42,50,0.9)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "6px 10px", color: C.pearl, fontSize: 12, cursor: "pointer", fontFamily: FONT }}>
                    {TRACKING_STEPS.map((s) => <option key={s.num} value={s.num}>{s.ar}</option>)}
                  </select>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Btn size="sm" variant="ghost" onClick={() => setSelected(c)}>تفاصيل</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {selected && <CarModal car={selected} onClose={() => { setSelected(null); load(); }} setToast={setToast} />}
    </div>
  );
}

function CarModal({ car, onClose, setToast }) {
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("auction");
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [lat, setLat] = useState(car.shipments?.[0]?.current_lat?.toString() || "");
  const [lng, setLng] = useState(car.shipments?.[0]?.current_lng?.toString() || "");
  const [stepNote, setStepNote] = useState("");

  const upload = async (bucket, file, table, extra) => {
    setUploading(true);
    const path = `${car.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) { setToast({ msg: "خطأ في الرفع: " + error.message, type: "error" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from(table).insert({ car_id: car.id, url: publicUrl, ...extra });
    setToast({ msg: "تم الرفع بنجاح!", type: "success" });
    setUploading(false);
  };

  const updateLocation = async () => {
    if (!lat || !lng) return;
    const existing = car.shipments?.[0];
    if (existing) await supabase.from("shipments").update({ current_lat: parseFloat(lat), current_lng: parseFloat(lng) }).eq("id", existing.id);
    else await supabase.from("shipments").insert({ car_id: car.id, current_lat: parseFloat(lat), current_lng: parseFloat(lng) });
    setToast({ msg: "تم تحديث الموقع", type: "success" });
  };

  const sendNotif = async () => {
    if (!notifTitle || !notifMsg) return setToast({ msg: "أدخل العنوان والنص", type: "error" });
    await supabase.from("notifications").insert({ client_id: car.client_id, car_id: car.id, title: notifTitle, message: notifMsg, type: "update" });
    setToast({ msg: "تم إرسال الإشعار", type: "success" });
    setNotifTitle(""); setNotifMsg("");
  };

  const addNote = async () => {
    if (!stepNote) return;
    await supabase.from("tracking_steps").update({ notes: stepNote }).eq("car_id", car.id).eq("step_number", car.current_status);
    setToast({ msg: "تم حفظ الملاحظة", type: "success" });
    setStepNote("");
  };

  return (
    <Modal open={true} onClose={onClose} title={`${car.car_name} — ${car.order_number}`}>
      <Section title="تحديث الموقع الجغرافي" icon={<MapPin size={16} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="خط العرض (Lat)" value={lat} onChange={setLat} placeholder="29.9691" ltr />
          <Input label="خط الطول (Lng)" value={lng} onChange={setLng} placeholder="47.8162" ltr />
        </div>
        <Btn onClick={updateLocation} size="sm">تحديث الموقع</Btn>
      </Section>

      <Section title="ملاحظة على المرحلة الحالية" icon={<MessageCircle size={16} />}>
        <Input label="الملاحظة" value={stepNote} onChange={setStepNote} placeholder="تم استلام السيارة من المزاد..." />
        <Btn onClick={addNote} size="sm">حفظ الملاحظة</Btn>
      </Section>

      <Section title="رفع صورة" icon={<ImageIcon size={16} />}>
        <Select value={stage} onChange={setStage} options={[["auction", "المزاد"], ["post_purchase", "بعد الشراء"], ["transit", "أثناء النقل"], ["port", "الميناء"], ["loading", "التحميل"], ["arrival", "عند الوصول"]]} />
        <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload("car-images", f, "car_images", { stage, stage_ar: stage }); }} style={{ color: C.pearl, fontSize: 13, display: "block", marginBottom: 8 }} />
        {uploading && <p style={{ color: C.gold, fontSize: 12 }}>جارٍ الرفع...</p>}
      </Section>

      <Section title="رفع فيديو" icon={<VideoIcon size={16} />}>
        <input type="file" accept="video/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload("car-videos", f, "car_videos", { stage }); }} style={{ color: C.pearl, fontSize: 13, display: "block" }} />
      </Section>

      <Section title="رفع مستند" icon={<FileText size={16} />}>
        <Input label="اسم المستند" value={docName} onChange={setDocName} placeholder="فاتورة الشراء" />
        <Select value={docType} onChange={setDocType} options={[["invoice", "فاتورة الشراء"], ["bill_of_lading", "بوليصة الشحن"], ["inspection", "تقرير الفحص"], ["damage", "تقرير الأضرار"], ["clearance", "مستندات التخليص"], ["other", "أخرى"]]} />
        <input type="file" accept=".pdf,.doc,.docx" disabled={uploading || !docName} onChange={(e) => { const f = e.target.files?.[0]; if (f && docName) upload("documents", f, "documents", { name: f.name, name_ar: docName, doc_type: docType, file_size: `${Math.round(f.size / 1024)} KB` }); }} style={{ color: C.pearl, fontSize: 13, display: "block" }} />
      </Section>

      <Section title="إرسال إشعار للعميل" icon={<Bell size={16} />}>
        <Input label="عنوان الإشعار" value={notifTitle} onChange={setNotifTitle} placeholder="تحديث حالة السيارة" />
        <Input label="نص الإشعار" value={notifMsg} onChange={setNotifMsg} placeholder="تم تحديث حالة سيارتك..." />
        <Btn onClick={sendNotif} size="sm" icon={<Send size={14} />}>إرسال الإشعار</Btn>
      </Section>
    </Modal>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
      <p style={{ fontSize: 13, color: C.gold, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>{icon}{title}</p>
      {children}
    </div>
  );
}

function AdminClients() {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    supabase.from("profiles").select("*, cars(id)").eq("role", "client").order("created_at", { ascending: false }).then(({ data }) => data && setClients(data));
  }, []);
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>إدارة <GoldText>العملاء</GoldText></h2>
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", background: "rgba(42,42,50,0.3)" }}>
              {["الاسم", "الهاتف", "عدد السيارات", "تاريخ التسجيل"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, color: C.steel }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{c.full_name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.steel }}>{c.phone || "—"}</td>
                <td style={{ padding: "12px 16px" }}><Badge color={C.gold}>{c.cars?.length || 0} سيارة</Badge></td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.steel }}>{c.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AdminAddCar({ setToast }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ client_id: "", car_name: "", model: "", year: "", color: "", vin: "", engine: "", drive_type: "", transmission: "", mileage: "", order_number: "", purchase_date: "", estimated_arrival: "" });
  const [loading, setLoading] = useState(false);
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from("profiles").select("id,full_name").eq("role", "client").then(({ data }) => data && setClients(data));
  }, []);

  const submit = async () => {
    if (!form.client_id || !form.car_name || !form.order_number) return setToast({ msg: "يرجى ملء الحقول المطلوبة", type: "error" });
    setLoading(true);
    const { data, error } = await supabase.from("cars").insert({ ...form, year: parseInt(form.year) || null, current_status: 1 }).select().single();
    if (error) { setToast({ msg: error.message, type: "error" }); setLoading(false); return; }
    if (data) {
      await supabase.from("tracking_steps").insert(TRACKING_STEPS.map((s) => ({ car_id: data.id, step_number: s.num, step_name_ar: s.ar, step_name_en: s.en, completed: false })));
      setToast({ msg: "تم إضافة السيارة بنجاح!", type: "success" });
      setForm({ client_id: "", car_name: "", model: "", year: "", color: "", vin: "", engine: "", drive_type: "", transmission: "", mileage: "", order_number: "", purchase_date: "", estimated_arrival: "" });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>إضافة <GoldText>سيارة جديدة</GoldText></h2>
      <Card style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="العميل *" value={form.client_id} onChange={(v) => sf("client_id", v)} options={[["", "اختر العميل"], ...clients.map((c) => [c.id, c.full_name])]} />
          <Input label="رقم الطلب *" value={form.order_number} onChange={(v) => sf("order_number", v)} placeholder="#EM-2024-0001" />
          <Input label="اسم السيارة *" value={form.car_name} onChange={(v) => sf("car_name", v)} placeholder="BMW X5" />
          <Input label="الموديل" value={form.model} onChange={(v) => sf("model", v)} placeholder="X5" />
          <Input label="سنة الصنع" value={form.year} onChange={(v) => sf("year", v)} placeholder="2021" />
          <Input label="اللون" value={form.color} onChange={(v) => sf("color", v)} placeholder="أسود" />
          <Input label="رقم الهيكل VIN" value={form.vin} onChange={(v) => sf("vin", v)} placeholder="5UXCR6C0XM..." ltr />
          <Input label="المحرك" value={form.engine} onChange={(v) => sf("engine", v)} placeholder="3.0L" />
          <Input label="نوع الدفع" value={form.drive_type} onChange={(v) => sf("drive_type", v)} placeholder="AWD" />
          <Input label="ناقل الحركة" value={form.transmission} onChange={(v) => sf("transmission", v)} placeholder="أوتوماتيك" />
          <Input label="المسافة المقطوعة" value={form.mileage} onChange={(v) => sf("mileage", v)} placeholder="35,000" />
          <Input label="تاريخ الشراء" value={form.purchase_date} onChange={(v) => sf("purchase_date", v)} type="date" ltr />
          <Input label="الوصول المتوقع" value={form.estimated_arrival} onChange={(v) => sf("estimated_arrival", v)} type="date" ltr />
        </div>
        <Btn onClick={submit} disabled={loading} size="lg" style={{ marginTop: 8 }} icon={<Plus size={18} />}>
          {loading ? "جارٍ الحفظ..." : "إضافة السيارة"}
        </Btn>
      </Card>
    </div>
  );
}

function AdminImport({ setToast }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("id,full_name").eq("role", "client").then(({ data }) => data && setClients(data));
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setRows(XLSX.utils.sheet_to_json(ws, { defval: "" }));
    };
    reader.readAsBinaryString(file);
  };

  const importAll = async () => {
    if (!clientId || rows.length === 0) return setToast({ msg: "اختر العميل والملف", type: "error" });
    setLoading(true);
    let ok = 0;
    for (const row of rows) {
      const { data } = await supabase.from("cars").insert({
        client_id: clientId,
        order_number: row["رقم الطلب"] || row["order_number"] || `#EM-${Date.now()}`,
        car_name: row["اسم السيارة"] || row["car_name"] || "غير محدد",
        model: row["الموديل"] || row["model"] || "",
        year: parseInt(row["السنة"] || row["year"]) || null,
        color: row["اللون"] || row["color"] || "",
        vin: row["VIN"] || row["vin"] || "",
        engine: row["المحرك"] || row["engine"] || "",
        purchase_date: row["تاريخ الشراء"] || row["purchase_date"] || null,
        estimated_arrival: row["الوصول المتوقع"] || row["estimated_arrival"] || null,
        current_status: 1,
      }).select().single();
      if (data) {
        await supabase.from("tracking_steps").insert(TRACKING_STEPS.map((s) => ({ car_id: data.id, step_number: s.num, step_name_ar: s.ar, step_name_en: s.en, completed: false })));
        ok++;
      }
    }
    setToast({ msg: `تم استيراد ${ok} سيارة!`, type: "success" });
    setLoading(false); setRows([]);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>استيراد من <GoldText>Excel</GoldText></h2>
      <Card style={{ padding: 28 }}>
        <p style={{ fontSize: 13, color: C.steel, marginBottom: 16 }}>
          الأعمدة المطلوبة: <span style={{ color: C.gold }}>رقم الطلب, اسم السيارة, الموديل, السنة, اللون, VIN, المحرك, تاريخ الشراء, الوصول المتوقع</span>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Select label="اختر العميل *" value={clientId} onChange={setClientId} options={[["", "اختر العميل"], ...clients.map((c) => [c.id, c.full_name])]} />
          <div>
            <label style={{ display: "block", fontSize: 12, color: C.steel, marginBottom: 6 }}>ملف Excel / CSV *</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ color: C.pearl, fontSize: 13, paddingTop: 10 }} />
          </div>
        </div>
        {rows.length > 0 && (
          <div>
            <p style={{ fontSize: 13, color: C.gold, marginBottom: 12 }}>معاينة: {rows.length} سجل</p>
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "rgba(42,42,50,0.5)" }}>
                    {Object.keys(rows[0]).map((k) => <th key={k} style={{ padding: "7px 12px", textAlign: "right", color: C.steel, borderBottom: "1px solid rgba(201,168,76,0.1)", whiteSpace: "nowrap" }}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
                      {Object.values(r).map((v, j) => <td key={j} style={{ padding: "7px 12px", color: C.pearl, whiteSpace: "nowrap" }}>{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn onClick={importAll} disabled={loading} size="lg" icon={<Upload size={16} />}>
              {loading ? "جارٍ الاستيراد..." : `استيراد ${rows.length} سيارة`}
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

// =============================================
// CSS عام
// =============================================
const globalCSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${C.obsidian}; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.5); } 50% { box-shadow: 0 0 0 8px rgba(201,168,76,0); } }
  .pulse-dot { animation: pulse-ring 2s ease-in-out infinite; }
  input:focus, select:focus { border-color: rgba(201,168,76,0.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  .leaflet-container { background: #1A1A1F !important; }
`;

// =============================================
// التطبيق الجذر
// =============================================
export default function NukhbaApp() {
  const [page, setPage] = useState("home");
  const auth = useNukhbaAuth();

  useEffect(() => {
    if (auth.session && auth.profile) {
      if (auth.profile.role === "admin" || auth.profile.role === "employee") setPage("admin");
      else setPage("client");
    } else if (!auth.loading && !auth.session) {
      if (page === "client" || page === "admin") setPage("home");
    }
  }, [auth.session, auth.profile, auth.loading]);

  if (auth.loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.obsidian, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <style>{globalCSS}</style>
        <Spinner label="جارٍ التحميل..." />
      </div>
    );
  }

  return (
    <>
      {page === "home" && <HomePage onGoLogin={() => setPage("login")} />}
      {page === "login" && <LoginPage auth={auth} onBack={() => setPage("home")} />}
      {page === "client" && auth.session && <ClientDashboard auth={auth} />}
      {page === "admin" && auth.session && <AdminDashboard auth={auth} />}
    </>
  );
}
