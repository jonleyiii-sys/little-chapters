
"use client";
import { useState, useEffect, useMemo } from "react";

type Photo = {id:string, url:string, date:string, fromCamera?:boolean};
type MilestoneEntry = {checked:boolean; date:string; details:string};
type PromptDone = {done:boolean; date:string};
type WeekData = {photos:Photo[], milestones:Record<string,MilestoneEntry>, letter:string, promptsDone:Record<string,PromptDone>};

function getPrompts(week:number){
  const all = [
    {t:"First Hours", d:"Skin-to-skin, bracelet, footprints", tip:"Window light"},
    {t:"Name Story", d:"Why you chose name, meaning", tip:"Birth stats card"},
    {t:"Tiny Details", d:"Fingers, toes, ear curls", tip:"Macro mode"},
    {t:"Homecoming", d:"Outfit, car seat, front door", tip:"Siblings reaction"},
    {t:"One Month", d:"Same blanket monthly", tip:"Same spot"},
    {t:"Social Smile", d:"Gummy smile emerging", tip:"After nap"},
    {t:"Tummy Time", d:"Neck strength, push-ups", tip:"Mirror front"},
    {t:"Two Months", d:"Milestone photo", tip:"Same setup"},
    {t:"Three Months", d:"Personality emerging", tip:"Monthly"},
    {t:"First Laugh", d:"Giggle, belly laugh", tip:"Tickle feet"},
    {t:"Four Months", d:"Rolling? Drool? New sounds", tip:"Same blanket"},
    {t:"Sitting Support", d:"Boppy, high chair", tip:"Pillows around"},
    {t:"Six Months", d:"Half birthday celebration", tip:"Half cake"},
    {t:"First Solids", d:"Purees, faces, mess", tip:"Embrace mess"},
    {t:"Crawling", d:"First crawl", tip:"Baby gate"},
    {t:"Eight Months", d:"Busy, curious", tip:"Monthly"},
    {t:"Cruising", d:"Side-stepping couch", tip:"Clear path"},
    {t:"Nine Months", d:"Almost toddler", tip:"Monthly"},
    {t:"One Year", d:"Official portrait", tip:"Natural light"},
    {t:"ONE! Birthday", d:"Party, cake, candle", tip:"Candle blow"},
  ];
  return [all[week % all.length], all[(week+3) % all.length]];
}
const MILESTONES = ["First smile","First laugh","Tracked eyes","Held head 45°","Held head 90°","Rolled tummy to back","Rolled back to tummy","Cooed","Babbled","Grasped toy","Passed toy","Reached","Sat support","Sat alone","Army crawl","Crawled","Pulled to stand","Cruised","Stood alone","First steps","Walked","Waved bye","Clapped","Pointed","Pincer grasp","First solid","Self-fed","Straw cup","First tooth","Slept 5h","Slept through","Mama/dada","First word","First bath","First outing","First playdate","Grandparents","First trip","First haircut","First shoes"];

const THEMES:any = {
  sage:{bg:"#FDFBF7",card:"#FFF",accent:"#8A9A8B",text:"#2B2B2B",border:"#E8E2D9",name:"Sage"},
  blush:{bg:"#FFF9F5",card:"#FFF",accent:"#D4A5A5",text:"#2B2B2B",border:"#F0D9D9",name:"Blush"},
  sky:{bg:"#F7FAFD",card:"#FFF",accent:"#A9C6E5",text:"#2B2B2B",border:"#D6E4F0",name:"Sky"},
  honey:{bg:"#FFFBF0",card:"#FFF",accent:"#E8C07A",text:"#2B2B2B",border:"#F5E6C8",name:"Honey"},
  noir:{bg:"#2B2B2B",card:"#3A3A3A",accent:"#8A9A8B",text:"#FDFBF7",border:"#4A4A4A",name:"Noir"},
  linen:{bg:"#FAF6F1",card:"#FFF",accent:"#B8A99A",text:"#2B2B2B",border:"#E9E0D6",name:"Linen"},
};
const FONTS:any = {
  serif:{name:"Serif", family:"'Cormorant Garamond', serif"},
  sans:{name:"Sans", family:"Inter, sans-serif"},
  handwritten:{name:"Hand", family:"Caveat, cursive"},
  classic:{name:"Classic", family:"'EB Garamond', serif"},
  cozy:{name:"Cozy", family:"Lora, serif"},
};
const COVER_STYLES = [{id:"minimal",name:"Minimal"},{id:"classic",name:"Classic"},{id:"photo",name:"Photo"},{id:"modern",name:"Modern"},{id:"heirloom",name:"Heirloom"}];
const PHOTO_STYLES = [{id:"grid",name:"Grid"},{id:"polaroid",name:"Polaroid"},{id:"full",name:"Full"},{id:"classic",name:"Classic"}];

export default function Home(){
  const [auth,setAuth]=useState('landing');
  const [user,setUser]=useState<any>(null);
  const [baby,setBaby]=useState({name:"",birthDate:"",coverTitle:"Little Chapters", dedication:""});
  const [weeks,setWeeks]=useState<Record<number,WeekData>>({});
  const [curWeek,setCurWeek]=useState(12);
  const [theme,setTheme]=useState('sage');
  const [font,setFont]=useState('serif');
  const [coverStyle,setCoverStyle]=useState('minimal');
  const [tab,setTab]=useState<'weeks'|'book'|'settings'>('weeks');
  const [showSheet,setShowSheet]=useState(false);
  const [login,setLogin]=useState({email:"",pass:"",pass2:""});
  const [photosPerPage,setPhotosPerPage]=useState(4);
  const [photoStyle,setPhotoStyle]=useState('grid');
  const [showPrompts,setShowPrompts]=useState(true);
  const [showMiles,setShowMiles]=useState(true);
  const [sortByDate,setSortByDate]=useState(true);
  const [toast,setToast]=useState("");

  const th = THEMES[theme] || THEMES.sage;
  const sf = FONTS[font] || FONTS.serif;

  useEffect(()=>{
    try{
      const a=localStorage.getItem('lc_auth'); if(a) setAuth(a as any);
      const u=localStorage.getItem('lc_user'); if(u) setUser(JSON.parse(u));
      const b=localStorage.getItem('lc_baby'); if(b) setBaby(JSON.parse(b));
      const w=localStorage.getItem('lc_weeks'); if(w) setWeeks(JSON.parse(w));
      const t=localStorage.getItem('lc_theme'); if(t) setTheme(t);
      const f=localStorage.getItem('lc_font'); if(f) setFont(f);
      const cs=localStorage.getItem('lc_coverStyle'); if(cs) setCoverStyle(cs);
    }catch{}
  },[]);
  useEffect(()=>{localStorage.setItem('lc_auth',auth);},[auth]);
  useEffect(()=>{if(user) localStorage.setItem('lc_user',JSON.stringify(user));},[user]);
  useEffect(()=>{localStorage.setItem('lc_baby',JSON.stringify(baby));},[baby]);
  useEffect(()=>{localStorage.setItem('lc_weeks',JSON.stringify(weeks));},[weeks]);
  useEffect(()=>{localStorage.setItem('lc_theme',theme);},[theme]);
  useEffect(()=>{localStorage.setItem('lc_font',font);},[font]);
  useEffect(()=>{localStorage.setItem('lc_coverStyle',coverStyle);},[coverStyle]);
  useEffect(()=>{
    if(baby.birthDate){
      const d=Math.floor((Date.now()-new Date(baby.birthDate).getTime())/(1000*60*60*24*7));
      setCurWeek(Math.max(0,Math.min(52,d)));
    }
  },[baby.birthDate]);

  const totalPhotos = Object.values(weeks).reduce((s,w)=>s+(w.photos?.length||0),0);
  const weeksFilled = Object.keys(weeks).filter(k=> (weeks as any)[k].photos?.length>0).length;
  const curData = weeks[curWeek] || {photos:[],milestones:{},letter:"",promptsDone:{}};
  const prompts = useMemo(()=>getPrompts(curWeek),[curWeek]);

  function handleFiles(files:File[], cam=false){
    if(curData.photos.length+files.length>10){ alert(`Max 10, have ${curData.photos.length}`); return; }
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=(ev)=>{
        const url=ev.target?.result as string;
        const today=new Date().toISOString().slice(0,10);
        setWeeks(w=>{
          const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}};
          if(cd.photos.length>=10) return w;
          return {...w,[curWeek]:{...cd,photos:[...cd.photos,{id:Math.random().toString(36).slice(2),url,date:today,fromCamera:cam}]}};
        });
      };
      r.readAsDataURL(f);
    });
  }
  function openCam(){ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.setAttribute('capture','environment'); i.onchange=(e:any)=>handleFiles(Array.from(e.target.files||[]),true); i.click(); setShowSheet(false); }
  function openLib(){ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.multiple=true; i.onchange=(e:any)=>handleFiles(Array.from(e.target.files||[]),false); i.click(); setShowSheet(false); }

  function weekRange(w:number){
    if(!baby.birthDate) return `Week ${w}`;
    const b=new Date(baby.birthDate);
    const s=new Date(b.getTime()+w*7*24*60*60*1000);
    const e=new Date(s.getTime()+6*24*60*60*1000);
    return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
  }

  const bookPages = useMemo(()=>{
    const pages:any[]=[];
    Object.keys(weeks).map(Number).sort((a,b)=>a-b).forEach(w=>{
      const wd=weeks[w];
      if(!wd) return;
      const has=wd.photos.length>0 || Object.values(wd.milestones).some((m:any)=>m.checked) || wd.letter || Object.values(wd.promptsDone).some((p:any)=>p.done);
      if(!has) return;
      const pList=getPrompts(w);
      const donePrompts=pList.map((p:any,idx:number)=>{
        const k=`${w}-${idx}`;
        const d=wd.promptsDone?.[k];
        return {...p, idx, done:d, date:d?.date||""};
      }).filter((p:any)=>p.done?.done);
      if(sortByDate) donePrompts.sort((a:any,b:any)=>(a.date||"").localeCompare(b.date||""));
      const miles=Object.entries(wd.milestones).filter(([,v]:any)=>v.checked).map(([k,v]:any)=>({name:k,...v})).sort((a:any,b:any)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0);
      const photos=[...wd.photos].sort((a,b)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0).slice(0,photosPerPage);
      pages.push({week:w, range:weekRange(w), photos, prompts:donePrompts, milestones:miles, letter:wd.letter});
    });
    return pages;
  },[weeks, photosPerPage, sortByDate, baby.birthDate]);

  if(auth==='landing'){
    return <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:th.bg,color:th.text}}><div className="text-center max-w-[400px]"><div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{background:th.accent}}>📖</div><h1 className="text-4xl" style={{fontFamily:sf.family}}>{baby.coverTitle||"Little Chapters"}</h1><p className="opacity-60 mt-2 text-sm">Weeks → Book → Settings</p><div className="mt-8 grid gap-3"><button onClick={()=>setAuth('login')} className="rounded-full py-3 text-white" style={{background:th.text}}>Log in</button><button onClick={()=>setAuth('signup')} className="rounded-full py-3 border" style={{borderColor:th.border}}>Create account</button></div></div></div>
  }
  if(auth==='login' || auth==='signup'){
    const isLogin=auth==='login';
    return <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}><div className="w-full max-w-[360px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}><div className="text-xl" style={{fontFamily:sf.family}}>{isLogin?'Welcome back':'Create account'}</div><div className="mt-6 space-y-3"><input placeholder="Email" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} /><input placeholder="Password" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.pass} onChange={e=>setLogin({...login,pass:e.target.value})} />{!isLogin && <input placeholder="Confirm" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.pass2} onChange={e=>setLogin({...login,pass2:e.target.value})} />}<button onClick={()=>{ if(!login.email||!login.pass) return; if(!isLogin&&login.pass!==login.pass2) return; setUser({email:login.email}); setAuth('onboarding'); }} className="w-full rounded-full py-3 text-white text-sm" style={{background:th.text}}>{isLogin?'Log in':'Create'}</button><button onClick={()=>setAuth(isLogin?'signup':'login')} className="w-full text-xs opacity-60">{isLogin?'Need account?':'Have account?'}</button></div></div></div>
  }
  if(auth==='onboarding'){
    return <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}><div className="w-full max-w-[400px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}><div className="text-xl" style={{fontFamily:sf.family}}>About baby</div><div className="mt-6 space-y-3"><input placeholder="Baby name" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.name} onChange={e=>setBaby({...baby,name:e.target.value})} /><input type="date" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.birthDate} onChange={e=>setBaby({...baby,birthDate:e.target.value})} /><input placeholder="Book title" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} /><textarea placeholder="Dedication" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} /><button onClick={()=>{ if(!baby.name||!baby.birthDate) return; setAuth('app'); }} className="w-full rounded-full py-3 text-white" style={{background:th.text}}>Start</button></div></div></div>
  }

  return (
    <div className="min-h-screen" style={{background:th.bg,color:th.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Caveat&family=EB+Garamond&family=Inter&family=Lora&display=swap');`}</style>
      <div className="sticky top-0 z-20 backdrop-blur border-b" style={{background:`${th.card}ee`,borderColor:th.border}}>
        <div className="max-w-[960px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:th.accent}}>📖</div><div><div className="text-sm font-medium" style={{fontFamily:sf.family}}>{baby.coverTitle||"Little Chapters"}</div><div className="text-[10px] opacity-60">{baby.name} • {weeksFilled}w • {totalPhotos} pics</div></div></div>
          <div className="flex gap-1 bg-[#F5F1EA] rounded-full p-1">
            <button onClick={()=>setTab('weeks')} className={`px-4 py-1.5 rounded-full text-xs ${tab==='weeks'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Weeks</button>
            <button onClick={()=>setTab('book')} className={`px-4 py-1.5 rounded-full text-xs ${tab==='book'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Book</button>
            <button onClick={()=>setTab('settings')} className={`px-4 py-1.5 rounded-full text-xs ${tab==='settings'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Settings</button>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-6">
        {tab==='weeks' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">{Array.from({length:53},(_,i)=>i).map(w=>{ const has=weeks[w]?.photos?.length>0; return <button key={w} onClick={()=>setCurWeek(w)} className={`shrink-0 rounded-full px-3 py-2 text-xs border ${curWeek===w?'bg-[#2B2B2B] text-white':'bg-white'}`} style={{borderColor:has?th.accent:th.border}}>{w}{has?'•':''}</button>})}</div>
            <div className="mt-4 rounded-[24px] p-6 border" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] opacity-60">WEEK {curWeek} • {weekRange(curWeek)}</div><div className="grid md:grid-cols-2 gap-3 mt-4">{prompts.map((pr:any,idx:number)=>{ const k=`${curWeek}-${idx}`; const done=curData.promptsDone?.[k]; return <div key={idx} className={`rounded-xl border p-4 ${done?.done?'bg-[#F7FAFD]':''}`} style={{borderColor:done?.done?th.accent:th.border}}><div className="flex justify-between"><div className="text-[10px] opacity-60">PROMPT {idx+1}</div><label className="text-[10px] flex items-center gap-1"><input type="checkbox" checked={!!done?.done} onChange={e=>{ const c=e.target.checked; const today=new Date().toISOString().slice(0,10); setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{done:c,date:c?(done?.date||today):""}}}}; }); }} /> done</label></div><div className="font-medium mt-1" style={{fontFamily:sf.family}}>{pr.t}</div><div className="text-xs opacity-70 mt-1">{pr.d}</div>{done?.done && <input type="date" value={done.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{done:true,date:e.target.value}}}}; }); }} className="mt-2 w-full rounded border px-2 py-1 text-xs" />}</div>})}</div></div>
            <div className="mt-6"><div className="flex justify-between"><div className="text-sm font-medium">Photos {curData.photos.length}/10</div></div><div className="grid grid-cols-3 gap-2 mt-3">{curData.photos.map((p:any)=><div key={p.id} className="relative rounded-xl overflow-hidden aspect-square bg-[#EEE]"><img src={p.url} className="w-full h-full object-cover" /><div className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">{p.date}</div><button onClick={()=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[]}; return {...w,[curWeek]:{...cd,photos:cd.photos.filter((x:any)=>x.id!==p.id)}}; }); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs">✕</button></div>)}{curData.photos.length<10 && <div onClick={()=>setShowSheet(true)} className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer" style={{borderColor:th.border}}><span>📸</span><span className="text-xs">Add</span></div>}</div></div>
            <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}><div className="text-sm font-medium">Milestones • {Object.values(curData.milestones||{}).filter((m:any)=>m.checked).length}/{MILESTONES.length}</div><div className="mt-3 space-y-2 max-h-[400px] overflow-auto">{MILESTONES.map(m=>{ const en=curData.milestones?.[m]||{checked:false,date:"",details:""}; return <div key={m} className={`rounded-xl border p-3 ${en.checked?'bg-[#FFFBF0]':''}`} style={{borderColor:en.checked?th.accent:th.border}}><label className="flex gap-2 text-sm"><input type="checkbox" checked={!!en.checked} onChange={e=>{ const c=e.target.checked; const today=new Date().toISOString().slice(0,10); setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{checked:c,date:c?(en.date||today):"",details:en.details||""}}}}; }); }} />{m}{en.checked&&en.date&&<span className="ml-auto text-[10px] bg-white border px-2 py-0.5 rounded-full">{en.date}</span>}</label>{en.checked && <div className="mt-2 grid grid-cols-[120px_1fr] gap-2"><input type="date" value={en.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...en,date:e.target.value}}}}; }); }} className="rounded border px-2 py-1 text-xs" /><textarea value={en.details} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...en,details:e.target.value}}}}; }); }} placeholder="Details" className="rounded border px-2 py-1 text-xs h-[40px]" /></div>}</div>})}</div></div>
            <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}><div className="text-sm font-medium">Letter</div><textarea value={curData.letter||""} onChange={e=>{ setWeeks(w=>({...w,[curWeek]:{...curData,letter:e.target.value}})); }} className="mt-2 w-full rounded-xl border p-3 text-sm h-[70px]" placeholder="What to remember?" /></div>
          </>
        )}

        {tab==='book' && (
          <>
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}>
              <div className="text-[11px] opacity-60">BOOK PREVIEW • ASSEMBLED FROM WEEKLY ENTRIES</div>
              <div className="mt-2 text-lg font-medium" style={{fontFamily:sf.family}}>Customize Book</div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div><div className="text-[11px] font-medium">Photos per page</div><div className="flex gap-2 mt-2">{[1,2,4,6].map(n=><button key={n} onClick={()=>setPhotosPerPage(n)} className={`px-3 py-1 rounded-full border text-xs ${photosPerPage===n?'bg-black text-white':''}`}>{n}</button>)}</div></div>
                <div><div className="text-[11px] font-medium">Photo style</div><div className="flex gap-2 mt-2 flex-wrap">{PHOTO_STYLES.map(s=><button key={s.id} onClick={()=>setPhotoStyle(s.id)} className={`px-3 py-1 rounded-full border text-xs ${photoStyle===s.id?'bg-black text-white':''}`}>{s.name}</button>)}</div></div>
                <div><div className="text-[11px] font-medium">Content & sorting</div><div className="mt-2 space-y-1 text-xs"><label className="flex gap-2"><input type="checkbox" checked={showPrompts} onChange={e=>setShowPrompts(e.target.checked)} />Prompts by date</label><label className="flex gap-2"><input type="checkbox" checked={showMiles} onChange={e=>setShowMiles(e.target.checked)} />Milestones by date</label><label className="flex gap-2"><input type="checkbox" checked={sortByDate} onChange={e=>setSortByDate(e.target.checked)} />Sort by date within week</label></div></div>
              </div>
            </div>
            <div className="mt-6 grid md:grid-cols-[220px_1fr] gap-6">
              <div className="rounded-[16px] border p-6 aspect-[3/4] flex flex-col items-center text-center" style={{background:th.card,borderColor:th.border,fontFamily:sf.family}}><div className="text-[9px] opacity-60 uppercase">{COVER_STYLES.find(c=>c.id===coverStyle)?.name} • {th.name}</div><div className="mt-6 text-[24px] leading-tight">{baby.coverTitle||"Little Chapters"}</div><div className="h-px w-10 bg-current opacity-20 my-4" /><div className="text-xs opacity-70">{baby.name} • First Year</div><div className="mt-auto text-[9px] opacity-40">{baby.dedication?.slice(0,40)}</div></div>
              <div className="rounded-[16px] border p-4 bg-white max-h-[600px] overflow-auto" style={{borderColor:th.border}}>
                <div className="text-[11px] font-medium">Interior • {bookPages.length} pages • {totalPhotos} photos</div>
                {bookPages.length===0 ? <div className="text-xs opacity-60 mt-4">Add photos & check prompts - they appear here sorted by date.</div> : <div className="mt-4 space-y-6">{bookPages.map((pg:any)=><div key={pg.week} className="border-b pb-4"><div className="text-[11px] opacity-60">WEEK {pg.week} • {pg.range}</div><div className={`mt-2 grid gap-2 ${photosPerPage===1?'grid-cols-1':photosPerPage===2?'grid-cols-2':'grid-cols-2'}`}>{pg.photos.map((ph:any)=><div key={ph.id} className={`${photoStyle==='polaroid'?'bg-white p-2 shadow rotate-1':photoStyle==='full'?'':'rounded-lg'} overflow-hidden`}><img src={ph.url} className="w-full aspect-square object-cover" /><div className="text-[9px] opacity-60 mt-1">{ph.date}</div></div>)}</div>{showPrompts && pg.prompts.length>0 && <div className="mt-3"><div className="text-[10px] font-medium">Prompts by date</div>{pg.prompts.map((pr:any)=><div key={pr.idx} className="text-xs mt-1"><span className="font-medium">{pr.t}</span> • {pr.date}<div className="opacity-60 text-[11px]">{pr.d}</div></div>)}</div>}{showMiles && pg.milestones.length>0 && <div className="mt-3"><div className="text-[10px] font-medium">Milestones by date</div>{pg.milestones.map((ms:any)=><div key={ms.name} className="text-xs">✓ {ms.name} • {ms.date}{ms.details && <div className="italic opacity-60">"{ms.details}"</div>}</div>)}</div>}{pg.letter && <div className="mt-2 text-xs italic">"{pg.letter}"</div>}</div>)}</div>}
              </div>
            </div>
          </>
        )}

        {tab==='settings' && (
          <div className="space-y-6">
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] opacity-60">ACCOUNT INFO</div><div className="mt-3 text-sm"><div>Email: {user?.email}</div><div>Baby: {baby.name} • {baby.birthDate}</div><div>Book: {baby.coverTitle} • {weeksFilled}w • {totalPhotos} pics</div><div className="flex gap-2 mt-4"><button onClick={()=>{ setAuth('landing'); setUser(null); }} className="text-xs px-4 py-2 rounded-full border">Log out</button><button onClick={()=>{ if(confirm('Clear all?')){ localStorage.clear(); location.reload(); } }} className="text-xs px-4 py-2 rounded-full bg-black text-white">Clear data</button></div></div></div>
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] opacity-60">APP SETTINGS • THEME</div><div className="mt-4 grid md:grid-cols-2 gap-6"><div><div className="text-[11px] font-medium">Theme</div><div className="grid grid-cols-3 gap-2 mt-2">{Object.entries(THEMES).map(([k,v]:any)=><button key={k} onClick={()=>setTheme(k)} className={`rounded-xl border p-2 ${theme===k?'ring-2 ring-black':''}`} style={{background:v.bg,borderColor:v.border}}><div className="w-6 h-6 rounded-full" style={{background:v.accent}} /><div className="text-xs mt-1">{v.name}</div></button>)}</div></div><div><div className="text-[11px] font-medium">Font</div><div className="grid grid-cols-2 gap-2 mt-2">{Object.entries(FONTS).map(([k,v]:any)=><button key={k} onClick={()=>setFont(k)} className={`rounded-xl border p-2 text-left ${font===k?'ring-2':''}`} style={{borderColor:th.border}}><div style={{fontFamily:v.family}} className="text-sm">{v.name}</div></button>)}</div><div className="mt-4"><div className="text-[11px] font-medium">Cover Style</div><div className="flex gap-2 mt-2 flex-wrap">{COVER_STYLES.map(c=><button key={c.id} onClick={()=>setCoverStyle(c.id)} className={`px-3 py-1 rounded-full border text-xs ${coverStyle===c.id?'bg-black text-white':''}`}>{c.name}</button>)}</div></div></div></div><div className="grid grid-cols-2 gap-3"><div><div className="text-[11px]">Title</div><input value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" /></div><div><div className="text-[11px]">Dedication</div><input value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" /></div></div></div>
          </div>
        )}
      </div>
      {showSheet && <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={()=>setShowSheet(false)}><div className="bg-white rounded-t-[24px] w-full max-w-[400px] p-6" onClick={e=>e.stopPropagation()}><div className="text-lg">Add photo Week {curWeek}</div><div className="grid grid-cols-2 gap-3 mt-6"><button onClick={openCam} className="rounded-2xl border p-5 flex flex-col items-center"><span>📷</span><span className="text-sm">Camera</span></button><button onClick={openLib} className="rounded-2xl border p-5 flex flex-col items-center"><span>🖼️</span><span className="text-sm">Library</span></button></div><button onClick={()=>setShowSheet(false)} className="w-full rounded-xl border py-3 text-sm mt-4">Cancel</button></div></div>}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full">{toast}</div>}
    </div>
  )
}
