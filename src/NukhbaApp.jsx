import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Home, Car, Compass, FileText, Bell, User, LogOut, Plus,
  Check, X, Search, Download, MessageCircle, Ship, Send,
  ChevronRight, ChevronLeft, Lock, Mail, Loader2, Upload,
  BarChart3, Users, MoreVertical, Shield, MapPin,
} from "lucide-react";
import {
  supabase, WA, STEPS, getUID, saveUID, clearUID, sha256,
  dbGetById, dbGetByEmail, dbGetByAuth, dbCreateUser, dbCreateFromGoogle,
  googleSignIn, googleSignOut, googleGetSession,
} from "./supabaseClient";

/* ═══════════════════════
   DESIGN — نفس الصورة
   خلفية: خضراء/رمادية داكنة
   أزرار: ذهبي/برتقالي دافئ
═══════════════════════ */
const T = {
  bg:      "#1A2B2C",
  bg2:     "#162626",
  bg3:     "#111E1F",
  card:    "#1F3233",
  card2:   "#243A3B",
  border:  "rgba(255,255,255,0.08)",
  accent:  "#C4883E",
  accentL: "#D4A55A",
  accentD: "#A36A28",
  gold:    "#C4883E",
  text:    "#F0EDE8",
  text2:   "#8FA8A9",
  text3:   "#567070",
  teal:    "#2EAA7E",
  danger:  "#EF4444",
  warning: "#F59E0B",
};
const F = "'Cairo','Tajawal',system-ui,sans-serif";
const GLOW = "0 0 24px rgba(196,136,62,0.35),0 4px 16px rgba(0,0,0,0.5)";
const SH   = "0 2px 16px rgba(0,0,0,0.4)";

/* ═══════════════════════ CSS ═══════════════════════ */
const G = `
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body{background:${T.bg3};font-family:${F};}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:rgba(196,136,62,0.3);border-radius:2px;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(196,136,62,0.3);}50%{box-shadow:0 0 22px rgba(196,136,62,0.7);}}
.fu{animation:fadeUp 0.35s ease both;}
.fi{animation:fadeIn 0.3s ease both;}
.su{animation:slideUp 0.35s cubic-bezier(.4,0,.2,1) both;}
input,textarea,select{font-family:${F};}
input:focus,select:focus,textarea:focus{outline:none;}
button{font-family:${F};cursor:pointer;}
`;

/* ═══════════════════════ PRIMITIVES ═══════════════════════ */
const Sp = ({ s=22, c=T.accent }) =>
  <Loader2 size={s} color={c} style={{animation:"spin 0.8s linear infinite"}} />;

function Logo({ size=44, dark=false }) {
  const s = size;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:s, height:s, borderRadius:s*0.22,
        background:`linear-gradient(135deg,${T.accentD},${T.accent})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:GLOW, flexShrink:0,
      }}>
        <Ship size={s*0.5} color={dark?"#1A2B2C":"#1A2B2C"} strokeWidth={2}/>
      </div>
      <div>
        <div style={{fontSize:s*0.36,fontWeight:800,color:T.text,lineHeight:1.1}}>النخبة</div>
        <div style={{fontSize:s*0.17,color:T.accent,letterSpacing:"0.18em",fontWeight:600}}>ELITE MOTORS</div>
      </div>
    </div>
  );
}

const Card = ({children,style:s={},onClick,glow}) => (
  <div onClick={onClick} style={{
    background:T.card, border:`1px solid ${T.border}`,
    borderRadius:18, boxShadow:glow?GLOW:SH,
    cursor:onClick?"pointer":"default",
    transition:"all 0.2s", ...s,
  }}>{children}</div>
);

const Btn = ({children,onClick,v="accent",sz="md",disabled,style:s={},icon,full}) => {
  const p = sz==="sm"?"9px 18px":sz==="lg"?"15px 0":"12px 22px";
  const fs = sz==="sm"?13:sz==="lg"?16:14.5;
  const V={
    accent:{background:`linear-gradient(135deg,${T.accentD},${T.accent})`,color:"#1A2B2C",border:"none",boxShadow:GLOW},
    outline:{background:"transparent",color:T.accent,border:`1.5px solid ${T.accent}50`},
    ghost:{background:T.card2,color:T.text,border:`1px solid ${T.border}`},
    danger:{background:"rgba(239,68,68,0.1)",color:T.danger,border:`1px solid rgba(239,68,68,0.25)`},
    wa:{background:"#25D366",color:"#fff",border:"none"},
    teal:{background:`linear-gradient(135deg,#1E8F6A,${T.teal})`,color:"#fff",border:"none"},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...V[v], padding:p, fontSize:fs, fontWeight:800, borderRadius:14,
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
      opacity:disabled?0.5:1, cursor:disabled?"not-allowed":"pointer",
      width:full?"100%":undefined, transition:"all 0.18s", ...s,
    }}
    onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(0.97)"}}
    onMouseUp={e=>{e.currentTarget.style.transform="scale(1)"}}
    onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)"}}
    >{icon}{children}</button>
  );
};

const Badge = ({children,color=T.accent}) => (
  <span style={{
    background:`${color}18`, color, border:`1px solid ${color}40`,
    borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700,
    display:"inline-flex", alignItems:"center", gap:5,
  }}>{children}</span>
);

const PBar = ({value,max=11}) => {
  const pct = Math.round((value/max)*100);
  return (
    <div style={{height:5,background:T.card2,borderRadius:3,overflow:"hidden"}}>
      <div style={{
        height:"100%", width:`${pct}%`,
        background:`linear-gradient(90deg,${T.accentD},${T.accent})`,
        borderRadius:3, transition:"width 1.2s ease",
        boxShadow:`0 0 8px ${T.accent}60`,
      }}/>
    </div>
  );
};

const Toast = ({msg,type,onClose}) => {
  useEffect(()=>{if(msg){const t=setTimeout(onClose,4000);return()=>clearTimeout(t);}},[msg]);
  if(!msg) return null;
  const c = type==="success"?T.teal:type==="error"?T.danger:T.accent;
  return (
    <div style={{
      position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",
      background:T.card2, border:`1px solid ${c}50`, borderRadius:16,
      padding:"13px 20px", color:T.text, fontSize:14, zIndex:9998,
      boxShadow:`0 8px 32px rgba(0,0,0,0.5)`,
      display:"flex",alignItems:"center",gap:10,fontFamily:F,
      maxWidth:"90vw", animation:"su 0.3s ease",
    }}>
      {type==="success"?"✅":type==="error"?"❌":"ℹ️"} {msg}
    </div>
  );
};

const Modal = ({open,onClose,title,children}) => {
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:T.bg2,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",direction:"rtl",fontFamily:F,animation:"su 0.3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:T.bg2,padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:1}}>
          <button onClick={onClose} style={{background:T.card2,border:"none",color:T.text2,borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={16}/>
          </button>
          <span style={{fontSize:16,fontWeight:700,color:T.text}}>{title}</span>
          <div style={{width:34}}/>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  );
};

const Field = ({label,value,onChange,type="text",placeholder,icon,ltr,req}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:"block",fontSize:12.5,color:T.text2,marginBottom:7,fontWeight:600}}>{label}{req&&<span style={{color:T.accent}}> *</span>}</label>}
    <div style={{position:"relative"}}>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{
          width:"100%", background:T.card2, border:`1.5px solid ${T.border}`,
          borderRadius:14, padding:icon?"13px 44px 13px 16px":"13px 16px",
          color:T.text, fontSize:15, direction:ltr?"ltr":"rtl", textAlign:ltr?"left":"right",
          transition:"border-color 0.2s",
        }}
        onFocus={e=>e.target.style.borderColor=T.accent+"70"}
        onBlur={e=>e.target.style.borderColor=T.border}
      />
      {icon&&<span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:T.text3}}>{icon}</span>}
    </div>
  </div>
);

const SF = ({label,value,onChange,options}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:"block",fontSize:12.5,color:T.text2,marginBottom:7,fontWeight:600}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"13px 16px",color:T.text,fontSize:15,fontFamily:F}}>
      {options.map(([k,v])=><option key={k} value={k}>{v}</option>)}
    </select>
  </div>
);

/* ═══════════════════════ MAP ═══════════════════════ */
function LiveMap({lat=25,lng=55,originLat=29.76,originLng=-95.37}) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(()=>{
    if(inst.current||!ref.current) return;
    let alive=true;
    import("leaflet").then(L=>{
      if(!alive||!ref.current||inst.current) return;
      const map = L.map(ref.current,{zoomControl:false,attributionControl:false}).setView([25,30],2);
      inst.current=map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:18}).addTo(map);
      const mk=(color,s=14)=>L.divIcon({
        html:`<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color};"></div>`,
        className:"",iconAnchor:[s/2,s/2],
      });
      L.marker([originLat,originLng],{icon:mk("#22C55E")}).addTo(map).bindPopup("هيوستن، أمريكا");
      L.marker([lat,lng],{icon:mk(T.accent,20)}).addTo(map).bindPopup("الموقع الحالي").openPopup();
      L.marker([30.03,47.92],{icon:mk(T.teal)}).addTo(map).bindPopup("ميناء أم قصر");
      const r=L.polyline([[originLat,originLng],[lat,lng],[30.03,47.92]],{color:T.accent,weight:2,opacity:0.7,dashArray:"8,5"}).addTo(map);
      map.fitBounds(r.getBounds(),{padding:[30,30]});
    });
    return()=>{alive=false;if(inst.current){inst.current.remove();inst.current=null;}};
  },[lat,lng]);
  return <div ref={ref} style={{width:"100%",height:"100%",borderRadius:"inherit"}}/>;
}

/* ═══════════════════════ AUTH ═══════════════════════ */
function useAuth() {
  const [user,setUser]=useState(null);
  const [gSess,setGSess]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const id=getUID();
      if(id){const u=await dbGetById(id);if(u){setUser(u);setLoading(false);return;}}
      const s=await googleGetSession();
      if(s?.user){
        const ex=await dbGetByAuth(s.user.id);
        if(ex){saveUID(ex.id);setUser(ex);}
        else setGSess(s);
      }
      setLoading(false);
    })();
  },[]);

  const signIn=async(email,pass)=>{
    const u=await dbGetByEmail(email);
    if(!u) return{error:"لا يوجد حساب بهذا البريد"};
    const h=await sha256(pass+"::elite::"+email.trim().toLowerCase());
    if(h!==u.hash) return{error:"كلمة المرور غير صحيحة"};
    saveUID(u.id);setUser(u);return{};
  };

  const signUp=async(email,pass,name)=>{
    if(await dbGetByEmail(email)) return{error:"البريد مسجّل مسبقاً"};
    const hash=await sha256(pass+"::elite::"+email.trim().toLowerCase());
    const u=await dbCreateUser({email,name,hash});
    if(!u) return{error:"تعذّر إنشاء الحساب"};
    saveUID(u.id);setUser(u);return{};
  };

  const finishGoogle=async(name)=>{
    if(!gSess) return;
    const u=await dbCreateFromGoogle(gSess.user.id,gSess.user.email,
      name||gSess.user.user_metadata?.full_name||gSess.user.email?.split("@")[0]);
    if(u){saveUID(u.id);setUser(u);setGSess(null);}
  };

  const signOut=async()=>{clearUID();await googleSignOut();setUser(null);setGSess(null);};
  const startGoogle=async()=>{const ok=await googleSignIn();return ok?{}:{error:"تعذّر بدء تسجيل الدخول"};};

  return{user,loading,gSess,signIn,signUp,signOut,startGoogle,finishGoogle};
}

/* ═══════════════════════ SPLASH ═══════════════════════ */
function Splash({onDone}) {
  const [p,setP]=useState(0);
  useEffect(()=>{
    const i=setInterval(()=>setP(x=>{if(x>=100){clearInterval(i);setTimeout(onDone,400);return 100;}return x+3;}),50);
    return()=>clearInterval(i);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 50% 35%,${T.bg} 0%,${T.bg3} 70%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:F,direction:"rtl",zIndex:9999}}>
      <style>{G}</style>
      <div style={{animation:"glow 2s infinite"}}>
        <div style={{width:90,height:90,borderRadius:22,background:`linear-gradient(135deg,${T.accentD},${T.accent})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:GLOW,fontSize:46}}>🚢</div>
      </div>
      <div style={{marginTop:22,textAlign:"center"}}>
        <div style={{fontSize:34,fontWeight:900,color:T.text,letterSpacing:"-0.02em"}}>النخبة</div>
        <div style={{fontSize:11,color:T.accent,letterSpacing:"0.22em",marginTop:3,fontWeight:600}}>ELITE MOTORS</div>
      </div>
      <p style={{marginTop:18,fontSize:14,color:T.text3,textAlign:"center",maxWidth:260,lineHeight:1.9}}>
        نرافق سيارتك من المزاد حتى باب منزلك
      </p>
      <div style={{marginTop:44,width:180,height:3,background:T.card2,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${T.accentD},${T.accent})`,borderRadius:2,transition:"width 0.06s"}}/>
      </div>
    </div>
  );
}

/* ═══════════════════════ LOGIN ═══════════════════════ */
function LoginPage({auth}) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const [gBusy,setGBusy]=useState(false);
  const [toast,setToast]=useState({});

  const submit=async()=>{
    if(!email||!pass) return setToast({msg:"البريد وكلمة المرور مطلوبان",type:"error"});
    setBusy(true);
    const r=mode==="login"?await auth.signIn(email,pass):await auth.signUp(email,pass,name);
    if(r.error) setToast({msg:r.error,type:"error"});
    setBusy(false);
  };

  const google=async()=>{
    setGBusy(true);
    const r=await auth.startGoogle();
    if(r.error){setToast({msg:r.error,type:"error"});setGBusy(false);}
  };

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 50% 25%,${T.bg} 0%,${T.bg3} 65%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",direction:"rtl",fontFamily:F}}>
      <style>{G}</style>

      {/* Logo */}
      <div style={{marginBottom:36,animation:"fadeUp 0.5s ease"}}><Logo size={54}/></div>

      {/* Card */}
      <div style={{width:"100%",maxWidth:360,background:T.card,border:`1px solid ${T.border}`,borderRadius:24,padding:"28px 22px",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",animation:"fadeUp 0.5s 0.1s ease both",opacity:0}}>
        <h2 style={{fontSize:22,fontWeight:800,marginBottom:5,color:T.text}}>
          {mode==="login"?"تسجيل الدخول":"إنشاء حساب"}
        </h2>
        <p style={{fontSize:13,color:T.text2,marginBottom:24}}>
          {mode==="login"?"مرحباً بك في النخبة":"أنشئ حسابك الآن"}
        </p>

        {/* Google */}
        <button onClick={google} disabled={gBusy} style={{
          width:"100%",display:"flex",alignItems:"center",justifyContent:"center",
          gap:10,background:"#fff",color:"#3c4043",border:"none",borderRadius:14,
          padding:"13px",fontWeight:700,fontSize:14.5,cursor:"pointer",
          marginBottom:18,fontFamily:F,boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
        }}>
          {gBusy?<Sp s={18} c="#666"/>:(
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.2 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 40.6 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 35.9 44 30.4 44 24c0-1.4-.1-2.5-.4-3.5z"/>
            </svg>
          )}
          {gBusy?"جارٍ التحويل...":"الدخول بحساب Google"}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:12,margin:"0 0 18px"}}>
          <div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:12,color:T.text3}}>أو</span><div style={{flex:1,height:1,background:T.border}}/>
        </div>

        {mode==="register"&&<Field label="الاسم الكامل" value={name} onChange={setName} placeholder="محمد أحمد" req icon={<User size={16}/>}/>}
        <Field label="البريد الإلكتروني" value={email} onChange={setEmail} type="email" placeholder="example@email.com" icon={<Mail size={16}/>} ltr req/>
        <Field label="كلمة المرور" value={pass} onChange={setPass} type="password" placeholder="••••••••" icon={<Lock size={16}/>} ltr req/>

        <Btn onClick={submit} disabled={busy} full sz="lg">
          {busy?<Sp s={18} c="#1A2B2C"/>:mode==="login"?"تسجيل الدخول":"إنشاء الحساب"}
        </Btn>

        <p style={{textAlign:"center",marginTop:18,fontSize:14,color:T.text2}}>
          {mode==="login"?"ليس لديك حساب؟ ":"لديك حساب؟ "}
          <span style={{color:T.accent,cursor:"pointer",fontWeight:700}} onClick={()=>setMode(mode==="login"?"register":"login")}>
            {mode==="login"?"إنشاء حساب":"تسجيل الدخول"}
          </span>
        </p>
      </div>
      <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast({})}/>
    </div>
  );
}

/* ═══════════════════════ GOOGLE COMPLETE ═══════════════════════ */
function GoogleComplete({auth}) {
  const [name,setName]=useState(auth.gSess?.user?.user_metadata?.full_name||"");
  const [busy,setBusy]=useState(false);
  return (
    <div style={{minHeight:"100vh",background:T.bg3,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:F,direction:"rtl"}}>
      <style>{G}</style>
      <Card style={{width:"100%",maxWidth:360,padding:28}}>
        <Logo size={50}/>
        <h2 style={{marginTop:20,fontSize:20,fontWeight:800,color:T.text}}>خطوة أخيرة</h2>
        <p style={{color:T.text2,fontSize:13.5,marginBottom:22}}>مرتبط بـ {auth.gSess?.user?.email}</p>
        <Field label="الاسم الكامل" value={name} onChange={setName} placeholder="محمد أحمد" req icon={<User size={16}/>}/>
        <Btn onClick={async()=>{setBusy(true);await auth.finishGoogle(name);setBusy(false);}} disabled={busy||!name} full>
          {busy?<Sp s={16} c="#1A2B2C"/>:"إكمال التسجيل"}
        </Btn>
        <Btn v="ghost" onClick={auth.signOut} full style={{marginTop:10}} sz="sm">إلغاء</Btn>
      </Card>
    </div>
  );
}

/* ═══════════════════════ CLIENT APP ═══════════════════════ */
function ClientApp({auth}) {
  const [tab,setTab]=useState("home");
  const [cars,setCars]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState({});

  useEffect(()=>{loadCars();},[]);

  const loadCars=async()=>{
    setLoading(true);
    const{data}=await supabase
      .from("cars")
      .select("*,shipments(*),tracking_steps(*),car_images(*),car_videos(*),documents(*),notifications(*)")
      .eq("client_id",auth.user.id)
      .order("created_at",{ascending:false});
    setCars(data||[]);
    setLoading(false);
  };

  const TABS=[
    {id:"home",  icon:"🏠", label:"الرئيسية"},
    {id:"cars",  icon:"🚗", label:"سياراتي"},
    {id:"track", icon:"🧭", label:"تتبع"},
    {id:"docs",  icon:"📄", label:"المستندات"},
    {id:"profile",icon:"👤",label:"ملفي"},
  ];

  const car=cars[0]||null;
  const unread=cars.reduce((a,c)=>a+(c.notifications?.filter(n=>!n.read).length||0),0);

  return (
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg3,fontFamily:F,direction:"rtl"}}>
      <style>{G}</style>

      {/* Top Bar */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`${T.bg3}EE`,backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.border}`,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{position:"relative"}}>
          <button onClick={()=>setTab("notifs")} style={{background:T.card2,border:"none",color:T.text2,borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Bell size={19}/>
          </button>
          {unread>0&&<div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:T.danger,border:`2px solid ${T.bg3}`}}/>}
        </div>
        <Logo size={38}/>
        <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${T.accentD},${T.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#1A2B2C"}}>
          {(auth.user?.name||"؟")[0]}
        </div>
      </div>

      {/* Pages */}
      <div style={{paddingBottom:80}}>
        {loading?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px",flexDirection:"column",gap:16}}>
            <Sp s={36}/><p style={{color:T.text2,fontSize:14}}>جارٍ تحميل بياناتك...</p>
          </div>
        ):(
          <>
            {tab==="home"    &&<HomeTab    car={car} cars={cars} auth={auth} setTab={setTab}/>}
            {tab==="cars"    &&<CarsTab    cars={cars}/>}
            {tab==="track"   &&<TrackTab   car={car}/>}
            {tab==="docs"    &&<DocsTab    car={car}/>}
            {tab==="profile" &&<ProfileTab auth={auth} setToast={setToast}/>}
            {tab==="notifs"  &&<NotifsTab  car={car}/>}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{position:"fixed",bottom:0,right:0,left:0,maxWidth:430,margin:"0 auto",background:`${T.bg}FA`,backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom)",boxShadow:"0 -4px 20px rgba(0,0,0,0.4)"}}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px 8px",border:"none",background:"transparent",cursor:"pointer",color:active?T.accent:T.text3,transition:"all 0.18s"}}>
              <span style={{fontSize:21}}>{t.icon}</span>
              <span style={{fontSize:10,marginTop:4,fontWeight:active?700:400,fontFamily:F}}>{t.label}</span>
              {active&&<div style={{width:4,height:4,borderRadius:"50%",background:T.accent,marginTop:3}}/>}
            </button>
          );
        })}
      </nav>

      <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast({})}/>
    </div>
  );
}

/* ══════════ HOME ══════════ */
function HomeTab({car,cars,auth,setTab}) {
  const now=new Date().getHours();
  const greet=now<12?"صباح الخير":now<17?"مساء النور":"مساء الخير";
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <div style={{marginBottom:20}}>
        <p style={{fontSize:13,color:T.text2,marginBottom:2}}>{greet}،</p>
        <h1 style={{fontSize:26,fontWeight:800,color:T.text}}>{auth.user?.name}</h1>
        <p style={{fontSize:13,color:T.text3,marginTop:2}}>إليك نظرة عامة على سياراتك</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          [cars.length,"سيارات",T.accent,"🚗"],
          [cars.filter(c=>c.current_status>=5&&c.current_status<=8).length,"قيد الشحن",T.teal,"🚢"],
          [cars.filter(c=>c.current_status===11).length,"تم التسليم","#22C55E","✅"],
          [cars.reduce((a,c)=>a+(c.notifications?.filter(n=>!n.read).length||0),0),"إشعارات",T.warning,"🔔"],
        ].map(([v,l,c,ic],i)=>(
          <Card key={i} style={{padding:"12px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:2}}>{ic}</div>
            <div style={{fontSize:20,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
            <div style={{fontSize:10,color:T.text2,marginTop:3,lineHeight:1.3}}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Main car */}
      {car?(
        <Card glow style={{overflow:"hidden",marginBottom:18}}>
          <div style={{position:"relative",height:188}}>
            {car.main_image_url?(
              <img src={car.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            ):(
              <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${T.card2},${T.card})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Car size={64} color={T.text3}/>
              </div>
            )}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(26,43,44,0.97) 0%,transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:14,right:14,left:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <h3 style={{fontSize:17,fontWeight:800,marginBottom:3,color:T.text}}>{car.car_name}</h3>
                  <p style={{fontSize:11.5,color:T.text2}}>VIN: ...{car.vin?.slice(-6)||"------"}</p>
                </div>
                <Badge color={T.accent}>{STEPS[car.current_status-1]?.ar}</Badge>
              </div>
            </div>
          </div>
          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:T.text2}}>تقدم الشحنة</span>
              <span style={{fontSize:12,color:T.accent,fontWeight:700}}>{Math.round((car.current_status/11)*100)}%</span>
            </div>
            <PBar value={car.current_status}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              {[["تاريخ الشراء",car.purchase_date],["الوصول المتوقع",car.estimated_arrival]].map(([k,v])=>(
                <div key={k} style={{background:T.card2,borderRadius:12,padding:"10px 12px"}}>
                  <p style={{fontSize:10,color:T.text2,marginBottom:2}}>{k}</p>
                  <p style={{fontSize:13,fontWeight:700,color:T.text}}>{v||"—"}</p>
                </div>
              ))}
            </div>
            <Btn onClick={()=>setTab("track")} full style={{marginTop:14}} icon={<Compass size={16}/>}>تتبع الشحنة</Btn>
          </div>
        </Card>
      ):(
        <Card style={{padding:"36px 20px",textAlign:"center",marginBottom:18}}>
          <Car size={44} color={T.text3} style={{marginBottom:14}}/>
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:8,color:T.text}}>لا توجد سيارات</h3>
          <p style={{color:T.text2,fontSize:13.5,marginBottom:20}}>تواصل مع الشركة لإضافة سيارتك</p>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <Btn v="wa" icon={<MessageCircle size={16}/>}>تواصل على واتساب</Btn>
          </a>
        </Card>
      )}

      {/* Latest updates */}
      {cars.length>0&&(
        <>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:12,color:T.text}}>آخر التحديثات</h3>
          {cars.slice(0,3).map((c,i)=>(
            <Card key={i} style={{padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:52,height:44,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.card2}}>
                {c.main_image_url?<img src={c.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Car size={22} color={T.text3} style={{margin:"11px auto",display:"block"}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.text}}>{c.car_name}</p>
                <p style={{fontSize:11.5,color:T.text2,marginTop:2}}>VIN: ...{c.vin?.slice(-4)}</p>
              </div>
              <div style={{flexShrink:0,minWidth:60}}>
                <p style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:4,textAlign:"left"}}>{Math.round((c.current_status/11)*100)}%</p>
                <PBar value={c.current_status}/>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

/* ══════════ CARS ══════════ */
function CarsTab({cars}) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [detail,setDetail]=useState(null);

  const filtered=cars.filter(c=>{
    const q=search.toLowerCase();
    const match=!q||c.car_name?.toLowerCase().includes(q)||c.vin?.toLowerCase().includes(q)||c.order_number?.toLowerCase().includes(q);
    const st=filter==="all"||(filter==="ship"&&c.current_status>=5&&c.current_status<=8)||(filter==="done"&&c.current_status===11);
    return match&&st;
  });

  if(detail) return <VehicleDetail car={detail} onBack={()=>setDetail(null)}/>;

  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>سياراتي</h2>
        <span style={{fontSize:13,color:T.text2}}>{cars.length} سيارة</span>
      </div>

      <div style={{position:"relative",marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث عن سيارة أو VIN..."
          style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"12px 16px 12px 44px",color:T.text,fontSize:14,fontFamily:F}}/>
        <Search size={18} color={T.text3} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["all","الكل"],["ship","قيد الشحن"],["done","تم التسليم"]].map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{
            background:filter===k?T.accent:T.card, color:filter===k?"#1A2B2C":T.text2,
            border:"none", borderRadius:20, padding:"7px 16px", fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:F, transition:"all 0.2s",
          }}>{v}</button>
        ))}
      </div>

      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"50px 20px",color:T.text2}}>
          <Car size={40} color={T.text3} style={{marginBottom:12}}/>
          <p>لا توجد نتائج</p>
        </div>
      ):filtered.map((c,i)=>(
        <Card key={i} onClick={()=>setDetail(c)} style={{marginBottom:14,overflow:"hidden"}}>
          <div style={{display:"flex",gap:14,padding:14}}>
            <div style={{width:90,height:74,borderRadius:12,overflow:"hidden",flexShrink:0,background:T.card2}}>
              {c.main_image_url?<img src={c.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Car size={30} color={T.text3} style={{margin:"22px auto",display:"block"}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <h3 style={{fontSize:15,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"68%",color:T.text}}>{c.car_name}</h3>
                <Badge color={c.current_status===11?T.teal:T.accent}>{STEPS[c.current_status-1]?.ar}</Badge>
              </div>
              <p style={{fontSize:12,color:T.text2,marginBottom:8}}>VIN: ...{c.vin?.slice(-6)} · {c.year}</p>
              <PBar value={c.current_status}/>
              <p style={{fontSize:11,color:T.text3,marginTop:5}}>{Math.round((c.current_status/11)*100)}% · وصول: {c.estimated_arrival||"—"}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ══════════ VEHICLE DETAIL ══════════ */
function VehicleDetail({car,onBack}) {
  const [idx,setIdx]=useState(0);
  const imgs=car.car_images||[];
  return (
    <div className="fi">
      <div style={{position:"relative",height:260}}>
        {imgs.length>0?(
          <img src={imgs[idx]?.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        ):car.main_image_url?(
          <img src={car.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        ):(
          <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${T.card2},${T.card})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Car size={80} color={T.text3}/>
          </div>
        )}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(26,43,44,1) 0%,transparent 55%)"}}/>
        <button onClick={onBack} style={{position:"absolute",top:16,right:16,background:"rgba(26,43,44,0.7)",backdropFilter:"blur(10px)",border:"none",color:T.text,borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <ChevronRight size={20}/>
        </button>
        {imgs.length>1&&(
          <div style={{position:"absolute",bottom:68,right:14,display:"flex",gap:6}}>
            {imgs.slice(0,5).map((img,i)=>(
              <div key={i} onClick={()=>setIdx(i)} style={{width:38,height:32,borderRadius:8,overflow:"hidden",border:`2px solid ${i===idx?T.accent:"transparent"}`,cursor:"pointer"}}>
                <img src={img.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
            ))}
          </div>
        )}
        <div style={{position:"absolute",bottom:14,right:14,left:14}}>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:3,color:T.text}}>{car.car_name}</h2>
          <p style={{fontSize:12,color:T.text2}}>VIN: {car.vin} · {car.year}</p>
        </div>
      </div>

      <div style={{padding:"16px"}}>
        <Card style={{padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <Badge color={T.accent}>{STEPS[car.current_status-1]?.ar}</Badge>
            <span style={{fontSize:13,color:T.accent,fontWeight:700}}>{Math.round((car.current_status/11)*100)}%</span>
          </div>
          <PBar value={car.current_status}/>
        </Card>

        <Card style={{padding:16,marginBottom:14}}>
          <p style={{fontSize:13,fontWeight:700,color:T.text2,marginBottom:12}}>تفاصيل السيارة</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
            {[
              ["سنة الصنع",car.year],["المزاد","Copart"],
              ["المحرك",car.engine],["الدفع",car.drive_type],
              ["ناقل الحركة",car.transmission],["اللون",car.color],
              ["المسافة",car.mileage],["رقم الطلب",car.order_number],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:T.text3}}>{k}</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text,textAlign:"left"}}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {car.shipments?.[0]&&(
          <Card style={{padding:16,marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:700,color:T.text2,marginBottom:12}}>🚢 الشحنة</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                ["شركة الشحن",car.shipments[0].shipping_line],
                ["رقم الحاوية",car.shipments[0].container_number],
                ["من",car.shipments[0].origin_port],
                ["إلى",car.shipments[0].destination_port],
                ["الوصول",car.shipments[0].arrival_date],
              ].filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{background:T.card2,borderRadius:10,padding:"10px 12px"}}>
                  <p style={{fontSize:10,color:T.text3,marginBottom:2}}>{k}</p>
                  <p style={{fontSize:12.5,fontWeight:700,color:T.text}}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`استفسار عن ${car.order_number}`)}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
          <Btn v="wa" full icon={<MessageCircle size={16}/>}>تواصل بخصوص هذه السيارة</Btn>
        </a>
      </div>
    </div>
  );
}

/* ══════════ TRACK ══════════ */
function TrackTab({car}) {
  if(!car) return <Empty icon={Car} msg="لا توجد سيارة"/>;
  const ship=car.shipments?.[0];
  const steps=car.tracking_steps||[];

  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:T.text}}>تتبع الشحنة</h2>

      <Card style={{height:220,overflow:"hidden",marginBottom:14}}>
        <LiveMap lat={ship?.current_lat||25} lng={ship?.current_lng||55}/>
      </Card>

      {ship&&(
        <Card style={{padding:"14px 16px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:`${T.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ship size={18} color={T.accent}/>
            </div>
            <div>
              <p style={{fontWeight:700,fontSize:14,color:T.text}}>{ship.shipping_line||"—"}</p>
              <p style={{fontSize:12,color:T.text2}}>{ship.container_number||"—"}</p>
            </div>
            <div style={{marginRight:"auto"}}><Badge color={T.teal}>على السفينة</Badge></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["الميناء",ship.origin_port],["وصول متوقع",ship.arrival_date]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{background:T.card2,borderRadius:10,padding:"9px 12px"}}>
                <p style={{fontSize:10,color:T.text3,marginBottom:2}}>{k}</p>
                <p style={{fontSize:13,fontWeight:700,color:T.text}}>{v}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{padding:16}}>
        <p style={{fontSize:14,fontWeight:700,marginBottom:16,color:T.text}}>مراحل الشحنة</p>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",right:17,top:0,bottom:0,width:2,background:T.border}}/>
          {STEPS.map((s,i)=>{
            const db=steps.find(x=>x.step_number===s.n);
            const done=db?.completed||car.current_status>s.n;
            const active=s.n===car.current_status;
            return (
              <div key={i} style={{display:"flex",gap:14,marginBottom:18}}>
                <div style={{position:"relative",zIndex:2,flexShrink:0}}>
                  <div style={{
                    width:36,height:36,borderRadius:"50%",
                    background:done?`linear-gradient(135deg,${T.accentD},${T.accent})`:active?T.card2:T.card2,
                    border:active?`2px solid ${T.accent}`:`2px solid ${T.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
                    boxShadow:active?GLOW:"none",
                  }}>
                    {done?<Check size={15} color="#1A2B2C"/>:<span>{s.icon}</span>}
                  </div>
                </div>
                <div style={{flex:1,paddingTop:6}}>
                  <p style={{fontSize:14,fontWeight:done||active?700:400,color:active?T.accent:done?T.text:T.text2}}>{s.ar}</p>
                  {db?.completed_at&&<p style={{fontSize:11,color:T.text3,marginTop:2}}>{new Date(db.completed_at).toLocaleDateString("ar-IQ")}</p>}
                  {db?.notes&&<p style={{fontSize:12,color:T.text2,marginTop:3}}>{db.notes}</p>}
                  {active&&<Badge color={T.accent} style={{marginTop:6,display:"inline-flex"}}>الحالية</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ══════════ DOCS ══════════ */
function DocsTab({car}) {
  if(!car) return <Empty icon={FileText} msg="لا توجد مستندات"/>;
  const docs=car.documents||[];
  const DL={invoice:"فاتورة الشراء",bill_of_lading:"Bill of Lading",inspection:"تقرير الفحص",damage:"تقرير الأضرار",clearance:"التخليص الجمركي",other:"مستند"};
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:18,color:T.text}}>المستندات</h2>
      {docs.length===0?<Empty icon={FileText} msg="لا توجد مستندات"/>:docs.map((d,i)=>(
        <Card key={i} style={{padding:"14px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,borderRadius:12,background:`${T.accent}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>📄</div>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,fontSize:14.5,color:T.text,marginBottom:3}}>{d.name_ar||DL[d.doc_type]||d.name}</p>
            <p style={{fontSize:12,color:T.text2}}>PDF{d.file_size?` · ${d.file_size}`:""}</p>
          </div>
          <a href={d.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <button style={{background:T.card2,border:"none",color:T.text2,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Download size={16}/>
            </button>
          </a>
        </Card>
      ))}
    </div>
  );
}

/* ══════════ NOTIFS ══════════ */
function NotifsTab({car}) {
  const [notifs,setNotifs]=useState(car?.notifications||[]);
  const mark=async(id)=>{
    await supabase.from("notifications").update({read:true}).eq("id",id);
    setNotifs(n=>n.map(x=>x.id===id?{...x,read:true}:x));
  };
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:18,color:T.text}}>الإشعارات</h2>
      {notifs.length===0?<Empty icon={Bell} msg="لا توجد إشعارات"/>:notifs.map((n,i)=>(
        <Card key={i} onClick={()=>!n.read&&mark(n.id)} style={{padding:"14px 16px",marginBottom:12,display:"flex",gap:12,cursor:"pointer",opacity:n.read?0.7:1}}>
          <div style={{width:42,height:42,borderRadius:12,background:`${T.accent}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>🔔</div>
          <div style={{flex:1}}>
            <p style={{fontWeight:n.read?500:700,fontSize:14.5,color:T.text,marginBottom:3}}>{n.title}</p>
            <p style={{fontSize:13,color:T.text2,marginBottom:4}}>{n.message}</p>
            <p style={{fontSize:11,color:T.text3}}>{new Date(n.created_at).toLocaleString("ar-IQ")}</p>
          </div>
          {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:T.accent,flexShrink:0,marginTop:6}}/>}
        </Card>
      ))}
    </div>
  );
}

/* ══════════ PROFILE ══════════ */
function ProfileTab({auth,setToast}) {
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${T.accentD},${T.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,color:"#1A2B2C",margin:"0 auto 14px",boxShadow:GLOW}}>
          {(auth.user?.name||"؟")[0]}
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>{auth.user?.name}</h2>
        <p style={{fontSize:14,color:T.text2,marginTop:4}}>{auth.user?.email}</p>
        <Badge color={T.accent} style={{marginTop:8}}>عميل</Badge>
      </div>

      {[
        {icon:"💬",label:"تواصل على واتساب",color:"#25D366",fn:()=>window.open(`https://wa.me/${WA}`,"_blank")},
        {icon:"📧",label:"البريد الإلكتروني",color:T.accent,fn:()=>window.open("mailto:info@nukhba-motors.iq","_blank")},
        {icon:"🛡️",label:"الأمان والخصوصية",color:T.teal,fn:()=>setToast({msg:"قريباً",type:"info"})},
        {icon:"🔔",label:"إعدادات الإشعارات",color:T.warning,fn:()=>setToast({msg:"قريباً",type:"info"})},
      ].map((item,i)=>(
        <Card key={i} onClick={item.fn} style={{padding:"15px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
          <div style={{width:42,height:42,borderRadius:12,background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
          <span style={{flex:1,fontSize:15,fontWeight:600,color:T.text}}>{item.label}</span>
          <ChevronLeft size={18} color={T.text3}/>
        </Card>
      ))}

      <Card onClick={auth.signOut} style={{padding:"15px 16px",marginTop:8,display:"flex",alignItems:"center",gap:14,cursor:"pointer",borderColor:`${T.danger}30`}}>
        <div style={{width:42,height:42,borderRadius:12,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🚪</div>
        <span style={{flex:1,fontSize:15,fontWeight:600,color:T.danger}}>تسجيل الخروج</span>
      </Card>
    </div>
  );
}

const Empty = ({icon:Icon,msg}) => (
  <div style={{textAlign:"center",padding:"60px 20px"}}>
    <Icon size={44} color={T.text3} style={{marginBottom:14}}/>
    <p style={{color:T.text2,fontSize:15}}>{msg}</p>
  </div>
);

/* ═══════════════════════ ADMIN APP ═══════════════════════ */
function AdminApp({auth}) {
  const [tab,setTab]=useState("overview");
  const [toast,setToast]=useState({});
  const TABS=[
    {id:"overview",icon:"📊",label:"الرئيسية"},
    {id:"orders",  icon:"🚗",label:"الطلبات"},
    {id:"clients", icon:"👥",label:"العملاء"},
    {id:"add",     icon:"➕",label:"إضافة"},
    {id:"import",  icon:"📊",label:"Excel"},
  ];
  return (
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:T.bg3,fontFamily:F,direction:"rtl"}}>
      <style>{G}</style>
      <div style={{position:"sticky",top:0,zIndex:50,background:`${T.bg3}EE`,backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.border}`,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={auth.signOut} style={{background:T.card2,border:"none",color:T.text2,borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <LogOut size={18}/>
        </button>
        <Logo size={38}/>
        <div style={{background:`${T.danger}20`,border:`1px solid ${T.danger}40`,borderRadius:10,padding:"5px 12px"}}>
          <span style={{fontSize:11,color:T.danger,fontWeight:700}}>ADMIN</span>
        </div>
      </div>
      <div style={{paddingBottom:80}}>
        {tab==="overview"&&<AdminOverview/>}
        {tab==="orders"  &&<AdminOrders  setToast={setToast}/>}
        {tab==="clients" &&<AdminClients/>}
        {tab==="add"     &&<AdminAddCar  setToast={setToast}/>}
        {tab==="import"  &&<AdminImport  setToast={setToast}/>}
      </div>
      <nav style={{position:"fixed",bottom:0,right:0,left:0,maxWidth:430,margin:"0 auto",background:`${T.bg}FA`,backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom)"}}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px 8px",border:"none",background:"transparent",cursor:"pointer",color:active?T.accent:T.text3}}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <span style={{fontSize:10,marginTop:4,fontWeight:active?700:400,fontFamily:F}}>{t.label}</span>
              {active&&<div style={{width:4,height:4,borderRadius:"50%",background:T.accent,marginTop:3}}/>}
            </button>
          );
        })}
      </nav>
      <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast({})}/>
    </div>
  );
}

function AdminOverview() {
  const [cars,setCars]=useState([]);
  const [cnt,setCnt]=useState(0);
  useEffect(()=>{
    supabase.from("cars").select("*,nukhba_users:client_id(full_name)").order("created_at",{ascending:false}).limit(20).then(({data})=>data&&setCars(data));
    supabase.from("nukhba_users").select("id",{count:"exact"}).eq("role","client").then(({count})=>setCnt(count||0));
  },[]);
  const stats=[
    [cars.length,"السيارات",T.accent,"🚗"],
    [cnt,"العملاء",T.teal,"👥"],
    [cars.filter(c=>c.current_status>=5&&c.current_status<=8).length,"في الشحن",T.warning,"🌊"],
    [cars.filter(c=>c.current_status===11).length,"مُسلَّمة","#22C55E","✅"],
  ];
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:T.text}}>لوحة التحكم</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {stats.map(([v,l,c,ic],i)=>(
          <Card key={i} style={{padding:"18px 16px",textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:4}}>{ic}</div>
            <div style={{fontSize:30,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>{l}</div>
          </Card>
        ))}
      </div>
      <h3 style={{fontSize:15,fontWeight:700,marginBottom:12,color:T.text}}>آخر الطلبات</h3>
      {cars.slice(0,8).map((c,i)=>(
        <Card key={i} style={{padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:40,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.card2}}>
            {c.main_image_url?<img src={c.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Car size={20} color={T.text3} style={{margin:"10px auto",display:"block"}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.text}}>{c.car_name}</p>
            <p style={{fontSize:11.5,color:T.accent}}>{c.order_number}</p>
          </div>
          <Badge color={T.accent}>{STEPS[c.current_status-1]?.ar}</Badge>
        </Card>
      ))}
    </div>
  );
}

function AdminOrders({setToast}) {
  const [cars,setCars]=useState([]);
  const [sel,setSel]=useState(null);
  useEffect(()=>{load();},[]);
  const load=()=>supabase.from("cars").select("*,shipments(*)").order("created_at",{ascending:false}).then(({data})=>data&&setCars(data));
  const upStatus=async(id,status)=>{
    await supabase.from("cars").update({current_status:status}).eq("id",id);
    await supabase.from("tracking_steps").update({completed:true,completed_at:new Date().toISOString()}).eq("car_id",id).eq("step_number",status);
    setCars(c=>c.map(x=>x.id===id?{...x,current_status:status}:x));
    setToast({msg:"تم تحديث الحالة ✓",type:"success"});
  };
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:T.text}}>إدارة الطلبات</h2>
      {cars.map((c,i)=>(
        <Card key={i} style={{padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:46,height:40,borderRadius:10,overflow:"hidden",flexShrink:0,background:T.card2}}>
              {c.main_image_url?<img src={c.main_image_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Car size={20} color={T.text3} style={{margin:"10px auto",display:"block"}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.text}}>{c.car_name}</p>
              <p style={{fontSize:11.5,color:T.accent}}>{c.order_number}</p>
            </div>
            <button onClick={()=>setSel(sel===c.id?null:c.id)} style={{background:T.card2,border:"none",color:T.text2,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <MoreVertical size={16}/>
            </button>
          </div>
          <select value={c.current_status} onChange={e=>upStatus(c.id,parseInt(e.target.value))}
            style={{width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",color:T.text,fontSize:14,fontFamily:F}}>
            {STEPS.map(s=><option key={s.n} value={s.n}>{s.icon} {s.ar}</option>)}
          </select>
          {sel===c.id&&<AdminCarActions car={c} setToast={setToast} onDone={()=>{setSel(null);load();}}/>}
        </Card>
      ))}
    </div>
  );
}

function AdminCarActions({car,setToast}) {
  const [upl,setUpl]=useState(false);
  const [stage,setStage]=useState("auction");
  const [docName,setDocName]=useState("");
  const [notifT,setNotifT]=useState("");
  const [notifM,setNotifM]=useState("");
  const [lat,setLat]=useState(car.shipments?.[0]?.current_lat?.toString()||"");
  const [lng,setLng]=useState(car.shipments?.[0]?.current_lng?.toString()||"");
  const [note,setNote]=useState("");

  const upload=async(bucket,file,table,extra)=>{
    setUpl(true);
    const path=`${car.id}/${Date.now()}_${file.name}`;
    const{error}=await supabase.storage.from(bucket).upload(path,file);
    if(error){setToast({msg:"خطأ: "+error.message,type:"error"});setUpl(false);return;}
    const{data:{publicUrl}}=supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from(table).insert({car_id:car.id,url:publicUrl,...extra});
    setToast({msg:"تم الرفع ✓",type:"success"});
    setUpl(false);
  };

  const saveLoc=async()=>{
    if(!lat||!lng) return;
    const ex=car.shipments?.[0];
    if(ex) await supabase.from("shipments").update({current_lat:parseFloat(lat),current_lng:parseFloat(lng)}).eq("id",ex.id);
    else await supabase.from("shipments").insert({car_id:car.id,current_lat:parseFloat(lat),current_lng:parseFloat(lng)});
    setToast({msg:"تم تحديث الموقع ✓",type:"success"});
  };

  const saveNote=async()=>{
    if(!note) return;
    await supabase.from("tracking_steps").update({notes:note}).eq("car_id",car.id).eq("step_number",car.current_status);
    setToast({msg:"تم حفظ الملاحظة ✓",type:"success"});setNote("");
  };

  const sendNotif=async()=>{
    if(!notifT||!notifM) return setToast({msg:"أدخل العنوان والنص",type:"error"});
    await supabase.from("notifications").insert({client_id:car.client_id,car_id:car.id,title:notifT,message:notifM,type:"update"});
    setToast({msg:"تم إرسال الإشعار ✓",type:"success"});setNotifT("");setNotifM("");
  };

  return (
    <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginTop:12}}>
      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>📍 تحديث الموقع</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Field value={lat} onChange={setLat} placeholder="Lat" ltr/>
        <Field value={lng} onChange={setLng} placeholder="Lng" ltr/>
      </div>
      <Btn v="outline" sz="sm" onClick={saveLoc} style={{marginBottom:14}}>حفظ الموقع</Btn>

      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>📝 ملاحظة</p>
      <Field value={note} onChange={setNote} placeholder="ملاحظة..."/>
      <Btn v="outline" sz="sm" onClick={saveNote} style={{marginBottom:14}}>حفظ</Btn>

      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>🖼️ رفع صورة</p>
      <SF value={stage} onChange={setStage} options={[["auction","المزاد"],["post_purchase","بعد الشراء"],["transit","النقل"],["port","الميناء"],["loading","التحميل"],["arrival","الوصول"]]}/>
      <input type="file" accept="image/*" disabled={upl} onChange={e=>{const f=e.target.files?.[0];if(f)upload("car-images",f,"car_images",{stage});}} style={{color:T.text,fontSize:13,display:"block",marginBottom:14}}/>

      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>🎬 رفع فيديو</p>
      <input type="file" accept="video/*" disabled={upl} onChange={e=>{const f=e.target.files?.[0];if(f)upload("car-videos",f,"car_videos",{stage});}} style={{color:T.text,fontSize:13,display:"block",marginBottom:14}}/>

      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>📄 رفع مستند</p>
      <Field value={docName} onChange={setDocName} placeholder="اسم المستند"/>
      <input type="file" accept=".pdf,.doc,.docx" disabled={upl||!docName} onChange={e=>{const f=e.target.files?.[0];if(f&&docName)upload("documents",f,"documents",{name:f.name,name_ar:docName,doc_type:"other",file_size:`${Math.round(f.size/1024)} KB`});}} style={{color:T.text,fontSize:13,display:"block",marginBottom:14}}/>

      <p style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:8}}>🔔 إرسال إشعار</p>
      <Field value={notifT} onChange={setNotifT} placeholder="العنوان"/>
      <Field value={notifM} onChange={setNotifM} placeholder="النص..."/>
      <Btn v="teal" sz="sm" onClick={sendNotif} icon={<Send size={14}/>}>إرسال</Btn>
      {upl&&<p style={{color:T.accent,fontSize:12,marginTop:10,animation:"pulse 1s infinite"}}>جارٍ الرفع...</p>}
    </div>
  );
}

function AdminClients() {
  const [clients,setClients]=useState([]);
  useEffect(()=>{
    supabase.from("nukhba_users").select("*,cars(id)").eq("role","client").order("created_at",{ascending:false}).then(({data})=>data&&setClients(data));
  },[]);
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:T.text}}>العملاء</h2>
      {clients.map((c,i)=>(
        <Card key={i} style={{padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.accentD},${T.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#1A2B2C",flexShrink:0}}>
            {(c.full_name||"؟")[0]}
          </div>
          <div style={{flex:1}}>
            <p style={{fontWeight:700,fontSize:14.5,color:T.text}}>{c.full_name}</p>
            <p style={{fontSize:12,color:T.text2}}>{c.email}</p>
          </div>
          <Badge color={T.accent}>{c.cars?.length||0} سيارة</Badge>
        </Card>
      ))}
    </div>
  );
}

function AdminAddCar({setToast}) {
  const [clients,setClients]=useState([]);
  const [f,setF]=useState({client_id:"",car_name:"",model:"",year:"",color:"",vin:"",engine:"",drive_type:"",transmission:"",mileage:"",order_number:"",purchase_date:"",estimated_arrival:""});
  const [busy,setBusy]=useState(false);
  const sf=(k,v)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{supabase.from("nukhba_users").select("id,full_name").eq("role","client").then(({data})=>data&&setClients(data));},[]);
  const submit=async()=>{
    if(!f.client_id||!f.car_name||!f.order_number) return setToast({msg:"الحقول المطلوبة ناقصة",type:"error"});
    setBusy(true);
    const{data,error}=await supabase.from("cars").insert({...f,year:parseInt(f.year)||null,current_status:1}).select().single();
    if(error){setToast({msg:error.message,type:"error"});setBusy(false);return;}
    await supabase.from("tracking_steps").insert(STEPS.map(s=>({car_id:data.id,step_number:s.n,step_name_ar:s.ar,completed:false})));
    setToast({msg:"تم إضافة السيارة ✓",type:"success"});
    setF({client_id:"",car_name:"",model:"",year:"",color:"",vin:"",engine:"",drive_type:"",transmission:"",mileage:"",order_number:"",purchase_date:"",estimated_arrival:""});
    setBusy(false);
  };
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:18,color:T.text}}>إضافة سيارة</h2>
      <SF label="العميل *" value={f.client_id} onChange={v=>sf("client_id",v)} options={[["","اختر العميل..."],...clients.map(c=>[c.id,c.full_name])]}/>
      <Field label="رقم الطلب *" value={f.order_number} onChange={v=>sf("order_number",v)} placeholder="#EM-2024-001"/>
      <Field label="اسم السيارة *" value={f.car_name} onChange={v=>sf("car_name",v)} placeholder="Toyota Land Cruiser"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="الموديل" value={f.model} onChange={v=>sf("model",v)} placeholder="LC300"/>
        <Field label="السنة" value={f.year} onChange={v=>sf("year",v)} placeholder="2022"/>
        <Field label="اللون" value={f.color} onChange={v=>sf("color",v)} placeholder="أبيض"/>
        <Field label="VIN" value={f.vin} onChange={v=>sf("vin",v)} placeholder="JTMCY7..." ltr/>
        <Field label="المحرك" value={f.engine} onChange={v=>sf("engine",v)} placeholder="3.5L"/>
        <Field label="الدفع" value={f.drive_type} onChange={v=>sf("drive_type",v)} placeholder="4WD"/>
        <Field label="ناقل الحركة" value={f.transmission} onChange={v=>sf("transmission",v)} placeholder="أوتوماتيك"/>
        <Field label="المسافة" value={f.mileage} onChange={v=>sf("mileage",v)} placeholder="12,000"/>
      </div>
      <Field label="تاريخ الشراء" value={f.purchase_date} onChange={v=>sf("purchase_date",v)} type="date" ltr/>
      <Field label="الوصول المتوقع" value={f.estimated_arrival} onChange={v=>sf("estimated_arrival",v)} type="date" ltr/>
      <Btn onClick={submit} disabled={busy} full sz="lg" icon={<Plus size={18}/>} style={{marginTop:8}}>
        {busy?<Sp s={18} c="#1A2B2C"/>:"إضافة السيارة"}
      </Btn>
    </div>
  );
}

function AdminImport({setToast}) {
  const [clients,setClients]=useState([]);
  const [cid,setCid]=useState("");
  const [rows,setRows]=useState([]);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{supabase.from("nukhba_users").select("id,full_name").eq("role","client").then(({data})=>data&&setClients(data));},[]);
  const handleFile=e=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const wb=XLSX.read(ev.target.result,{type:"binary"});
      setRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""}));
    };
    reader.readAsBinaryString(file);
  };
  const importAll=async()=>{
    if(!cid||!rows.length) return setToast({msg:"اختر العميل والملف",type:"error"});
    setBusy(true);let ok=0;
    for(const r of rows){
      const{data}=await supabase.from("cars").insert({
        client_id:cid,
        order_number:r["رقم الطلب"]||r["order_number"]||`#EM-${Date.now()}`,
        car_name:r["اسم السيارة"]||r["car_name"]||"—",
        model:r["الموديل"]||r["model"]||"",
        year:parseInt(r["السنة"]||r["year"])||null,
        color:r["اللون"]||r["color"]||"",
        vin:r["VIN"]||r["vin"]||"",
        engine:r["المحرك"]||r["engine"]||"",
        purchase_date:r["تاريخ الشراء"]||null,
        estimated_arrival:r["الوصول المتوقع"]||null,
        current_status:1,
      }).select().single();
      if(data){
        await supabase.from("tracking_steps").insert(STEPS.map(s=>({car_id:data.id,step_number:s.n,step_name_ar:s.ar,completed:false})));
        ok++;
      }
    }
    setToast({msg:`تم استيراد ${ok} سيارة ✓`,type:"success"});
    setBusy(false);setRows([]);
  };
  return (
    <div style={{padding:"20px 16px"}} className="fu">
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:18,color:T.text}}>استيراد Excel</h2>
      <Card style={{padding:"14px 16px",marginBottom:16}}>
        <p style={{fontSize:12.5,color:T.text2,lineHeight:1.8}}>
          الأعمدة: <span style={{color:T.accent,fontWeight:700}}>رقم الطلب، اسم السيارة، الموديل، السنة، اللون، VIN، المحرك، تاريخ الشراء، الوصول المتوقع</span>
        </p>
      </Card>
      <SF label="العميل *" value={cid} onChange={setCid} options={[["","اختر العميل..."],...clients.map(c=>[c.id,c.full_name])]}/>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:12.5,color:T.text2,marginBottom:7,fontWeight:600}}>ملف Excel / CSV *</label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{color:T.text,fontSize:14}}/>
      </div>
      {rows.length>0&&(
        <>
          <Card style={{padding:"12px 16px",marginBottom:14}}>
            <p style={{fontSize:13,color:T.accent,fontWeight:700}}>معاينة: {rows.length} سجل</p>
          </Card>
          <Btn onClick={importAll} disabled={busy} full sz="lg" icon={<Upload size={18}/>}>
            {busy?<Sp s={18} c="#1A2B2C"/>:`استيراد ${rows.length} سيارة`}
          </Btn>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════ ROOT ═══════════════════════ */
export default function EliteApp() {
  const [splash,setSplash]=useState(true);
  const auth=useAuth();
  if(splash) return <Splash onDone={()=>setSplash(false)}/>;
  if(auth.loading) return (
    <div style={{position:"fixed",inset:0,background:T.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F}}>
      <style>{G}</style>
      <Sp s={44}/>
    </div>
  );
  if(auth.gSess) return <GoogleComplete auth={auth}/>;
  if(!auth.user) return <LoginPage auth={auth}/>;
  if(auth.user.role==="admin"||auth.user.role==="employee") return <AdminApp auth={auth}/>;
  return <ClientApp auth={auth}/>;
}
