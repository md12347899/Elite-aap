import { createClient } from "@supabase/supabase-js";

// مفاتيح مشروع النخبة على Supabase
const SUPABASE_URL = "https://iaecqqsgcgenkrpvenwh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWNxcXNnY2dlbmtycHZlbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjc0MzQsImV4cCI6MjA5ODMwMzQzNH0.Jc3I31fl6jGMcpt6EjFjPE0ALG6RY1FSkt9zRp5GzAQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// رقم واتساب الشركة
export const WHATSAPP_NUMBER = "9647800000000";

// خطوات تتبع الشحنة (11 مرحلة)
export const TRACKING_STEPS = [
  { num: 1, ar: "تم شراء السيارة", en: "Car Purchased", icon: "🏷️" },
  { num: 2, ar: "تم إصدار الفاتورة", en: "Invoice Issued", icon: "📄" },
  { num: 3, ar: "استلام من المزاد", en: "Received from Auction", icon: "🚗" },
  { num: 4, ar: "ساحة التجميع", en: "Assembly Yard", icon: "🏭" },
  { num: 5, ar: "تحميل الحاوية", en: "Container Loaded", icon: "📦" },
  { num: 6, ar: "غادرت الميناء", en: "Departed Port", icon: "⚓" },
  { num: 7, ar: "في عرض البحر", en: "In Transit", icon: "🌊" },
  { num: 8, ar: "وصلت ميناء العراق", en: "Arrived Iraq Port", icon: "🏳️" },
  { num: 9, ar: "التخليص الجمركي", en: "Customs Clearance", icon: "📋" },
  { num: 10, ar: "جاهزة للاستلام", en: "Ready for Pickup", icon: "✅" },
  { num: 11, ar: "تم التسليم", en: "Delivered", icon: "🎉" },
];
