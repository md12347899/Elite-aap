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
import { supabase, WHATSAPP_NUMBER, TRACKING_STEPS, siteOrigin } from "./supabaseClient";

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
   مصادقة — مع إصلاح جذري لخطأ Google OAuth ("requested path is invalid")
   السبب الشائع: redirectTo لازم يطابق رابط مسجّل بالضبط في
   Supabase → Authentication → URL Configuration → Redirect URLs
   هنا نستخدم origin الفعلي للموقع المنشور تلقائياً، ونمنع أي trailing slash مزدوج.
   ===================================================================== */
function useNukhbaAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // التقاط أي خطأ OAuth يرجع بالـ URL (Supabase يضيفه كـ query/hash params)
    const url = new URL(window.location.href);
    const errDesc = url.searchParams.get("error_description") || url.hash.match(/error_description=([^&]+)/)?.[1];
    if (errDesc) {
      setAuthError(decodeURIComponent(errDesc.replace(/\+/g, " ")));
      window.history.replaceState({}, "", window.location.pathname);
    }

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
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!data && !error) {
      // الـ trigger ما اشتغل (سيناريو نادر) — ننشئ profile يدوياً كحل احتياطي
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData?.user?.user_metadata || {};
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: userId, full_name: meta.full_name || userData?.user?.email?.split("@")[0] || "عميل", role: "client" })
        .select()
        .maybeSingle();
      setProfile(created || null);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  };

  const signInWithGoogle = async () => {
    // أهم سطر بكل ملف المصادقة: redirectTo يطابق origin الفعلي بدون أي مسار إضافي
    const redirectTo = siteOrigin().replace(/\/+$/, "");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    return error ? { error: error.message } : {};
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: siteOrigin().replace(/\/+$/, ""),
      },
    });
    if (error) return { error: error.message };
    if (data?.user && !data?.session) return { success: true, needsConfirmation: true };
    return { success: true };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return { session, profile, loading, authError, clearAuthError: () => setAuthError(null), signIn, signInWithGoogle, signUp, signOut };
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
          <h2 style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 300, color: "rgba(251,246,236,0.75)", marginBottom: 18, letterSpacing: "0.06em" }}>
            لاستيراد السيارات من المزادات الأمريكية إلى العراق
          </h2>
          <p style={{ fontSize: 15, color: "rgba(251,246,236,0.55)", maxWidth: 460, margin: "0 auto 40px", lineHeight: 2 }}>
            تتبّع سيارتك في كل مرحلة — من قاعة المزاد حتى بابك
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={onGoLogin} variant="rust" size="lg" icon={<ChevronLeft size={18} />}>
              تتبّع سيارتك
            </Btn>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn variant="outline" size="lg" style={{ color: C.paper, borderColor: "rgba(251,246,236,0.3)" }}>
                تواصل معنا
              </Btn>
            </a>
          </div>
        </div>
      </section>

      {/* المزايا */}
      <section style={{ padding: "90px 40px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.28em", color: C.rust, marginBottom: 12, fontWeight: 700, textTransform: "uppercase" }}>لماذا النخبة</div>
          <h3 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY }}>
            خدمة تستحق الثقة
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
          {services.map((s, i) => (
            <Card key={i} hover style={{ padding: "30px 26px" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `rgba(181,86,46,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.8 }}>{s.body}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* خطوات الاستيراد */}
      <section style={{ padding: "70px 40px", background: C.navy }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.28em", color: `rgba(181,86,46,0.9)`, marginBottom: 12, fontWeight: 700, textTransform: "uppercase" }}>كيف نعمل</div>
            <h3 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: C.paper, fontFamily: FONT_DISPLAY }}>
              خطوات الاستيراد
            </h3>
          </div>
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: 8, gap: 0 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: "1 0 140px", textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 19, left: "55%", right: "-45%", height: 1, background: "rgba(251,246,236,0.15)" }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: i === 0 ? C.rust : "rgba(251,246,236,0.1)",
                  border: `2px solid ${i === 0 ? C.rust : "rgba(251,246,236,0.2)"}`,
                  color: C.paper, fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", position: "relative", zIndex: 1,
                }}>{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(251,246,236,0.85)", lineHeight: 1.4 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* إحصائيات */}
      <section style={{ padding: "80px 40px", background: C.sand }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 40, textAlign: "center" }}>
          {[["٥٠٠+", "سيارة مستوردة"], ["٩٨٪", "رضا العملاء"], ["٣٠+", "يوم وصول متوسط"], ["٢٤/٧", "دعم العملاء"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* تذييل */}
      <footer style={{ padding: "56px 40px 28px", background: C.paper, borderTop: `1px solid ${C.sand}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 36, marginBottom: 40 }}>
          <div style={{ maxWidth: 300 }}>
            <Logo />
            <p style={{ color: C.inkSoft, marginTop: 16, lineHeight: 1.9, fontSize: 14 }}>
              النخبة — منصة تتبع خاصة بعملاء استيراد السيارات من المزادات الأمريكية إلى العراق.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 18 }}>تواصل معنا</div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{ display: "flex", alignItems: "center", gap: 9, color: "#25D366", textDecoration: "none", fontSize: 14, marginBottom: 12 }}>
              <MessageCircle size={16} /> واتساب: +964 780 000 0000
            </a>
            <div style={{ color: C.inkSoft, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 9 }}>
              <Mail size={14} color={C.inkSoft} /> info@nukhba-motors.iq
            </div>
            <div style={{ color: C.inkSoft, fontSize: 14, display: "flex", alignItems: "center", gap: 9 }}>
              <MapPin size={14} color={C.inkSoft} /> بغداد، العراق
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.sand}`, paddingTop: 20, textAlign: "center", color: C.inkSoft, fontSize: 12.5 }}>
          © 2024 النخبة لاستيراد السيارات — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}

/* =====================================================================
   صفحة تسجيل الدخول — مع ترجمة الأخطاء وإصلاح Google
   ===================================================================== */
const ERR_MAP = [
  [/already registered|already exists|user already/i, "هذا البريد مسجّل مسبقاً، جرّب تسجيل الدخول"],
  [/password.*6|at least 6/i, "كلمة المرور يجب أن تكون ٦ أحرف على الأقل"],
  [/invalid login|invalid email or password|email not confirmed/i, "البريد أو كلمة المرور غير صحيحة، أو البريد لم يُؤكَّد بعد"],
  [/database error|error saving new user/i, "خطأ بقاعدة البيانات — تأكد من تشغيل ملف schema.sql كاملاً في Supabase"],
  [/rate limit/i, "محاولات كثيرة، انتظر دقيقة ثم حاول"],
  [/requested path is invalid/i, "خطأ في إعداد Google OAuth — راجع تعليمات الإعداد بالـ README"],
  [/network/i, "تحقق من اتصالك بالإنترنت"],
];
const xlateErr = (msg) => {
  if (!msg) return "حدث خطأ غير متوقع";
  for (const [re, ar] of ERR_MAP) if (re.test(msg)) return ar;
  return msg;
};

function LoginPage({ auth, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);
  const [toast, setToast] = useState({});

  // عرض أخطاء OAuth اللي رجعت من الـ URL
  useEffect(() => {
    if (auth.authError) {
      setToast({ msg: xlateErr(auth.authError), type: "error" });
      auth.clearAuthError();
    }
  }, [auth.authError]);

  const submit = async () => {
    if (!email.trim() || !pass) return setToast({ msg: "البريد وكلمة المرور مطلوبان", type: "error" });
    if (pass.length < 6) return setToast({ msg: "كلمة المرور ٦ أحرف على الأقل", type: "error" });
    setBusy(true);
    if (mode === "login") {
      const r = await auth.signIn(email, pass);
      if (r.error) setToast({ msg: xlateErr(r.error), type: "error" });
    } else {
      if (!name.trim()) { setBusy(false); return setToast({ msg: "الاسم الكامل مطلوب", type: "error" }); }
      const r = await auth.signUp(email, pass, name.trim());
      if (r.error) setToast({ msg: xlateErr(r.error), type: "error" });
      else if (r.needsConfirmation) {
        setToast({ msg: "✉ تم الإرسال! تحقق من بريدك وافتح رابط التأكيد، ثم ارجع هنا وسجّل دخولك", type: "success" });
        setMode("login");
      } else setToast({ msg: "تم إنشاء الحساب!", type: "success" });
    }
    setBusy(false);
  };

  const googleLogin = async () => {
    setGBusy(true);
    const r = await auth.signInWithGoogle();
    if (r.error) { setToast({ msg: xlateErr(r.error), type: "error" }); setGBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", fontFamily: FONT_BODY }}>
      <style>{CSS_GLOBAL}</style>

      {/* جانب يسار — بصري */}
      <div style={{
        flex: 1, background: `linear-gradient(160deg, ${C.navy} 0%, #2A4D52 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 40, minWidth: 0,
      }} className="login-panel-hidden">
        <Logo size="lg" dark />
        <div style={{ marginTop: 40, maxWidth: 320, textAlign: "center" }}>
          <p style={{ color: "rgba(251,246,236,0.65)", fontSize: 15, lineHeight: 1.9 }}>
            منصة خاصة لعملاء النخبة — تابع سيارتك في كل مرحلة من المزاد الأمريكي حتى استلامها
          </p>
        </div>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 14 }}>
          {["شفافية كاملة في التتبع", "خريطة حية لموقع الشحنة", "مستندات وصور بمكان واحد"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(251,246,236,0.7)", fontSize: 14 }}>
              <Check size={16} color={C.rust} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* جانب يمين — الفورم */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", minWidth: 320, overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 32, textAlign: "right" }}>
            <div style={{ cursor: "pointer", marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 6, color: C.inkSoft, fontSize: 13 }} onClick={onBack}>
              <ChevronRight size={16} /> العودة للرئيسية
            </div>
            <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>
              {mode === "login" ? "مرحباً بعودتك" : "إنشاء حساب جديد"}
            </h2>
            <p style={{ color: C.inkSoft, fontSize: 14 }}>
              {mode === "login" ? "ادخل على حسابك لمتابعة سيارتك" : "أنشئ حسابك للوصول إلى منصة التتبع"}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={googleLogin}
            disabled={gBusy}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, background: "#fff", color: "#3c4043",
              border: `1.5px solid ${C.sand}`, borderRadius: 10,
              padding: "12px", fontWeight: 600, fontSize: 14.5,
              cursor: gBusy ? "not-allowed" : "pointer", marginBottom: 22,
              boxShadow: "0 1px 4px rgba(44,38,32,0.08)",
              transition: "all 0.2s", fontFamily: FONT_BODY, opacity: gBusy ? 0.7 : 1,
            }}
          >
            {gBusy ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.2 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 40.6 16.2 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 35.9 44 30.4 44 24c0-1.4-.1-2.5-.4-3.5z"/>
              </svg>
            )}
            {gBusy ? "جارٍ التحويل لـ Google..." : "الدخول بحساب Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: C.sand }} />
            <span style={{ fontSize: 12, color: C.inkSoft }}>أو بالبريد الإلكتروني</span>
            <div style={{ flex: 1, height: 1, background: C.sand }} />
          </div>

          {mode === "register" && (
            <Field label="الاسم الكامل" value={name} onChange={setName} placeholder="محمد أحمد" required icon={<User size={16} />} />
          )}
          <Field label="البريد الإلكتروني" value={email} onChange={setEmail} type="email" placeholder="example@email.com" required icon={<Mail size={16} />} ltr />
          <Field label="كلمة المرور" value={pass} onChange={setPass} type="password" placeholder="••••••••" required icon={<Lock size={16} />} ltr />

          <Btn onClick={submit} disabled={busy} variant="navy" size="lg" style={{ width: "100%", marginTop: 6 }}>
            {busy ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> جارٍ المعالجة...</> : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Btn>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.inkSoft }}>
            {mode === "login" ? (
              <>ليس لديك حساب؟ {" "}
                <span style={{ color: C.rust, cursor: "pointer", fontWeight: 700 }} onClick={() => setMode("register")}>إنشاء حساب</span>
              </>
            ) : (
              <>لديك حساب؟ {" "}
                <span style={{ color: C.rust, cursor: "pointer", fontWeight: 700 }} onClick={() => setMode("login")}>تسجيل الدخول</span>
              </>
            )}
          </div>

          {/* تعليمات إعداد Google */}
          <div style={{ marginTop: 28, background: `rgba(181,86,46,0.06)`, border: `1px solid rgba(181,86,46,0.18)`, borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 12, color: C.rust, fontWeight: 700, marginBottom: 6 }}>⚙ لتفعيل تسجيل الدخول بـ Google:</p>
            <p style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.8, margin: 0 }}>
              روح Supabase → Authentication → URL Configuration → أضف رابط موقعك بالضبط في <b>Redirect URLs</b>
              (مثال: https://elite-aap.vercel.app)
              ثم فعّل Google من Authentication → Providers
            </p>
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({})} />
    </div>
  );
}

/* =====================================================================
   لوحة العميل
   ===================================================================== */
function ClientSidebar({ tab, setTab, profile, signOut }) {
  const tabs = [
    { id: "home", icon: <Home size={17} />, label: "الرئيسية" },
    { id: "tracking", icon: <Compass size={17} />, label: "تتبع الشحنة" },
    { id: "gallery", icon: <ImageIcon size={17} />, label: "الصور والفيديو" },
    { id: "docs", icon: <FileText size={17} />, label: "المستندات" },
    { id: "notifications", icon: <Bell size={17} />, label: "الإشعارات" },
    { id: "contact", icon: <MessageCircle size={17} />, label: "تواصل معنا" },
  ];
  return (
    <aside style={{
      width: 230, background: C.navy, display: "flex", flexDirection: "column",
      position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
    }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(251,246,236,0.08)" }}>
        <Logo dark />
      </div>
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "11px 13px", borderRadius: 9, border: "none",
              background: tab === t.id ? "rgba(251,246,236,0.1)" : "transparent",
              color: tab === t.id ? C.paper : "rgba(251,246,236,0.5)",
              cursor: "pointer", fontSize: 13.5, fontWeight: tab === t.id ? 700 : 400,
              marginBottom: 2, fontFamily: FONT_BODY, textAlign: "right",
              transition: "all 0.18s",
            }}>
            <span style={{ color: tab === t.id ? C.rust : "rgba(251,246,236,0.4)" }}>{t.icon}</span>
            <span style={{ flex: 1 }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 3, height: 16, background: C.rust, borderRadius: 2, flexShrink: 0 }} />}
          </button>
        ))}
      </nav>
      <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(251,246,236,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 10px", background: "rgba(251,246,236,0.06)", borderRadius: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.rust, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {(profile?.full_name || "؟")[0]}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.paper, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name}</div>
            <div style={{ fontSize: 11, color: "rgba(251,246,236,0.45)" }}>عميل</div>
          </div>
        </div>
        <Btn variant="outline" onClick={signOut} style={{ width: "100%", color: "rgba(251,246,236,0.55)", borderColor: "rgba(251,246,236,0.15)", fontSize: 13 }} size="sm" icon={<LogOut size={14} />}>
          تسجيل الخروج
        </Btn>
      </div>
    </aside>
  );
}

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

  return (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", direction: "rtl", fontFamily: FONT_BODY }}>
      <style>{CSS_GLOBAL}</style>
      <ClientSidebar tab={tab} setTab={setTab} profile={auth.profile} signOut={auth.signOut} />
      <main style={{ flex: 1, marginRight: 230, padding: "28px 26px", overflowY: "auto", minWidth: 0 }}>
        {loading ? <Spinner label="جارٍ تحميل بياناتك..." /> : !car ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Car size={52} color={C.sand} style={{ marginBottom: 18 }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 10 }}>لا توجد سيارات مضافة</h3>
            <p style={{ color: C.inkSoft }}>تواصل مع الشركة لإضافة سيارتك إلى حسابك</p>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "inline-block", marginTop: 20 }}>
              <Btn variant="success" icon={<MessageCircle size={16} />}>تواصل معنا على واتساب</Btn>
            </a>
          </div>
        ) : (
          <>
            {tab === "home" && <CHome car={car} profile={auth.profile} />}
            {tab === "tracking" && <CTracking car={car} />}
            {tab === "gallery" && <CGallery car={car} />}
            {tab === "docs" && <CDocs car={car} />}
            {tab === "notifications" && <CNotifs car={car} />}
            {tab === "contact" && <CContact car={car} />}
          </>
        )}
      </main>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY, margin: 0 }}>{children}</h2>
      <div style={{ width: 36, height: 3, background: C.rust, borderRadius: 2, marginTop: 8 }} />
    </div>
  );
}

function CHome({ car, profile }) {
  const pct = Math.round((car.current_status / 11) * 100);
  const step = TRACKING_STEPS[car.current_status - 1];
  const StepIcon = ICONS[step?.icon] || CheckCircle2;

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 2 }}>أهلاً،</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY }}>{profile?.full_name}</h1>
      </div>

      {/* بطاقة السيارة الرئيسية */}
      <Card style={{ marginBottom: 22, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.sand}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Badge color={C.rust}><StepIcon size={12} /> {step?.ar}</Badge>
          <span style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 500 }}>{car.order_number}</span>
        </div>
        <div style={{ display: "flex", gap: 22, padding: 22, flexWrap: "wrap" }}>
          {car.main_image_url ? (
            <img src={car.main_image_url} alt="car" style={{ width: 220, height: 148, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.sand}`, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 220, height: 148, borderRadius: 10, border: `1px solid ${C.sand}`, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Car size={46} color={C.sand} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 6, fontFamily: FONT_DISPLAY }}>{car.car_name}</h2>
            <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 3 }}>الموديل: {car.model} | السنة: {car.year}</p>
            <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 3 }}>رقم الهيكل: {car.vin || "—"}</p>
            <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 18 }}>اللون: {car.color || "—"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["تاريخ الشراء", car.purchase_date], ["الوصول المتوقع", car.estimated_arrival]].map(([k, v]) => (
                <div key={k} style={{ background: C.paper, border: `1px solid ${C.sand}`, borderRadius: 9, padding: "10px 13px" }}>
                  <p style={{ fontSize: 10.5, color: C.inkSoft, marginBottom: 4, fontWeight: 600 }}>{k}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* شريط التقدم — بأسلوب مسطرة شحن */}
        <div style={{ padding: "16px 22px", borderTop: `1px solid ${C.sand}`, background: C.paper }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: C.rust, fontWeight: 700 }}>المرحلة {car.current_status} من 11</span>
            <span style={{ fontSize: 12.5, color: C.inkSoft }}>{pct}% مكتمل</span>
          </div>
          <div style={{ height: 8, background: C.sand, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(to left, ${C.rust}, ${C.rustSoft})`, borderRadius: 4, transition: "width 1.2s ease", boxShadow: `0 0 8px ${C.rust}40` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10.5, color: C.inkSoft }}>تسليم</span>
            <span style={{ fontSize: 10.5, color: C.inkSoft }}>شراء</span>
          </div>
        </div>
      </Card>

      {/* المواصفات */}
      <Card style={{ padding: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.rust, marginBottom: 18, letterSpacing: "0.06em", textTransform: "uppercase" }}>المواصفات التقنية</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 16 }}>
          {[["المحرك", car.engine], ["الدفع", car.drive_type], ["ناقل الحركة", car.transmission], ["المسافة", car.mileage]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ borderBottom: `1px solid ${C.sand}`, paddingBottom: 12 }}>
              <p style={{ fontSize: 10.5, color: C.inkSoft, marginBottom: 5, fontWeight: 600 }}>{k}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CTracking({ car }) {
  const shipment = car.shipments?.[0];
  const steps = car.tracking_steps || [];

  return (
    <div>
      <SectionTitle>تتبع الشحنة</SectionTitle>
      <Card style={{ padding: 22, marginBottom: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.rust, marginBottom: 14 }}>الموقع الحالي للشحنة</p>
        <LiveMap lat={shipment?.current_lat || 25} lng={shipment?.current_lng || 55} />
        {shipment && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14, marginTop: 18 }}>
            {[["شركة الشحن", shipment.shipping_line], ["رقم الحاوية", shipment.container_number], ["ميناء المصدر", shipment.origin_port], ["ميناء الوصول", shipment.destination_port]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 10.5, color: C.inkSoft, marginBottom: 4, fontWeight: 600 }}>{k}</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* تايم لاين بأسلوب ختم جمركي */}
      <Card style={{ padding: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.rust, marginBottom: 24 }}>مراحل الشحنة التفصيلية</p>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", right: 19, top: 0, bottom: 0, width: 2, background: C.sand }} />
          {TRACKING_STEPS.map((ts, i) => {
            const dbStep = steps.find(s => s.step_number === ts.num);
            const done = dbStep?.completed || car.current_status > ts.num;
            const active = ts.num === car.current_status;
            const StepIcon = ICONS[ts.icon] || Check;
            return (
              <div key={i} style={{ display: "flex", gap: 18, marginBottom: 26 }}>
                <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: done ? C.rust : active ? C.navy : C.paper,
                    border: `2px solid ${done ? C.rust : active ? C.navy : C.sandDeep}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: active ? `0 0 0 4px rgba(181,86,46,0.18)` : "none",
                    transition: "all 0.3s",
                  }}>
                    {done ? <Check size={17} color="#fff" /> : <StepIcon size={15} color={active ? C.paper : C.inkSoft} />}
                  </div>
                </div>
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <p style={{ fontSize: 14.5, fontWeight: done || active ? 700 : 400, color: active ? C.navy : done ? C.ink : C.inkSoft, margin: 0 }}>{ts.ar}</p>
                    {dbStep?.completed_at && <p style={{ fontSize: 11, color: C.inkSoft, flexShrink: 0 }}>{new Date(dbStep.completed_at).toLocaleDateString("ar-IQ")}</p>}
                  </div>
                  {dbStep?.notes && <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>{dbStep.notes}</p>}
                  {active && <Badge color={C.rust} soft style={{ marginTop: 7 }}>المرحلة الحالية</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function CGallery({ car }) {
  const [filter, setFilter] = useState("all");
  const [lb, setLb] = useState(null);
  const images = car.car_images || [];
  const videos = car.car_videos || [];
  const stageMap = { auction: "المزاد", post_purchase: "بعد الشراء", transit: "أثناء النقل", port: "الميناء", loading: "التحميل", arrival: "الوصول", other: "أخرى" };
  const filters = [["all", "الكل"], ...Object.entries(stageMap)];
  const filtered = filter === "all" ? images : images.filter(i => i.stage === filter);

  return (
    <div>
      <SectionTitle>الصور والفيديو</SectionTitle>
      {videos.length > 0 && (
        <Card style={{ padding: 22, marginBottom: 22 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.rust, marginBottom: 16 }}>فيديوهات السيارة</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {videos.map((v, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.sand}` }}>
                <video controls style={{ width: "100%", display: "block", maxHeight: 200, background: C.ink }} poster={v.thumbnail_url || undefined}>
                  <source src={v.url} />
                </video>
                {v.title && <p style={{ padding: "10px 14px", fontSize: 13, color: C.inkSoft, margin: 0 }}>{v.title}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {filters.map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              background: filter === k ? C.rust : C.paper,
              color: filter === k ? "#fff" : C.inkSoft,
              border: `1.5px solid ${filter === k ? C.rust : C.sand}`,
              borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 12.5,
              fontWeight: filter === k ? 700 : 500, fontFamily: FONT_BODY, transition: "all 0.18s",
            }}>{v}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px 0", color: C.inkSoft }}>لا توجد صور في هذه المرحلة</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {filtered.map((img, i) => (
              <div key={i} onClick={() => setLb(img.url)} className="img-card" style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.sand}`, cursor: "pointer", position: "relative" }}>
                <img src={img.url} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block", transition: "transform 0.25s" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(44,38,32,0.75), transparent)", padding: "16px 12px 10px" }}>
                  <span style={{ fontSize: 11.5, color: "#fff", fontWeight: 600 }}>{stageMap[img.stage] || img.stage_ar}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {lb && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,38,32,0.92)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLb(null)}>
          <img src={lb} alt="" style={{ maxWidth: "90%", maxHeight: "88vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setLb(null)} style={{ position: "absolute", top: 18, left: 18, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
        </div>
      )}
    </div>
  );
}

function CDocs({ car }) {
  const docs = car.documents || [];
  const typeLabels = { invoice: "فاتورة الشراء", bill_of_lading: "بوليصة الشحن", inspection: "تقرير الفحص", damage: "تقرير الأضرار", clearance: "مستندات التخليص", title: "هوية المالك", other: "ملفات أخرى" };
  return (
    <div>
      <SectionTitle>المستندات والوثائق</SectionTitle>
      {docs.length === 0 ? (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <FileText size={38} color={C.sand} style={{ marginBottom: 14 }} />
          <p style={{ color: C.inkSoft }}>لا توجد مستندات مرفوعة حالياً</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 18 }}>
          {docs.map((d, i) => (
            <Card key={i} hover style={{ padding: 22, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `rgba(181,86,46,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <FileText size={24} color={C.rust} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{d.name_ar || typeLabels[d.doc_type] || d.name}</p>
              {d.file_size && <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 16 }}>{d.file_size}</p>}
              <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Btn variant="rust" size="sm" style={{ width: "100%" }} icon={<Download size={14} />}>تحميل</Btn>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CNotifs({ car }) {
  const [notifs, setNotifs] = useState(car.notifications || []);
  const markRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };
  return (
    <div>
      <SectionTitle>الإشعارات والتنبيهات</SectionTitle>
      {notifs.length === 0 ? (
        <Card style={{ padding: 60, textAlign: "center" }}>
          <Bell size={38} color={C.sand} style={{ marginBottom: 14 }} />
          <p style={{ color: C.inkSoft }}>لا توجد إشعارات</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifs.map((n, i) => (
            <Card key={i} onClick={() => !n.read && markRead(n.id)} hover={!n.read} style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start", opacity: n.read ? 0.7 : 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `rgba(181,86,46,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={18} color={C.rust} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14.5, fontWeight: n.read ? 500 : 700, color: C.navy, marginBottom: 4 }}>{n.title}</p>
                <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 5 }}>{n.message}</p>
                <p style={{ fontSize: 11.5, color: C.sand }}>{new Date(n.created_at).toLocaleString("ar-IQ")}</p>
              </div>
              {!n.read && <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.rust, flexShrink: 0, marginTop: 6 }} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CContact({ car }) {
  const msg = `مرحبا، أتواصل بخصوص الطلب ${car.order_number} - السيارة: ${car.car_name}`;
  return (
    <div>
      <SectionTitle>التواصل معنا</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 28 }}>
          <MessageCircle size={32} color="#25D366" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 10 }}>واتساب المباشر</h3>
          <p style={{ color: C.inkSoft, fontSize: 13.5, lineHeight: 1.8, marginBottom: 22 }}>تواصل مع موظف الشركة مباشرةً — رقم طلبك يُرفق تلقائياً.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <Btn variant="success" style={{ width: "100%" }} icon={<MessageCircle size={16} />}>فتح واتساب</Btn>
          </a>
        </Card>
        <Card style={{ padding: 28 }}>
          <Mail size={32} color={C.navy} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 10 }}>البريد الإلكتروني</h3>
          <p style={{ color: C.inkSoft, fontSize: 13.5, lineHeight: 1.8, marginBottom: 22 }}>للاستفسارات الرسمية والمراسلات المكتوبة.</p>
          <a href={`mailto:info@nukhba-motors.iq?subject=${encodeURIComponent(`استفسار - ${car.order_number}`)}`} style={{ textDecoration: "none", display: "block" }}>
            <Btn variant="navy" style={{ width: "100%" }} icon={<Mail size={16} />}>إرسال بريد</Btn>
          </a>
        </Card>
      </div>
    </div>
  );
}

/* =====================================================================
   لوحة الإدارة
   ===================================================================== */
function AdminSidebar({ tab, setTab, signOut }) {
  const tabs = [
    { id: "overview", icon: <Home size={17} />, label: "الرئيسية" },
    { id: "orders", icon: <FileText size={17} />, label: "الطلبات" },
    { id: "clients", icon: <Users size={17} />, label: "العملاء" },
    { id: "add_car", icon: <Plus size={17} />, label: "إضافة سيارة" },
    { id: "import", icon: <FileSpreadsheet size={17} />, label: "استيراد Excel" },
  ];
  return (
    <aside style={{ width: 210, background: C.ink, display: "flex", flexDirection: "column", position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Logo dark />
        <div style={{ marginTop: 10, fontSize: 10.5, color: C.rust, background: "rgba(181,86,46,0.12)", borderRadius: 6, padding: "4px 10px", textAlign: "center", letterSpacing: "0.1em", fontWeight: 700 }}>
          لوحة الإدارة
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: tab === t.id ? "rgba(181,86,46,0.18)" : "transparent",
            color: tab === t.id ? C.rust : "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 13.5, fontWeight: tab === t.id ? 700 : 400,
            marginBottom: 2, fontFamily: FONT_BODY, textAlign: "right", transition: "all 0.18s",
          }}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Btn variant="danger" onClick={signOut} style={{ width: "100%", borderColor: "rgba(178,59,59,0.3)" }} size="sm" icon={<LogOut size={14} />}>خروج</Btn>
      </div>
    </aside>
  );
}

function AdminDashboard({ auth }) {
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState({});
  return (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", direction: "rtl", fontFamily: FONT_BODY }}>
      <style>{CSS_GLOBAL}</style>
      <AdminSidebar tab={tab} setTab={setTab} signOut={auth.signOut} />
      <main style={{ flex: 1, marginRight: 210, padding: "28px 26px", overflowY: "auto", minWidth: 0 }}>
        {tab === "overview" && <AOverview />}
        {tab === "orders" && <AOrders setToast={setToast} />}
        {tab === "clients" && <AClients />}
        {tab === "add_car" && <AAddCar setToast={setToast} />}
        {tab === "import" && <AImport setToast={setToast} />}
      </main>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({})} />
    </div>
  );
}

function AOverview() {
  const [cars, setCars] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  useEffect(() => {
    supabase.from("cars").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(12).then(({ data }) => data && setCars(data));
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client").then(({ count }) => setClientCount(count || 0));
  }, []);

  const stats = [
    { label: "إجمالي السيارات", val: cars.length, icon: <Car size={22} />, color: C.navy },
    { label: "عدد العملاء", val: clientCount, icon: <Users size={22} />, color: C.info },
    { label: "في الطريق", val: cars.filter(c => c.current_status >= 6 && c.current_status <= 8).length, icon: <Ship size={22} />, color: C.rust },
    { label: "تم التسليم", val: cars.filter(c => c.current_status === 11).length, icon: <CheckCircle2 size={22} />, color: C.success },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.navy, fontFamily: FONT_DISPLAY, margin: 0 }}>لوحة التحكم</h1>
        <div style={{ width: 36, height: 3, background: C.rust, borderRadius: 2, marginTop: 8 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 26 }}>
        {stats.map((s, i) => (
          <Card key={i} style={{ padding: "20px 22px" }}>
            <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: FONT_DISPLAY, margin: "0 0 4px" }}>{s.val}</p>
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>{s.label}</p>
          </Card>
        ))}
      </div>
      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.sand}`, fontSize: 14, fontWeight: 700, color: C.navy }}>آخر الطلبات</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.sand}`, background: C.paper }}>
              {["رقم الطلب", "العميل", "السيارة", "الحالة", "التاريخ"].map(h => (
                <th key={h} style={{ padding: "11px 18px", textAlign: "right", fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((c, i) => {
              const step = TRACKING_STEPS[c.current_status - 1];
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.sand}` }}>
                  <td style={{ padding: "12px 18px", fontSize: 13.5, color: C.rust, fontWeight: 700 }}>{c.order_number}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13 }}>{c.profiles?.full_name || "—"}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13 }}>{c.car_name}</td>
                  <td style={{ padding: "12px 18px" }}><Badge color={c.current_status === 11 ? C.success : C.rust}>{step?.ar}</Badge></td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: C.inkSoft }}>{c.purchase_date || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AOrders({ setToast }) {
  const [cars, setCars] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { load(); }, []);
  const load = () => supabase.from("cars").select("*, profiles(full_name,phone), shipments(*)").order("created_at", { ascending: false }).then(({ data }) => data && setCars(data));

  const updateStatus = async (id, status) => {
    await supabase.from("cars").update({ current_status: status }).eq("id", id);
    await supabase.from("tracking_steps").update({ completed: true, completed_at: new Date().toISOString() }).eq("car_id", id).eq("step_number", status);
    setCars(c => c.map(x => x.id === id ? { ...x, current_status: status } : x));
    setToast({ msg: "تم تحديث حالة السيارة", type: "success" });
  };

  return (
    <div>
      <SectionTitle>إدارة الطلبات</SectionTitle>
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.sand}`, background: C.paper }}>
              {["رقم الطلب", "العميل", "السيارة", "الحالة", "تعديل", "إجراءات"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "right", fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.sand}` }}>
                <td style={{ padding: "12px 14px", fontSize: 13.5, color: C.rust, fontWeight: 700 }}>{c.order_number}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.profiles?.full_name}<br /><span style={{ fontSize: 11, color: C.inkSoft }}>{c.profiles?.phone}</span></td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.car_name} {c.year}</td>
                <td style={{ padding: "12px 14px" }}><Badge color={C.rust}>{TRACKING_STEPS[c.current_status - 1]?.ar}</Badge></td>
                <td style={{ padding: "12px 14px" }}>
                  <select value={c.current_status} onChange={e => updateStatus(c.id, parseInt(e.target.value))} style={{ background: C.paper, border: `1.5px solid ${C.sand}`, borderRadius: 8, padding: "6px 10px", color: C.ink, fontSize: 12.5, cursor: "pointer", fontFamily: FONT_BODY }}>
                    {TRACKING_STEPS.map(s => <option key={s.num} value={s.num}>{s.ar}</option>)}
                  </select>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <Btn size="sm" variant="ghost" onClick={() => setSelected(c)}>تفاصيل</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {selected && <ACarModal car={selected} onClose={() => { setSelected(null); load(); }} setToast={setToast} />}
    </div>
  );
}

function ACarModal({ car, onClose, setToast }) {
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("auction");
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [lat, setLat] = useState(car.shipments?.[0]?.current_lat?.toString() || "");
  const [lng, setLng] = useState(car.shipments?.[0]?.current_lng?.toString() || "");
  const [note, setNote] = useState("");

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
    const ex = car.shipments?.[0];
    if (ex) await supabase.from("shipments").update({ current_lat: parseFloat(lat), current_lng: parseFloat(lng) }).eq("id", ex.id);
    else await supabase.from("shipments").insert({ car_id: car.id, current_lat: parseFloat(lat), current_lng: parseFloat(lng) });
    setToast({ msg: "تم تحديث الموقع", type: "success" });
  };

  const saveNote = async () => {
    if (!note) return;
    await supabase.from("tracking_steps").update({ notes: note }).eq("car_id", car.id).eq("step_number", car.current_status);
    setToast({ msg: "تم حفظ الملاحظة", type: "success" }); setNote("");
  };

  const sendNotif = async () => {
    if (!notifTitle || !notifMsg) return setToast({ msg: "أدخل العنوان والنص", type: "error" });
    await supabase.from("notifications").insert({ client_id: car.client_id, car_id: car.id, title: notifTitle, message: notifMsg, type: "update" });
    setToast({ msg: "تم إرسال الإشعار", type: "success" }); setNotifTitle(""); setNotifMsg("");
  };

  const MS = ({ title, children }) => (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${C.sand}` }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.rust, marginBottom: 14 }}>{title}</p>
      {children}
    </div>
  );

  return (
    <ModalShell open={true} onClose={onClose} title={`${car.car_name} — ${car.order_number}`}>
      <MS title="تحديث الموقع الجغرافي">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="خط العرض Lat" value={lat} onChange={setLat} placeholder="29.9" ltr />
          <Field label="خط الطول Lng" value={lng} onChange={setLng} placeholder="47.8" ltr />
        </div>
        <Btn variant="navy" onClick={updateLocation} size="sm">تحديث الموقع</Btn>
      </MS>
      <MS title="ملاحظة على المرحلة الحالية">
        <Field label="الملاحظة" value={note} onChange={setNote} placeholder="تم استلام السيارة..." />
        <Btn variant="navy" onClick={saveNote} size="sm">حفظ</Btn>
      </MS>
      <MS title="رفع صورة">
        <SelectField value={stage} onChange={setStage} options={[["auction","المزاد"],["post_purchase","بعد الشراء"],["transit","أثناء النقل"],["port","الميناء"],["loading","التحميل"],["arrival","الوصول"]]} />
        <input type="file" accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if(f) upload("car-images",f,"car_images",{stage,stage_ar:stage}); }} style={{ color: C.ink, fontSize: 13, display: "block", marginBottom: 8 }} />
        {uploading && <p style={{ color: C.rust, fontSize: 12 }}>جارٍ الرفع...</p>}
      </MS>
      <MS title="رفع فيديو">
        <input type="file" accept="video/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if(f) upload("car-videos",f,"car_videos",{stage}); }} style={{ color: C.ink, fontSize: 13, display: "block" }} />
      </MS>
      <MS title="رفع مستند">
        <Field label="اسم المستند" value={docName} onChange={setDocName} placeholder="فاتورة الشراء" />
        <SelectField value={docType} onChange={setDocType} options={[["invoice","فاتورة الشراء"],["bill_of_lading","بوليصة الشحن"],["inspection","تقرير الفحص"],["damage","تقرير الأضرار"],["clearance","مستندات التخليص"],["other","أخرى"]]} />
        <input type="file" accept=".pdf,.doc,.docx" disabled={uploading||!docName} onChange={e => { const f = e.target.files?.[0]; if(f&&docName) upload("documents",f,"documents",{name:f.name,name_ar:docName,doc_type:docType,file_size:`${Math.round(f.size/1024)} KB`}); }} style={{ color: C.ink, fontSize: 13, display: "block" }} />
      </MS>
      <MS title="إرسال إشعار للعميل">
        <Field label="العنوان" value={notifTitle} onChange={setNotifTitle} placeholder="تحديث الحالة" />
        <Field label="النص" value={notifMsg} onChange={setNotifMsg} placeholder="تم تحميل سيارتك في الحاوية..." />
        <Btn variant="rust" onClick={sendNotif} size="sm" icon={<Send size={14} />}>إرسال</Btn>
      </MS>
    </ModalShell>
  );
}

function AClients() {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    supabase.from("profiles").select("*, cars(id)").eq("role","client").order("created_at",{ascending:false}).then(({data}) => data && setClients(data));
  }, []);
  return (
    <div>
      <SectionTitle>إدارة العملاء</SectionTitle>
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.sand}`, background: C.paper }}>
              {["الاسم","الهاتف","عدد السيارات","تاريخ التسجيل"].map(h => (
                <th key={h} style={{ padding:"11px 16px", textAlign:"right", fontSize:11.5, color:C.inkSoft, fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${C.sand}` }}>
                <td style={{ padding:"12px 16px", fontSize:13.5, fontWeight:700, color:C.navy }}>{c.full_name}</td>
                <td style={{ padding:"12px 16px", fontSize:13, color:C.inkSoft }}>{c.phone||"—"}</td>
                <td style={{ padding:"12px 16px" }}><Badge color={C.rust}>{c.cars?.length||0} سيارة</Badge></td>
                <td style={{ padding:"12px 16px", fontSize:12, color:C.inkSoft }}>{c.created_at?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AAddCar({ setToast }) {
  const [clients, setClients] = useState([]);
  const [f, setF] = useState({ client_id:"", car_name:"", model:"", year:"", color:"", vin:"", engine:"", drive_type:"", transmission:"", mileage:"", order_number:"", purchase_date:"", estimated_arrival:"" });
  const [busy, setBusy] = useState(false);
  const sf = (k,v) => setF(p => ({...p,[k]:v}));

  useEffect(() => { supabase.from("profiles").select("id,full_name").eq("role","client").then(({data}) => data && setClients(data)); }, []);

  const submit = async () => {
    if (!f.client_id||!f.car_name||!f.order_number) return setToast({msg:"يرجى ملء الحقول المطلوبة",type:"error"});
    setBusy(true);
    const {data,error} = await supabase.from("cars").insert({...f, year:parseInt(f.year)||null, current_status:1}).select().single();
    if (error) { setToast({msg:error.message,type:"error"}); setBusy(false); return; }
    if (data) {
      await supabase.from("tracking_steps").insert(TRACKING_STEPS.map(s => ({car_id:data.id, step_number:s.num, step_name_ar:s.ar, step_name_en:s.en, completed:false})));
      setToast({msg:"تم إضافة السيارة!",type:"success"});
      setF({client_id:"",car_name:"",model:"",year:"",color:"",vin:"",engine:"",drive_type:"",transmission:"",mileage:"",order_number:"",purchase_date:"",estimated_arrival:""});
    }
    setBusy(false);
  };

  return (
    <div>
      <SectionTitle>إضافة سيارة جديدة</SectionTitle>
      <Card style={{ padding: 28 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <SelectField label="العميل *" value={f.client_id} onChange={v=>sf("client_id",v)} options={[["","اختر العميل"],...clients.map(c=>[c.id,c.full_name])]} />
          <Field label="رقم الطلب *" value={f.order_number} onChange={v=>sf("order_number",v)} placeholder="#EM-2024-001" />
          <Field label="اسم السيارة *" value={f.car_name} onChange={v=>sf("car_name",v)} placeholder="BMW X5" />
          <Field label="الموديل" value={f.model} onChange={v=>sf("model",v)} placeholder="X5" />
          <Field label="سنة الصنع" value={f.year} onChange={v=>sf("year",v)} placeholder="2021" />
          <Field label="اللون" value={f.color} onChange={v=>sf("color",v)} placeholder="أسود" />
          <Field label="رقم الهيكل VIN" value={f.vin} onChange={v=>sf("vin",v)} placeholder="5UXCR6C..." ltr />
          <Field label="المحرك" value={f.engine} onChange={v=>sf("engine",v)} placeholder="3.0L" />
          <Field label="نوع الدفع" value={f.drive_type} onChange={v=>sf("drive_type",v)} placeholder="AWD" />
          <Field label="ناقل الحركة" value={f.transmission} onChange={v=>sf("transmission",v)} placeholder="أوتوماتيك" />
          <Field label="المسافة" value={f.mileage} onChange={v=>sf("mileage",v)} placeholder="35,000 ميل" />
          <Field label="تاريخ الشراء" value={f.purchase_date} onChange={v=>sf("purchase_date",v)} type="date" ltr />
          <Field label="الوصول المتوقع" value={f.estimated_arrival} onChange={v=>sf("estimated_arrival",v)} type="date" ltr />
        </div>
        <Btn variant="rust" onClick={submit} disabled={busy} size="lg" style={{marginTop:8}} icon={<Plus size={18}/>}>
          {busy ? "جارٍ الحفظ..." : "إضافة السيارة"}
        </Btn>
      </Card>
    </div>
  );
}

function AImport({ setToast }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.from("profiles").select("id,full_name").eq("role","client").then(({data}) => data && setClients(data)); }, []);

  const handleFile = e => {
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target.result,{type:"binary"});
      const ws = wb.Sheets[wb.SheetNames[0]];
      setRows(XLSX.utils.sheet_to_json(ws,{defval:""}));
    };
    reader.readAsBinaryString(file);
  };

  const importAll = async () => {
    if(!clientId||rows.length===0) return setToast({msg:"اختر العميل والملف",type:"error"});
    setBusy(true); let ok=0;
    for(const row of rows) {
      const {data} = await supabase.from("cars").insert({
        client_id:clientId,
        order_number: row["رقم الطلب"]||row["order_number"]||`#EM-${Date.now()}`,
        car_name: row["اسم السيارة"]||row["car_name"]||"غير محدد",
        model: row["الموديل"]||row["model"]||"",
        year: parseInt(row["السنة"]||row["year"])||null,
        color: row["اللون"]||row["color"]||"",
        vin: row["VIN"]||row["vin"]||"",
        engine: row["المحرك"]||row["engine"]||"",
        purchase_date: row["تاريخ الشراء"]||row["purchase_date"]||null,
        estimated_arrival: row["الوصول المتوقع"]||row["estimated_arrival"]||null,
        current_status:1,
      }).select().single();
      if(data) {
        await supabase.from("tracking_steps").insert(TRACKING_STEPS.map(s=>({car_id:data.id,step_number:s.num,step_name_ar:s.ar,step_name_en:s.en,completed:false})));
        ok++;
      }
    }
    setToast({msg:`تم استيراد ${ok} سيارة بنجاح!`,type:"success"});
    setBusy(false); setRows([]);
  };

  return (
    <div>
      <SectionTitle>استيراد من Excel</SectionTitle>
      <Card style={{padding:28}}>
        <p style={{fontSize:13,color:C.inkSoft,marginBottom:16}}>
          الأعمدة المطلوبة: <span style={{color:C.rust,fontWeight:700}}>رقم الطلب، اسم السيارة، الموديل، السنة، اللون، VIN، المحرك، تاريخ الشراء، الوصول المتوقع</span>
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          <SelectField label="العميل *" value={clientId} onChange={setClientId} options={[["","اختر العميل"],...clients.map(c=>[c.id,c.full_name])]} />
          <div>
            <label style={{display:"block",fontSize:12.5,color:C.inkSoft,marginBottom:7,fontWeight:600}}>ملف Excel / CSV *</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{color:C.ink,fontSize:13,paddingTop:8}} />
          </div>
        </div>
        {rows.length>0 && (
          <div>
            <p style={{fontSize:13,color:C.rust,marginBottom:12,fontWeight:700}}>معاينة: {rows.length} سجل</p>
            <div style={{overflowX:"auto",marginBottom:18,borderRadius:8,border:`1px solid ${C.sand}`}}>
              <table style={{borderCollapse:"collapse",fontSize:12,width:"100%"}}>
                <thead>
                  <tr style={{background:C.paper}}>
                    {Object.keys(rows[0]).map(k=><th key={k} style={{padding:"7px 12px",textAlign:"right",color:C.inkSoft,borderBottom:`1px solid ${C.sand}`,whiteSpace:"nowrap",fontWeight:600}}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0,5).map((r,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${C.sand}`}}>
                      {Object.values(r).map((v,j)=><td key={j} style={{padding:"7px 12px",color:C.ink,whiteSpace:"nowrap"}}>{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn variant="rust" onClick={importAll} disabled={busy} size="lg" icon={<Upload size={16}/>}>
              {busy?"جارٍ الاستيراد...":`استيراد ${rows.length} سيارة`}
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

/* =====================================================================
   CSS عام + تطبيق الجذر
   ===================================================================== */
const CSS_GLOBAL = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.paper};}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:${C.sand};}
  ::-webkit-scrollbar-thumb{background:${C.sandDeep};border-radius:3px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  input:focus,select:focus{outline:none;}
  .img-card:hover img{transform:scale(1.04);}
  @media(max-width:700px){
    .login-panel-hidden{display:none!important;}
    nav>div:nth-child(2){display:none!important;}
  }
`;

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

  if (auth.loading) return (
    <div style={{ minHeight:"100vh", background:C.paper, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT_BODY }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <Spinner label="جارٍ التحميل..." />
    </div>
  );

  return (
    <>
      {page === "home" && <HomePage onGoLogin={() => setPage("login")} />}
      {page === "login" && <LoginPage auth={auth} onBack={() => setPage("home")} />}
      {page === "client" && auth.session && <ClientDashboard auth={auth} />}
      {page === "admin" && auth.session && <AdminDashboard auth={auth} />}
    </>
  );
}
