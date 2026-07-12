import { createClient } from "@supabase/supabase-js";

const URL  = "https://iaecqqsgcgenkrpvenwh.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWNxcXNnY2dlbmtycHZlbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjc0MzQsImV4cCI6MjA5ODMwMzQzNH0.Jc3I31fl6jGMcpt6EjFjPE0ALG6RY1FSkt9zRp5GzAQ";

export const supabase = createClient(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" }
});

export const WA  = "9647709941070";
export const WA2 = "9647731984510";

export const STEPS = [
  { n:1,  ar:"تم الشراء",          en:"Purchased",         icon:"🏷" },
  { n:2,  ar:"تم الدفع",           en:"Paid",              icon:"💳" },
  { n:3,  ar:"خرجت من المزاد",     en:"Left Auction",      icon:"🏁" },
  { n:4,  ar:"وصلت الميناء",       en:"Arrived Port",      icon:"⚓" },
  { n:5,  ar:"على السفينة",        en:"On Ship",           icon:"🚢" },
  { n:6,  ar:"في عرض البحر",       en:"At Sea",            icon:"🌊" },
  { n:7,  ar:"وصلت العراق",        en:"Arrived Iraq",      icon:"🇮🇶" },
  { n:8,  ar:"بالطريق للزبون",     en:"On The Way",        icon:"🚛" },
  { n:9,  ar:"التخليص الجمركي",    en:"Customs",           icon:"📋" },
  { n:10, ar:"جاهزة للتسليم",      en:"Ready",             icon:"✅" },
  { n:11, ar:"تم التسليم",         en:"Delivered",         icon:"🎉" },
];

// ──── Auth (custom table — no email confirmation needed) ────
const SK = "elite_uid";
export const getUID   = () => { try { return localStorage.getItem(SK); } catch { return null; } };
export const saveUID  = (id) => { try { localStorage.setItem(SK, id); } catch {} };
export const clearUID = ()   => { try { localStorage.removeItem(SK); } catch {} };

export async function sha256(t) {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join("");
  } catch {
    let h = 0;
    for (let i = 0; i < t.length; i++) { h = Math.imul(31, h) + t.charCodeAt(i) | 0; }
    return "fb_" + Math.abs(h).toString(16);
  }
}

const toUser = r => r ? { id:r.id, email:r.email||"", name:r.full_name, hash:r.pass_hash||"", role:r.role||"client", authId:r.auth_user_id||null } : null;

export const dbGetById    = async id    => toUser((await supabase.from("nukhba_users").select("*").eq("id",id).maybeSingle()).data);
export const dbGetByEmail = async email => toUser((await supabase.from("nukhba_users").select("*").eq("email",email.trim().toLowerCase()).maybeSingle()).data);
export const dbGetByAuth  = async aid   => toUser((await supabase.from("nukhba_users").select("*").eq("auth_user_id",aid).maybeSingle()).data);

export async function dbCreateUser({ email, name, hash, role="client" }) {
  const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const { data, error } = await supabase.from("nukhba_users")
    .insert({ id, email:email.trim().toLowerCase(), full_name:name, pass_hash:hash, role, created_at:new Date().toISOString() })
    .select().maybeSingle();
  if (error) { console.error(error); return null; }
  return toUser(data);
}
export async function dbCreateFromGoogle(authId, email, name) {
  const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const { data } = await supabase.from("nukhba_users")
    .insert({ id, auth_user_id:authId, email:email?.toLowerCase()||"", full_name:name||"عميل", pass_hash:"", role:"client", created_at:new Date().toISOString() })
    .select().maybeSingle();
  return toUser(data);
}

export async function googleSignIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider:"google",
    options:{ redirectTo: window.location.origin + window.location.pathname }
  });
  return !error;
}
export const googleSignOut = () => supabase.auth.signOut().catch(()=>{});
export const googleGetSession = async () => (await supabase.auth.getSession()).data?.session || null;
