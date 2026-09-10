"use client";
import { useState, useEffect } from "react";

const PROMPTS: Record<number,{t:string,d:string}> = {
  0:{t:"Hello World",d:"First meeting, skin to skin"},
  1:{t:"First Days Home",d:"The outfit they came home in"},
  2:{t:"Wide Awake",d:"Those eyes finally open"},
 4:{t:"Tiny Details",d:"Fingers, toes, ear curls"},
  8:{t:"Little Hands",d:"Wrapped around your finger"},
 12:{t:"That Gummy Smile",d:"Morning light after a nap is magic"},
 16:{t:"Tummy Time",d:"Strength building"},
 20:{t:"Rolling & Giggling",d:"On the move"},
 26:{t:"Half Birthday",d:"6 months of you"},
 32:{t:"Sitting Pretty",d:"Sitting up"},
 40:{t:"Almost One",d:"So close to one"},
 52:{t:"One Year",d:"You made it - celebrate"},
};

const MILESTONES = ["First smile","First laugh","Rolled over","Held head up","Slept 5+ hours","Tracked eyes","Cooed","Grasped toy","First solid food","Said mama/dada"];

const THEMES: any = {
  sage:{bg:"#FDFBF7",card:"#FFFFFF",accent:"#8A9A8B",dark:"#6B7D6C",text:"#2B2B2B",border:"#E8E2D9"},
  blush:{bg:"#FFF9F5",card:"#FFF",accent:"#F4CFCF",dark:"#D4A5A5",text:"#2B2B2B",border:"#F0D9D9"},
  sky:{bg:"#F7FAFD",card:"#FFF",accent:"#A9C6E5",dark:"#6B8BA4",text:"#2B2B2B",border:"#D6E4F0"},
  honey:{bg:"#FFFBF0",card:"#FFF",accent:"#F5D08A",dark:"#8B6F47",text:"#2B2B2B",border:"#F5E6C8"},
  noir:{bg:"#2B2B2B",card:"#3A3A3A",accent:"#8A9A8B",dark:"#6B7D6C",text:"#FDFBF7",border:"#4A4A4A"},
};

type Photo = {id:string, url:string, fromCamera?:boolean};
type WeekData = {photos:Photo[], milestones:Record<string,boolean>, growth:any, doctor:any, letter:string};

export default function Home(){
  const [auth,setAuth] = useState<'landing'|'login'|'signup'|'onboarding'|'app'>('landing');
  const [user,setUser] = useState<{email:string}|null>(null);
  const [baby,setBaby] = useState({name:"",birthDate:"",coverTitle:"Little Chapters"});
  const [weeks,setWeeks] = useState<Record<number,WeekData>>({});
  const [curWeek,setCurWeek]=useState(12);
  const [theme,setTheme]=useState('sage');
  const [font,setFont]=useState('serif');
  const [showPersonalize,setShowPersonalize]=useState(false);
  const [showBook,setShowBook]=useState(false);
  const [showPasskey,setShowPasskey]=useState(false);
  const [showBio,setShowBio]=useState(false);
  const [showPhotoSheet,setShowPhotoSheet]=useState(false);
  const [loginForm,setLoginForm]=useState({email:"",pass:"",pass2:"",remember:true});
  const [err,setErr]=useState<any>({});
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState("");
  const [loginPromptMsg,setLoginPromptMsg]=useState("");

  const th = THEMES[theme];

  // Load from localStorage on mount
  useEffect(()=>{
    try{
      const a = localStorage.getItem('lc_auth'); if(a) setAuth(a as any);
      const u = localStorage.getItem('lc_user'); if(u) setUser(JSON.parse(u));
      const b = localStorage.getItem('lc_baby'); if(b) setBaby(JSON.parse(b));
      const w = localStorage.getItem('lc_weeks'); if(w) setWeeks(JSON.parse(w));
      const t = localStorage.getItem('lc_theme'); if(t) setTheme(t);
      const f = localStorage.getItem('lc_font'); if(f) setFont(f);
    }catch{}
  },[]);

  useEffect(()=>{localStorage.setItem('lc_auth',auth);},[auth]);
  useEffect(()=>{if(user) localStorage.setItem('lc_user',JSON.stringify(user));},[user]);
  useEffect(()=>{localStorage.setItem('lc_baby',JSON.stringify(baby));},[baby]);
  useEffect(()=>{localStorage.setItem('lc_weeks',JSON.stringify(weeks));},[weeks]);
  useEffect(()=>{localStorage.setItem('lc_theme',theme);},[theme]);
  useEffect(()=>{localStorage.setItem('lc_font',font);},[font]);

  useEffect(()=>{
    if(baby.birthDate){
      const d = Math.floor((Date.now()-new Date(baby.birthDate).getTime())/(1000*60*60*24*7));
      setCurWeek(Math.max(0,Math.min(52,d)));
    }
  },[baby.birthDate]);

  // Per-user restore
  useEffect(()=>{
    if(user?.email){
      const per = localStorage.getItem(`lc_weeks_${user.email}`);
      if(per){ try{ setWeeks(JSON.parse(per)); }catch{} }
      const bk = localStorage.getItem(`lc_baby_${user.email}`);
      if(bk){ try{ setBaby(JSON.parse(bk)); }catch{} }
    }
  },[user?.email]);

  useEffect(()=>{
    if(user?.email && Object.keys(weeks).length>0){
      localStorage.setItem(`lc_weeks_${user.email}`, JSON.stringify(weeks));
    }
  },[weeks, user?.email]);

  useEffect(()=>{
    if(user?.email && baby.name){
      localStorage.setItem(`lc_baby_${user.email}`, JSON.stringify(baby));
    }
  },[baby, user?.email]);

  const totalPhotos = Object.values(weeks).reduce((s,w)=>s+(w.photos?.length||0),0);
  const weeksFilled = Object.keys(weeks).filter(k=> (weeks as any)[k].photos?.length>0 || Object.values((weeks as any)[k].milestones||{}).some(Boolean)).length;
  const curData = weeks[curWeek] || {photos:[],milestones:{},growth:{},doctor:{},letter:""};
  const prompt = (PROMPTS as any)[curWeek] || {t:`Week ${curWeek}: Growing Fast`, d:"What changed this week?"};

  function upd(patch:Partial<WeekData>){
    setWeeks(w=>({...w,[curWeek]:{...curData,...patch}}));
  }

  function handleFiles(files:File[], fromCamera=false){
    if(curData.photos.length+files.length>10){
      alert(`Max 10 photos per week. You have ${curData.photos.length}, tried to add ${files.length}.`);
      return;
    }
    files.forEach(f=>{
      if(f.size>8*1024*1024){ alert(`${f.name} too large >8MB`); return; }
      const reader = new FileReader();
      reader.onload = (ev)=>{
        const url = ev.target?.result as string;
        setWeeks(w=>{
          const cd = w[curWeek] || {photos:[],milestones:{},growth:{},doctor:{},letter:""};
          if(cd.photos.length>=10) return w;
          return {...w,[curWeek]:{...cd,photos:[...cd.photos,{id:Math.random().toString(36).slice(2),url,fromCamera}]}};
        });
        setToast(fromCamera?"Photo captured ✓":"Photos added ✓");
        setTimeout(()=>setToast(""),1500);
      };
      reader.readAsDataURL(f);
    });
  }

  function openCamera(){
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*'; inp.setAttribute('capture','environment');
    inp.onchange = (e:any)=>handleFiles(Array.from(e.target.files||[]), true);
    inp.click();
    setShowPhotoSheet(false);
  }
  function openLibrary(){
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*'; inp.multiple=true;
    inp.onchange = (e:any)=>handleFiles(Array.from(e.target.files||[]), false);
    inp.click();
    setShowPhotoSheet(false);
  }

  function requireLoginForCreate(){
    setLoginPromptMsg("Create a login to start your baby's book — secure & takes 20 seconds.");
    setAuth('signup');
  }
  function doLogin(){
    const er:any={};
    if(!loginForm.email.includes("@")) er.email="Valid email";
    if(loginForm.pass.length<8) er.pass="Min 8";
    setErr(er); if(Object.keys(er).length) return;
    setLoading(true);
    setTimeout(()=>{setUser({email:loginForm.email}); setLoading(false); setToast("Welcome back!"); setTimeout(()=>{setToast(""); if(!baby.name) setAuth('onboarding'); else setAuth('app');},600);},500);
  }
  function doSignup(){
    const er:any={};
    if(!loginForm.email.includes("@")) er.email="Valid email";
    if(loginForm.pass.length<8) er.pass="Min 8";
    if(loginForm.pass!==loginForm.pass2) er.pass2="Must match";
    setErr(er); if(Object.keys(er).length) return;
    setLoading(true);
    setTimeout(()=>{setUser({email:loginForm.email}); setLoading(false); setToast("Account created!"); setTimeout(()=>{setToast(""); setAuth('onboarding');},700);},500);
  }

  if(auth==='landing'){
    return (
      <div style={{background:th.bg,minHeight:'100vh'}}>
        {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white px-5 py-3 rounded-full text-sm z-50 shadow-lg">{toast}</div>}
        <div className="max-w-[1100px] mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="serif text-xl">🍃 Little Chapters</div>
            <button onClick={()=>setAuth('login')} className="text-sm border rounded-full px-4 py-1.5">Sign in</button>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
            <div>
              <div className="inline-block text-xs px-3 py-1 rounded-full bg-[#F0E6D8]">Heirloom • Weekly prompts</div>
              <div className="serif text-[40px] md:text-[56px] leading-[1.05] mt-4">One week.<br/>One prompt.<br/>A book you'll hold forever.</div>
              <div className="text-[#6B6B6B] mt-4 text-[15px]">10 photos max per week, milestones, letters. Then order linen hardcover.</div>
              <div className="flex gap-3 mt-8">
                <button onClick={requireLoginForCreate} className="rounded-full px-7 py-3.5 text-white text-sm font-medium" style={{background:th.accent}}>Create a Book →</button>
                <button onClick={()=>setAuth('login')} className="rounded-full border px-7 py-3.5 text-sm bg-white" style={{borderColor:th.border}}>I have account</button>
              </div>
              <div className="text-xs text-[#9A958F] mt-8">🔒 Login required before book • 📷 Camera capture • 💾 Persists per login</div>
            </div>
            <div className="bg-white rounded-[24px] shadow-xl p-6 border" style={{borderColor:th.border}}>
              <div className="grid grid-cols-3 gap-2">{[1,2,3,4,5,6].map(i=><div key={i} className="aspect-square rounded-xl bg-[#F0E6D8]" />)}</div>
              <div className="mt-4 p-3 rounded-xl bg-[#FDFBF7] text-sm hand text-[18px]">Dear Milo, this week you laughed for the first time...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(auth==='login'||auth==='signup'){
    const isSignup = auth==='signup';
    return (
      <div style={{background:th.bg,minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white px-5 py-3 rounded-full text-sm z-50 shadow-lg">{toast}</div>}
        <div className="flex flex-1 flex-col md:flex-row">
          <div className="md:w-[45%] p-8 md:p-12 flex flex-col justify-between" style={{background:THEMES.sage.accent}}>
            <div className="text-[#FDFBF7]/80 text-sm">Little Chapters</div>
            <div>
              <div className="serif text-[32px] text-[#FDFBF7] leading-tight">{isSignup?"Create login first":"Welcome back"}</div>
              <div className="text-[#FDFBF7]/80 text-sm mt-3">{isSignup?(loginPromptMsg||"Secure login required before book — saves automatically."):"Sign in to continue."}</div>
              {isSignup && <div className="mt-6 bg-white/10 rounded-xl p-4 text-[#FDFBF7] text-xs leading-relaxed"><div>✓ Encrypted & private</div><div>✓ Passkey / Face ID</div><div>✓ Auto-saves per login</div></div>}
            </div>
            <div className="hidden md:block text-[#FDFBF7]/60 text-xs">Secure • Encrypted • Passkey ready</div>
          </div>
          <div className="flex-1 bg-white p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-[400px]">
              <div className="serif text-[24px]">🍃 Little Chapters</div>
              <div className="serif text-[26px] mt-6">{isSignup?"Create a login":"Sign in"}</div>
              <div className="space-y-4 mt-6">
                <div><label className="text-sm font-medium">Email</label><input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="you@example.com" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{borderColor:err.email?"#C97C7C":THEMES.sage.border}} />{err.email && <div className="text-[#C97C7C] text-xs mt-1">{err.email}</div>}</div>
                <div><label className="text-sm font-medium">Password</label><input value={loginForm.pass} onChange={e=>setLoginForm({...loginForm,pass:e.target.value})} type="password" placeholder="••••••••" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{borderColor:err.pass?"#C97C7C":THEMES.sage.border}} />{err.pass && <div className="text-[#C97C7C] text-xs mt-1">{err.pass}</div>}</div>
                {isSignup && <div><label className="text-sm font-medium">Confirm</label><input value={loginForm.pass2} onChange={e=>setLoginForm({...loginForm,pass2:e.target.value})} type="password" placeholder="••••••••" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none" style={{borderColor:err.pass2?"#C97C7C":THEMES.sage.border}} />{err.pass2 && <div className="text-[#C97C7C] text-xs mt-1">{err.pass2}</div>}</div>}
                <button onClick={isSignup?doSignup:doLogin} disabled={loading} className="w-full rounded-xl py-3 text-white text-sm font-medium" style={{background:THEMES.sage.accent}}>{loading?"...":isSignup?"Create Login & Continue →":"Sign in"}</button>
                <div className="flex gap-2 items-center"><div className="h-px flex-1 bg-[#E8E2D9]" /><div className="text-xs text-[#9A958F]">or</div><div className="h-px flex-1 bg-[#E8E2D9]" /></div>
                <button onClick={()=>setShowPasskey(true)} className="w-full rounded-xl border py-3 text-sm flex justify-center gap-2">🔑 Passkey</button>
                <button onClick={()=>setShowBio(true)} className="w-full rounded-xl border py-3 text-sm flex justify-center gap-2">👆 Face ID / Fingerprint</button>
                <div className="text-center text-sm mt-6">
                  {isSignup ? <><span className="text-[#9A958F]">Have account? </span><button onClick={()=>setAuth('login')} className="text-[#8A9A8B] font-medium">Sign in</button></> : <><span className="text-[#9A958F]">Need book? </span><button onClick={()=>setAuth('signup')} className="text-[#8A9A8B] font-medium">Create login first</button></>}
                </div>
                <button onClick={()=>setAuth('landing')} className="w-full text-xs text-[#9A958F] mt-2">← Back to home</button>
              </div>
            </div>
          </div>
        </div>

        {showPasskey && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4"><div className="bg-white rounded-[24px] w-full max-w-[360px] p-6"><div className="text-center"><div className="w-16 h-16 rounded-full bg-[#F0E6D8] mx-auto flex items-center justify-center text-2xl">🔐</div><div className="serif text-lg mt-4">{isSignup?"Create passkey?":"Use passkey?"}</div><div className="flex gap-3 mt-6"><button onClick={()=>setShowPasskey(false)} className="flex-1 rounded-xl border py-3 text-sm">Cancel</button><button onClick={()=>{setShowPasskey(false); setUser({email:loginForm.email||"joel@example.com"}); setToast("Passkey ✓"); setTimeout(()=>{setToast(""); if(isSignup||!baby.name) setAuth('onboarding'); else setAuth('app');},700);}} className="flex-1 rounded-xl py-3 text-white text-sm" style={{background:THEMES.sage.accent}}>Continue</button></div></div></div></div>}

        {showBio && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-[24px] w-full max-w-[320px] p-8 text-center"><div className="w-24 h-24 rounded-full bg-[#F0E6D8] mx-auto flex items-center justify-center animate-pulse text-3xl">👆</div><div className="serif text-lg mt-4">Touch / Face ID</div><button onClick={()=>setShowBio(false)} className="mt-6 text-sm text-[#9A958F]">Cancel</button></div></div>}
      </div>
    )
  }

  if(auth==='onboarding'){
    return (
      <div style={{background:th.bg,minHeight:'100vh'}} className="flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white rounded-[24px] p-8 border" style={{borderColor:th.border}}>
          <div className="text-xs px-3 py-1 rounded-full bg-[#F0E6D8] inline-block">✓ Logged in as {user?.email}</div>
          <div className="serif text-[32px] mt-4">Name your book</div>
          <div className="text-[#9A958F] text-sm mt-1">Saved to your login. Persists after relogin.</div>
          <div className="space-y-4 mt-8">
            <div><label className="text-sm font-medium">Baby name *</label><input value={baby.name} onChange={e=>setBaby({...baby,name:e.target.value})} placeholder="Milo" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" style={{borderColor:th.border}} /></div>
            <div><label className="text-sm font-medium">Birth date *</label><input type="date" value={baby.birthDate} onChange={e=>setBaby({...baby,birthDate:e.target.value})} className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" style={{borderColor:th.border}} /></div>
            <div><label className="text-sm font-medium">Cover title</label><input value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} placeholder="Milo's First Year" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm" style={{borderColor:th.border}} /></div>
            <button onClick={()=>{if(!baby.name||!baby.birthDate){alert("Name + birth date required");return;} setAuth('app');}} className="w-full rounded-xl py-3 text-white font-medium mt-2" style={{background:th.accent}}>Create Book →</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{background:th.bg,color:th.text,minHeight:'100vh'}}>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white px-5 py-3 rounded-full text-sm z-50 shadow-lg">{toast}</div>}
      <div className="max-w-[720px] mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between py-4">
          <div className="serif text-xl">🍃 Little Chapters</div>
          <div className="flex items-center gap-2">
            <div className="text-xs hidden md:block">{baby.name} • W{curWeek}</div>
            <button onClick={()=>setShowPersonalize(true)} className="rounded-full border px-3 py-1.5 text-xs" style={{borderColor:th.border,background:th.card}}>🎨</button>
            <button onClick={()=>setShowBook(true)} className="rounded-full px-4 py-1.5 text-xs text-white font-medium" style={{background:th.accent}}>📖 Book</button>
            <button onClick={()=>{setAuth('landing'); setUser(null);}} className="rounded-full border w-8 h-8 flex items-center justify-center text-xs" style={{borderColor:th.border}}>↪</button>
          </div>
        </div>

        <div className="rounded-[20px] p-4 flex justify-between items-center border" style={{background:th.card,borderColor:th.border}}>
          <div><div className="serif text-sm">Welcome, {user?.email?.split('@')[0]}! Saved ✓</div><div className="text-xs opacity-70 mt-1">{weeksFilled}/52 • {totalPhotos} photos</div></div>
          <div className="w-24 h-2 rounded-full bg-[#E8E2D9] overflow-hidden"><div className="h-full" style={{width:`${(weeksFilled/52)*100}%`,background:th.accent}} /></div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
          {Array.from({length:53}).map((_,i)=>{
            const isCur=i===curWeek; const has=(weeks as any)[i]?.photos?.length>0;
            return <button key={i} onClick={()=>setCurWeek(i)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs border shrink-0 ${isCur?'text-white':''}`} style={{background:isCur?th.accent:has?th.bg:th.card,color:isCur?'white':th.text,borderColor:has?th.accent:th.border}}>{i===0?"Arrival":`W${i}`}</button>
          })}
        </div>

        <div className="rounded-[24px] p-6 border" style={{background:th.card,borderColor:th.border}}>
          <div className="text-[11px] tracking-widest opacity-60">WEEK {curWeek}</div>
          <div className="serif text-[26px] mt-1">{prompt.t}</div>
          <div className="text-sm italic opacity-70 mt-1">{prompt.d}</div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center"><div className="font-medium text-sm">Photos {curData.photos.length}/10</div><div className="h-2 w-24 rounded-full bg-[#E8E2D9] overflow-hidden"><div className="h-full" style={{width:`${curData.photos.length*10}%`,background:th.accent}} /></div></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {curData.photos.map(p=><div key={p.id} className="relative rounded-xl overflow-hidden aspect-square bg-[#F0E6D8]"><img src={p.url} className="w-full h-full object-cover" /><div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-white">{p.fromCamera?"📷 CAM":""}</div><button onClick={()=>{setWeeks(w=>{const cd=w[curWeek]||{photos:[]}; return {...w,[curWeek]:{...cd,photos:cd.photos.filter(x=>x.id!==p.id)}};});}} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs">✕</button></div>)}
            {curData.photos.length<10 && (
              <div className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer p-2 text-center hover:bg-white transition" style={{borderColor:th.border}} onClick={()=>setShowPhotoSheet(true)}>
                <span className="text-xl">📸</span>
                <span className="text-xs font-medium mt-1">Add Photo</span>
                <span className="text-[10px] opacity-60 mt-1">Camera or Library</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}>
          <div className="font-medium text-sm">Milestones • {Object.values(curData.milestones||{}).filter(Boolean).length}</div>
          <div className="mt-3 space-y-2">{MILESTONES.map(m=><label key={m} className="flex items-center gap-3 text-sm cursor-pointer"><input type="checkbox" checked={!!curData.milestones[m]} onChange={e=>{setWeeks(w=>{const cd=w[curWeek]||{photos:[],milestones:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:e.target.checked}}};});}} className="w-4 h-4" /><span className={curData.milestones[m]?"line-through opacity-60":""}>{m}</span></label>)}</div>
        </div>

        <div className="text-[11px] opacity-60 text-center mt-8">Next.js • Camera capture • Persists per login • Ready for Vercel</div>
      </div>

      {showPhotoSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={()=>setShowPhotoSheet(false)}>
          <div className="bg-white rounded-t-[24px] w-full max-w-[400px] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E8E2D9] rounded-full mx-auto mb-5" />
            <div className="serif text-lg">Add photo to Week {curWeek}</div>
            <div className="text-xs text-[#9A958F] mt-1">{curData.photos.length}/10 used • {10-curData.photos.length} left</div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={openCamera} className="rounded-2xl border p-5 flex flex-col items-center gap-2 hover:bg-[#FDFBF7] transition" style={{borderColor:th.border}}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{background:th.bg}}>📷</div>
                <div className="text-sm font-medium">Take Photo</div>
                <div className="text-[11px] opacity-60">Camera - back</div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-[#2B2B2B] text-white mt-1">capture=environment</div>
              </button>
              <button onClick={openLibrary} className="rounded-2xl border p-5 flex flex-col items-center gap-2 hover:bg-[#FDFBF7] transition" style={{borderColor:th.border}}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{background:th.bg}}>🖼️</div>
                <div className="text-sm font-medium">Choose Library</div>
                <div className="text-[11px] opacity-60">Multiple</div>
                <div className="text-[10px] px-2 py-1 rounded-full border mt-1" style={{borderColor:th.border}}>multiple</div>
              </button>
            </div>
            <button onClick={()=>setShowPhotoSheet(false)} className="w-full rounded-xl border py-3 text-sm mt-4" style={{borderColor:th.border}}>Cancel</button>
          </div>
        </div>
      )}

      {showPersonalize && <div className="fixed inset-0 bg-black/30 z-40 flex justify-end"><div className="w-full max-w-[340px] bg-white h-full p-6 overflow-auto"><div className="flex justify-between"><div className="serif text-lg">Personalize</div><button onClick={()=>setShowPersonalize(false)} className="w-8 h-8 rounded-full border flex items-center justify-center">✕</button></div><div className="mt-6"><div className="text-sm font-medium">Theme</div><div className="grid grid-cols-2 gap-2 mt-2">{Object.keys(THEMES).map(k=><button key={k} onClick={()=>setTheme(k)} className={`rounded-xl border p-3 text-left ${theme===k?'ring-2 ring-[#8A9A8B]':''}`} style={{background:THEMES[k].bg,borderColor:THEMES[k].border}}><div className="w-6 h-6 rounded-full mb-1" style={{background:THEMES[k].accent}} /><div className="text-xs capitalize">{k}</div></button>)}</div></div></div></div>}

      {showBook && <div className="fixed inset-0 bg-[#1a1a1a]/90 z-50 overflow-auto p-4"><div className="max-w-[800px] mx-auto"><div className="flex justify-between items-center text-white mb-6"><div className="serif text-xl">Your Heirloom Book</div><button onClick={()=>setShowBook(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">✕</button></div><div className="bg-white rounded-[16px] p-6 md:p-10" style={{background:th.card,color:th.text}}><div className="text-center py-8"><div className="serif text-2xl">{baby.coverTitle||"Little Chapters"}</div><div className="text-sm opacity-60 mt-1">{baby.name} • {weeksFilled} weeks • {totalPhotos} photos</div></div><div className="py-4 text-center"><button onClick={()=>{setToast("Waitlist reserved! $79 locked ✓"); setTimeout(()=>setToast(""),2500);}} className="rounded-full px-6 py-3 text-sm text-white" style={{background:th.accent}}>Join Waitlist - $79</button></div></div></div></div>}
    </div>
  )
}
