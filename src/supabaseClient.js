import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iaecqqsgcgenkrpvenwh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWNxcXNnY2dlbmtycHZlbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjc0MzQsImV4cCI6MjA5ODMwMzQzNH0.Jc3I31fl6jGMcpt6EjFjPE0ALG6RY1FSkt9zRp5GzAQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});

export const WHATSAPP_NUMBER = "9647800000000";

export const TRACKING_STEPS = [
  { num: 1,  ar: "تم شراء السيارة",       icon: "🏷️" },
  { num: 2,  ar: "تم إصدار الفاتورة",     icon: "📄" },
  { num: 3,  ar: "استلام من المزاد",       icon: "🚗" },
  { num: 4,  ar: "ساحة التجميع",           icon: "🏭" },
  { num: 5,  ar: "تحميل الحاوية",          icon: "📦" },
  { num: 6,  ar: "غادرت الميناء",          icon: "⚓" },
  { num: 7,  ar: "في عرض البحر",           icon: "🌊" },
  { num: 8,  ar: "وصلت ميناء العراق",      icon: "🏳️" },
  { num: 9,  ar: "التخليص الجمركي",        icon: "📋" },
  { num: 10, ar: "جاهزة للاستلام",         icon: "✅" },
  { num: 11, ar: "تم التسليم",             icon: "🎉" },
];

// ===================== Auth Layer (نفس أسلوب Nexa) =====================
const LOCAL_SESSION_KEY = "nukhba_uid";

export function getLocalSession() {
  try { return localStorage.getItem(LOCAL_SESSION_KEY); } catch { return null; }
}
export function saveLocalSession(uid) {
  try { localStorage.setItem(LOCAL_SESSION_KEY, uid); } catch {}
}
export function clearLocalSession() {
  try { localStorage.removeItem(LOCAL_SESSION_KEY); } catch {}
}

// SHA-256 (نفس دالة Nexa)
export async function sha256(text) {
  try {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return "fb_" + Math.abs(hash).toString(16);
  }
}

function uid(prefix = "u") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---- قراءة/كتابة جدول nukhba_users ----
function rowToUser(r) {
  if (!r) return null;
  return {
    id: r.id, email: r.email || "", fullName: r.full_name, passHash: r.pass_hash || "",
    role: r.role || "client", authUserId: r.auth_user_id || null,
    createdAt: r.created_at,
  };
}

export async function getUserById(id) {
  const { data } = await supabase.from("nukhba_users").select("*").eq("id", id).maybeSingle();
  return rowToUser(data);
}

export async function getUserByEmail(email) {
  const { data } = await supabase.from("nukhba_users").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
  return rowToUser(data);
}

export async function getUserByAuthId(authId) {
  const { data } = await supabase.from("nukhba_users").select("*").eq("auth_user_id", authId).maybeSingle();
  return rowToUser(data);
}

export async function createUser({ email, fullName, passHash, role = "client" }) {
  const id = uid("u");
  const { data, error } = await supabase.from("nukhba_users").insert({
    id, email: email.trim().toLowerCase(), full_name: fullName, pass_hash: passHash,
    role, created_at: new Date().toISOString(),
  }).select().maybeSingle();
  if (error) { console.error(error); return null; }
  return rowToUser(data);
}

export async function createUserFromGoogle(authUserId, email, fullName) {
  const id = uid("u");
  const { data, error } = await supabase.from("nukhba_users").insert({
    id, auth_user_id: authUserId, email: email?.trim()?.toLowerCase() || "",
    full_name: fullName || email?.split("@")[0] || "عميل",
    pass_hash: "", role: "client", created_at: new Date().toISOString(),
  }).select().maybeSingle();
  if (error) { console.error(error); return null; }
  return rowToUser(data);
}

// Google OAuth
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("signInWithGoogle failed", e);
    return false;
  }
}

export async function getGoogleSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch { return null; }
}

export async function signOutGoogle() {
  try { await supabase.auth.signOut(); } catch {}
}
