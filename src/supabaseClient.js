import { createClient } from "@supabase/supabase-js";

// مفاتيح مشروع النخبة على Supabase
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

// رقم واتساب الشركة
export const WHATSAPP_NUMBER = "9647800000000";

// خطوات تتبع الشحنة (11 مرحلة) — تشبه ختم جمركي على وثيقة شحن
export const TRACKING_STEPS = [
  { num: 1, ar: "تم شراء السيارة", en: "Purchased", icon: "tag" },
  { num: 2, ar: "تم إصدار الفاتورة", en: "Invoiced", icon: "receipt" },
  { num: 3, ar: "استلام من المزاد", en: "Collected", icon: "gavel" },
  { num: 4, ar: "ساحة التجميع", en: "Staging Yard", icon: "warehouse" },
  { num: 5, ar: "تحميل الحاوية", en: "Containerized", icon: "package" },
  { num: 6, ar: "غادرت الميناء", en: "Departed", icon: "anchor" },
  { num: 7, ar: "في عرض البحر", en: "At Sea", icon: "waves" },
  { num: 8, ar: "وصلت ميناء العراق", en: "Arrived Iraq", icon: "flag" },
  { num: 9, ar: "التخليص الجمركي", en: "Customs", icon: "stamp" },
  { num: 10, ar: "جاهزة للاستلام", en: "Ready", icon: "check-circle" },
  { num: 11, ar: "تم التسليم", en: "Delivered", icon: "party-popper" },
];

// رابط الموقع الفعلي الحالي (يُستخدم لردّ Google OAuth بدقة)
export function siteOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://elite-aap.vercel.app";
}
