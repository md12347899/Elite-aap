# 🏆 النخبة لاستيراد السيارات — Elite Motors

منصة Vite + React بسيطة وحقيقية، نفس طريقة بنائها مثل تطبيق Nexa.

---

## 📁 محتوى المشروع

```
nukhba-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx            ← نقطة الدخول
│   ├── NukhbaApp.jsx        ← التطبيق كامل (صفحة رئيسية + دخول + لوحة عميل + لوحة إدارة)
│   └── supabaseClient.js    ← مفاتيح Supabase جاهزة
└── sql/
    └── schema.sql           ← قاعدة البيانات كاملة (شغّلها أول شي في Supabase)
```

---

## 🚀 خطوات التشغيل والنشر

### 1) قاعدة البيانات (مرة واحدة فقط)

افتح Supabase → SQL Editor → الصق محتوى `sql/schema.sql` كامل → Run

### 2) رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Nukhba Motors Platform"
git branch -M main
git remote add origin https://github.com/USERNAME/nukhba-app.git
git push -u origin main
```

### 3) النشر على Vercel

1. [vercel.com](https://vercel.com) → Add New Project → اختر المستودع
2. Framework Preset: **Vite** (يكتشفه فيرسل تلقائياً)
3. لا حاجة لإضافة Environment Variables — المفاتيح موجودة مباشرة بداخل `supabaseClient.js`
4. Deploy 🚀

---

## 🔑 تفعيل تسجيل الدخول بـ Google

1. بعد ما تاخذ رابطك من فيرسل (مثلاً `https://nukhba-app.vercel.app`)
2. روح [console.cloud.google.com](https://console.cloud.google.com) → أنشئ OAuth Client ID (Web application)
3. **Authorized JavaScript origins**: أضف رابط موقعك
4. **Authorized redirect URIs**: أضف رابط Supabase auth callback:
   ```
   https://iaecqqsgcgenkrpvenwh.supabase.co/auth/v1/callback
   ```
5. انسخ Client ID و Client Secret
6. روح Supabase → Authentication → Providers → Google → فعّله وضع القيمتين → Save

---

## 👑 تحويل حساب إلى أدمن

سجّل دخولك أول مرة بالموقع، بعدين بـ Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'بريدك@example.com');
```

سجّل خروج ودخول من جديد → بتدخل تلقائياً على لوحة الإدارة.

---

## 📊 استيراد بيانات من Excel

بلوحة الإدارة → استيراد Excel، الأعمدة المطلوبة:

| رقم الطلب | اسم السيارة | الموديل | السنة | اللون | VIN | المحرك | تاريخ الشراء | الوصول المتوقع |
|---|---|---|---|---|---|---|---|---|

---

## 🛠️ للتطوير المحلي

```bash
npm install
npm run dev
```
