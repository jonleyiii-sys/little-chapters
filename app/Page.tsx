
"use client";
import { useState, useEffect, useMemo } from "react";

type Prompt = { t:string; d:string; tip:string };
type Photo = {id:string, url:string, fromCamera?:boolean, date:string};
type MilestoneEntry = {checked:boolean; date:string; details:string};
type PromptDone = {done:boolean; date:string};
type WeekData = {photos:Photo[], milestones:Record<string,MilestoneEntry>, letter:string, promptsDone:Record<string,PromptDone>, weekStartDate?:string};

function getPrompts(week:number): Prompt[] {
  const stages: Record<string, Prompt[]> = {
    newborn: [
      {t:"First Hours: Hello World", d:"Skin-to-skin, bracelet, footprints", tip:"Window light, no flash"},
      {t:"Name Story", d:"Why you chose name, meaning, nicknames", tip:"Include birth stats card"},
      {t:"Tiny Details", d:"Fingers, toes, ear curls, belly button", tip:"Macro mode, same hand for scale"},
      {t:"Sleepy Portrait", d:"Milk-drunk yawns, stretches", tip:"Warm room, white noise"},
      {t:"Homecoming", d:"Outfit, car seat, front door moment", tip:"Siblings/pets reaction"},
      {t:"Midnight Feeds", d:"2am lamp light, cozy tired perfect", tip:"Underexposed beautiful"},
      {t:"First Bath", d:"Sponge bath, tiny tub reactions", tip:"Towel ready, face first"},
      {t:"One Month", d:"Same blanket monthly comparison", tip:"Same spot each month"},
    ],
    w5_12: [
      {t:"Social Smile", d:"Gummy smile emerging, morning light", tip:"After nap is magic"},
      {t:"Tummy Time", d:"Neck strength, mini push-ups", tip:"Mirror in front"},
      {t:"Cooing Conversations", d:"Oohs, aahs, talking back", tip:"Record sound too"},
      {t:"Eye Tracking", d:"Following you, voice turning", tip:"Move slow side to side"},
      {t:"Two Months", d:"Milestone photo, growth check", tip:"Same setup as 1 month"},
      {t:"Hands Discovery", d:"Hands together, batting toys", tip:"Play gym overhead"},
      {t:"Head Control", d:"Steady in carrier, looking around", tip:"Carrier walk"},
      {t:"Three Months", d:"Big personality emerging", tip:"Monthly comparison"},
      {t:"First Laugh", d:"Giggle, belly laugh", tip:"Tickle feet, peekaboo"},
      {t:"Reading Together", d:"First books on your lap", tip:"Capture gaze"},
    ],
    w13_24: [
      {t:"Rolling Prep", d:"Side-lying, reaching across", tip:"Toy just out of reach"},
      {t:"Reaching & Grabbing", d:"Purposeful reach to mouth", tip:"Offer at chest level"},
      {t:"Four Months", d:"Drool, new sounds, rolling?", tip:"Same blanket"},
      {t:"Sitting With Support", d:"Boppy, high chair", tip:"Pillows around"},
      {t:"Food Curiosity", d:"Watching you eat, lip smack", tip:"High chair view"},
      {t:"Five Months", d:"Halfway to half birthday", tip:"Monthly"},
      {t:"Texture & Touch", d:"Feet in grass, water, fabrics", tip:"Close-ups"},
      {t:"Half Birthday - Six Months", d:"Half cake, banner, celebration", tip:"Simple but special"},
      {t:"Sitting Solo", d:"Independent tripod-free sit", tip:"Clap to celebrate"},
      {t:"First Solids", d:"Purees, faces, mess", tip:"Embrace mess"},
    ],
    w25_36: [
      {t:"Music & Dance", d:"Kitchen dance party, bouncing", tip:"Blur shows movement"},
      {t:"Crawling", d:"First crawl, wherever they go", tip:"Baby gate view"},
      {t:"Clapping & Waving", d:"Hi/bye gestures emerging", tip:"Model then wait"},
      {t:"Pincer Grasp", d:"Puffs, peas, thumb+finger", tip:"High chair top-down"},
      {t:"Standing With Help", d:"Pulling on table, your hands", tip:"Push toy"},
      {t:"Eight Months", d:"Busy, curious, into everything", tip:"Monthly"},
      {t:"Cruising Furniture", d:"Side-stepping couch", tip:"Clear path, soft rug"},
      {t:"First Words Watch", d:"Mama? Dada? Uh-oh?", tip:"Write what you heard"},
      {t:"Nine Months", d:"Almost toddler", tip:"Monthly"},
      {t:"Pointing & Showing", d:"Plane, dog, you", tip:"Follow their point"},
    ],
    w37_52: [
      {t:"First Art", d:"Chunky crayon, first marks", tip:"Tape paper down"},
      {t:"Ten Months", d:"Big personality, small body", tip:"Monthly"},
      {t:"Independent Play", d:"Solo focus, concentration", tip:"Do not interrupt"},
      {t:"First Shoes", d:"Tiny shoes, first walk outside", tip:"Carpet first"},
      {t:"Eleven Months", d:"Almost one!", tip:"Same blanket last time"},
      {t:"Cuddle Pile", d:"Group hug, pile on bed", tip:"Timer, squeeze"},
      {t:"Walking Along", d:"Furniture to furniture", tip:"Bare feet"},
      {t:"One Year Portrait", d:"Official milestone outfit", tip:"Natural light, eye level"},
      {t:"ONE! Birthday", d:"Party, cake, one candle", tip:"Get candle blow"},
      {t:"First Year Reflection", d:"Your letter, growth as parent", tip:"Partner photo"},
    ],
  };
  let pool: Prompt[] = [];
  if(week<=4) pool = stages.newborn;
  else if(week<=12) pool = stages.w5_12;
  else if(week<=24) pool = stages.w13_24;
  else if(week<=36) pool = stages.w25_36;
  else pool = stages.w37_52;
  const a = pool[week % pool.length];
  const b = pool[(week+3) % pool.length];
  return [a,b];
}

const MILESTONES_LIST = [
"First social smile","First laugh out loud","Tracked object with eyes","Held head up 45°","Held head up 90°","Rolled tummy to back","Rolled back to tummy","Cooed - vowel sounds","Babbled ba-da-ma","Grasped toy","Passed toy hand to hand","Reached for you","Sat with support","Sat independently","Army crawled","Crawled hands & knees","Pulled to stand","Cruised furniture","Stood independently","First steps","Walked independently","Waved bye-bye","Clapped hands","Pointed to show","Pincer grasp","First solid food","Self-fed spoon/hands","Drank from straw/open cup","First tooth","Slept 5+ hours","Slept through night","Said mama/dada","First word (other)","First bath","First outing","First playdate","Met grandparents","First trip","First haircut","First shoes"
];

const THEMES: any = {
  sage:{bg:"#FDFBF7",card:"#FFFFFF",accent:"#8A9A8B",dark:"#6B7D6C",text:"#2B2B2B",border:"#E8E2D9",name:"Sage"},
  blush:{bg:"#FFF9F5",card:"#FFFFFF",accent:"#D4A5A5",dark:"#C48B8B",text:"#2B2B2B",border:"#F0D9D9",name:"Blush"},
  sky:{bg:"#F7FAFD",card:"#FFFFFF",accent:"#A9C6E5",dark:"#6B8BA4",text:"#2B2B2B",border:"#D6E4F0",name:"Sky"},
  honey:{bg:"#FFFBF0",card:"#FFFFFF",accent:"#E8C07A",dark:"#8B6F47",text:"#2B2B2B",border:"#F5E6C8",name:"Honey"},
  noir:{bg:"#2B2B2B",card:"#3A3A3A",accent:"#8A9A8B",dark:"#6B7D6C",text:"#FDFBF7",border:"#4A4A4A",name:"Noir"},
  linen:{bg:"#FAF6F1",card:"#FFFFFF",accent:"#B8A99A",dark:"#8A7D6E",text:"#2B2B2B",border:"#E9E0D6",name:"Linen"},
};
const FONTS: any = {
  serif:{name:"Heirloom Serif", family:"'Cormorant Garamond', serif"},
  sans:{name:"Modern Sans", family:"'Inter', sans-serif"},
  handwritten:{name:"Handwritten Story", family:"'Caveat', cursive"},
  classic:{name:"Classic Book", family:"'EB Garamond', serif"},
  cozy:{name:"Cozy Lora", family:"'Lora', serif"},
};
const COVER_STYLES = [
  {id:"minimal", name:"Minimal", desc:"Centered clean"},
  {id:"classic", name:"Classic Frame", desc:"Border elegant"},
  {id:"photo", name:"Photo Cover", desc:"Photo + overlay"},
  {id:"modern", name:"Modern Bold", desc:"Left big type"},
  {id:"heirloom", name:"Heirloom Gold", desc:"Gold line luxury"},
];
const PHOTO_STYLES = [
  {id:"grid", name:"Grid", desc:"Clean 2-col"},
  {id:"masonry", name:"Masonry", desc:"Varied heights"},
  {id:"polaroid", name:"Polaroid", desc:"White border, shadow"},
  {id:"full", name:"Full Bleed", desc:"Edge to edge"},
  {id:"classic", name:"Classic", desc:"Border + caption"},
];

export default function Home(){
  const [auth,setAuth] = useState<'landing'|'login'|'signup'|'onboarding'|'app'>('landing');
  const [user,setUser] = useState<{email:string}|null>(null);
  const [baby,setBaby] = useState({name:"",birthDate:"",coverTitle:"Little Chapters", dedication:""});
  const [weeks,setWeeks] = useState<Record<number,WeekData>>({});
  const [curWeek,setCurWeek]=useState(12);
  const [theme,setTheme]=useState('sage');
  const [font,setFont]=useState('serif');
  const [coverStyle,setCoverStyle]=useState('minimal');
  const [activeTab,setActiveTab]=useState<'weeks'|'book'|'settings'>('weeks');
  const [showPhotoSheet,setShowPhotoSheet]=useState(false);
  const [loginForm,setLoginForm]=useState({email:"",pass:"",pass2:""});
  const [toast,setToast]=useState("");
  // Book customizations
  const [photosPerPage,setPhotosPerPage]=useState(4);
  const [photoStyle,setPhotoStyle]=useState('grid');
  const [showPromptsInBook,setShowPromptsInBook]=useState(true);
  const [showMilestonesInBook,setShowMilestonesInBook]=useState(true);
  const [showLettersInBook,setShowLettersInBook]=useState(true);
  const [sortByDate,setSortByDate]=useState(true);

  const th = THEMES[theme] || THEMES.sage;
  const safeFont = FONTS[font] || FONTS.serif;

  useEffect(()=>{
    try{
      const a = localStorage.getItem('lc_auth'); if(a) setAuth(a as any);
      const u = localStorage.getItem('lc_user'); if(u) setUser(JSON.parse(u));
      const b = localStorage.getItem('lc_baby'); if(b) setBaby(JSON.parse(b));
      const w = localStorage.getItem('lc_weeks'); if(w) setWeeks(JSON.parse(w));
      const t = localStorage.getItem('lc_theme'); if(t) setTheme(t);
      const f = localStorage.getItem('lc_font'); if(f) setFont(f);
      const cs = localStorage.getItem('lc_coverStyle'); if(cs) setCoverStyle(cs);
      const ppp = localStorage.getItem('lc_photosPerPage'); if(ppp) setPhotosPerPage(parseInt(ppp));
      const ps = localStorage.getItem('lc_photoStyle'); if(ps) setPhotoStyle(ps);
    }catch{}
  },[]);
  useEffect(()=>{localStorage.setItem('lc_auth',auth);},[auth]);
  useEffect(()=>{if(user) localStorage.setItem('lc_user',JSON.stringify(user));},[user]);
  useEffect(()=>{localStorage.setItem('lc_baby',JSON.stringify(baby));},[baby]);
  useEffect(()=>{localStorage.setItem('lc_weeks',JSON.stringify(weeks));},[weeks]);
  useEffect(()=>{localStorage.setItem('lc_theme',theme);},[theme]);
  useEffect(()=>{localStorage.setItem('lc_font',font);},[font]);
  useEffect(()=>{localStorage.setItem('lc_coverStyle',coverStyle);},[coverStyle]);
  useEffect(()=>{localStorage.setItem('lc_photosPerPage',String(photosPerPage));},[photosPerPage]);
  useEffect(()=>{localStorage.setItem('lc_photoStyle',photoStyle);},[photoStyle]);
  useEffect(()=>{
    if(baby.birthDate){
      const d = Math.floor((Date.now()-new Date(baby.birthDate).getTime())/(1000*60*60*24*7));
      setCurWeek(Math.max(0,Math.min(52,d)));
    }
  },[baby.birthDate]);
  useEffect(()=>{
    if(user?.email){
      const per = localStorage.getItem(`lc_weeks_${user.email}`);
      if(per){ try{ 
        let parsed:any = {};
        try{ parsed = JSON.parse(per); }catch{ localStorage.removeItem(`lc_weeks_${user.email}`); parsed={}; }
        Object.keys(parsed).forEach((wk:any)=>{
          const wd = parsed[wk];
          if(wd.milestones){
            Object.keys(wd.milestones).forEach((m:any)=>{
              const v = wd.milestones[m];
              if(typeof v === 'boolean'){
                wd.milestones[m] = {checked:v, date: v? new Date().toISOString().slice(0,10): "", details:""};
              }
            });
          }
          if(wd.photos){
            wd.photos = wd.photos.map((p:any)=> typeof p==='string' ? {id:Math.random().toString(36).slice(2), url:p, date:new Date().toISOString().slice(0,10)} : {...p, date:p.date||new Date().toISOString().slice(0,10)});
          }
          if(wd.promptsDone){
            Object.keys(wd.promptsDone).forEach((k:any)=>{
              const v = wd.promptsDone[k];
              if(typeof v === 'boolean'){
                wd.promptsDone[k] = {done:v, date: v? new Date().toISOString().slice(0,10): ""};
              }
            });
          }
        });
        setWeeks(parsed); }catch{} }
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
  const weeksFilled = Object.keys(weeks).filter(k=> (weeks as any)[k].photos?.length>0 || Object.values((weeks as any)[k].milestones||{}).some((m:any)=>m.checked)).length;
  const curData = weeks[curWeek] || {photos:[],milestones:{},letter:"",promptsDone:{}};
  const prompts = useMemo(()=>getPrompts(curWeek),[curWeek]);

  function upd(patch:Partial<WeekData>){
    setWeeks(w=>({...w,[curWeek]:{...curData,...patch}}));
  }
  function handleFiles(files:File[], fromCamera=false){
    if(curData.photos.length+files.length>10){ alert(`Max 10 per week. You have ${curData.photos.length}`); return; }
    files.forEach(f=>{
      if(f.size>8*1024*1024){ alert(`${f.name} >8MB`); return; }
      const reader = new FileReader();
      reader.onload = (ev)=>{
        const url = ev.target?.result as string;
        const today = new Date().toISOString().slice(0,10);
        setWeeks(w=>{
          const cd = w[curWeek] || {photos:[],milestones:{},letter:"",promptsDone:{}};
          if(cd.photos.length>=10) return w;
          return {...w,[curWeek]:{...cd,photos:[...cd.photos,{id:Math.random().toString(36).slice(2),url,fromCamera,date:today}]}};
        });
        setToast(fromCamera?"Photo captured ✓":"Added ✓"); setTimeout(()=>setToast(""),1500);
      };
      reader.readAsDataURL(f);
    });
  }
  function openCamera(){
    const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.setAttribute('capture','environment');
    inp.onchange = (e:any)=>handleFiles(Array.from(e.target.files||[]), true); inp.click(); setShowPhotoSheet(false);
  }
  function openLibrary(){
    const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.multiple=true;
    inp.onchange = (e:any)=>handleFiles(Array.from(e.target.files||[]), false); inp.click(); setShowPhotoSheet(false);
  }

  function getWeekDateRange(weekNum:number){
    if(!baby.birthDate) return `Week ${weekNum}`;
    const birth = new Date(baby.birthDate);
    const start = new Date(birth.getTime() + weekNum*7*24*60*60*1000);
    const end = new Date(start.getTime() + 6*24*60*60*1000);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  // Build book pages assembled from weekly entries
  const bookPages = useMemo(()=>{
    const pages:any[] = [];
    const sortedWeeks = Object.keys(weeks).map(Number).sort((a,b)=>a-b);
    for(const w of sortedWeeks){
      const wd = weeks[w];
      if(!wd) continue;
      const hasContent = wd.photos.length>0 || Object.values(wd.milestones).some((m:any)=>m.checked) || wd.letter || Object.values(wd.promptsDone).some((p:any)=>p.done);
      if(!hasContent) continue;
      // Prompts sorted by date of occurrence
      const promptsForWeek = getPrompts(w);
      const donePrompts = promptsForWeek.map((p,idx)=>{
        const key = `${w}-${idx}`;
        const done = wd.promptsDone?.[key];
        return {...p, idx, done, date: done?.date || ""};
      }).filter(p=>p.done?.done);
      if(sortByDate){
        donePrompts.sort((a,b)=> (a.date||"").localeCompare(b.date||""));
      }
      // Milestones sorted by date
      const milestones = Object.entries(wd.milestones).filter(([_,v]:any)=>v.checked).map(([k,v]:any)=>({name:k, ...v})).sort((a:any,b:any)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0);
      // Photos sorted by date, limited by photosPerPage
      const photos = [...wd.photos].sort((a,b)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0).slice(0, photosPerPage);
      pages.push({week:w, dateRange:getWeekDateRange(w), photos, prompts:donePrompts, milestones, letter:wd.letter});
    }
    return pages;
  },[weeks, photosPerPage, sortByDate, baby.birthDate]);

  if(auth==='landing'){
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:th.bg,color:th.text}}>
        <div className="text-center max-w-[420px]">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl" style={{background:th.accent}}>📖</div>
          <h1 className="text-4xl" style={{fontFamily:safeFont.family}}>{baby.coverTitle || "Little Chapters"}</h1>
          <p className="opacity-70 mt-3">52 weeks • 2 prompts per week • Real book from your entries</p>
          <div className="mt-8 grid gap-3">
            <button onClick={()=>setAuth('login')} className="rounded-full py-3 text-white" style={{background:th.text}}>Log in</button>
            <button onClick={()=>setAuth('signup')} className="rounded-full py-3 border" style={{borderColor:th.border}}>Create account</button>
          </div>
        </div>
      </div>
    )
  }
  if(auth==='login' || auth==='signup'){
    const isLogin = auth==='login';
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}>
        <div className="w-full max-w-[360px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}>
          <div className="text-xl" style={{fontFamily:safeFont.family}}>{isLogin?'Welcome back':'Create account'}</div>
          <div className="mt-6 space-y-4">
            <input placeholder="Email" className="w-full rounded-xl border px-4 py-3 text-sm" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} />
            <input placeholder="Password" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={loginForm.pass} onChange={e=>setLoginForm({...loginForm,pass:e.target.value})} />
            {!isLogin && <input placeholder="Confirm password" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={loginForm.pass2} onChange={e=>setLoginForm({...loginForm,pass2:e.target.value})} />}
            <button onClick={()=>{ if(!loginForm.email || !loginForm.pass) return; if(!isLogin && loginForm.pass!==loginForm.pass2) return; setUser({email:loginForm.email}); setAuth('onboarding'); }} className="w-full rounded-full py-3 text-white text-sm" style={{background:th.text}}>{isLogin?'Log in':'Create account'}</button>
            <button onClick={()=>setAuth(isLogin?'signup':'login')} className="w-full text-xs opacity-60">{isLogin?"Need account? Sign up":"Have account? Log in"}</button>
          </div>
        </div>
      </div>
    )
  }
  if(auth==='onboarding'){
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}>
        <div className="w-full max-w-[400px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}>
          <div className="text-xl" style={{fontFamily:safeFont.family}}>About your little one</div>
          <div className="mt-6 space-y-4">
            <input placeholder="Baby name" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.name} onChange={e=>setBaby({...baby,name:e.target.value})} />
            <input type="date" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.birthDate} onChange={e=>setBaby({...baby,birthDate:e.target.value})} />
            <input placeholder="Book title" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} />
            <textarea placeholder="Dedication" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} />
            <button onClick={()=>{ if(!baby.name || !baby.birthDate) return; setAuth('app'); }} className="w-full rounded-full py-3 text-white" style={{background:th.text}}>Start book</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background:th.bg,color:th.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Caveat:wght@500&family=EB+Garamond:wght@500&family=Inter:wght@400;500&family=Lora:wght@400;600&family=Playfair+Display:wght@600&display=swap');`}</style>
      
      {/* HEADER WITH TABS */}
      <div className="sticky top-0 z-20 backdrop-blur-md border-b" style={{background:`${th.card}ee`, borderColor:th.border}}>
        <div className="max-w-[960px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{background:th.accent}}>📖</div>
            <div><div className="text-sm font-medium" style={{fontFamily:safeFont.family}}>{baby.coverTitle || "Little Chapters"}</div><div className="text-[10px] opacity-60">{baby.name} • {weeksFilled}w • {totalPhotos} photos</div></div>
          </div>
          <div className="flex gap-1 bg-[#F5F1EA] rounded-full p-1">
            <button onClick={()=>setActiveTab('weeks')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${activeTab==='weeks'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Weeks</button>
            <button onClick={()=>setActiveTab('book')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${activeTab==='book'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Book</button>
            <button onClick={()=>setActiveTab('settings')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${activeTab==='settings'?'bg-[#2B2B2B] text-white':'opacity-60'}`}>Settings</button>
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 md:px-6 py-6">
        {activeTab==='weeks' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({length:53},(_,i)=>i).map(w=>{
                const has = weeks[w]?.photos?.length>0;
                const doneCount = Object.values(weeks[w]?.promptsDone||{}).filter((p:any)=>p.done).length;
                return <button key={w} onClick={()=>setCurWeek(w)} className={`shrink-0 rounded-full px-3 py-2 text-xs border ${curWeek===w?'bg-[#2B2B2B] text-white':'bg-white'}`} style={{borderColor: has? th.accent : th.border}}>{w}{has?'•':''}{doneCount?`✓${doneCount}`:''}</button>
              })}
            </div>

            <div className="mt-4 rounded-[24px] p-6 border" style={{background:th.card,borderColor:th.border}}>
              <div className="flex justify-between items-center"><div className="text-[11px] tracking-widest opacity-60">WEEK {curWeek} • {curWeek===0?'NEWBORN':curWeek<13?'1ST TRIMESTER':curWeek<26?'2ND TRIMESTER':curWeek<39?'3RD TRIMESTER':'ALMOST ONE'} • {getWeekDateRange(curWeek)}</div><div className="text-[10px] px-2 py-1 rounded-full bg-[#FDFBF7] border" style={{borderColor:th.border}}>{prompts.length} prompts</div></div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {prompts.map((pr, idx)=>{
                  const key = `${curWeek}-${idx}`;
                  const done = curData.promptsDone?.[key];
                  return (
                    <div key={idx} className={`rounded-[16px] border p-4 ${done?.done?'bg-[#F7FAFD]':''}`} style={{borderColor: done?.done? th.accent : th.border}}>
                      <div className="flex justify-between items-start"><div className="text-[10px] opacity-60">PROMPT {idx+1}</div><label className="flex items-center gap-2 text-[10px] cursor-pointer"><input type="checkbox" checked={!!done?.done} onChange={e=>{
                        const checked = e.target.checked; const today = new Date().toISOString().slice(0,10);
                        setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[key]:{done:checked, date: checked ? (done?.date||today) : ""}}}}; });
                      }} /> done {done?.done && done.date && <span className="px-1.5 py-0.5 rounded-full bg-white border text-[9px]">{done.date}</span>}</label></div>
                      <div className="text-[18px] mt-1 leading-tight" style={{fontFamily:safeFont.family}}>{pr.t}</div>
                      <div className="text-[13px] mt-1 opacity-80">{pr.d}</div>
                      <div className="text-[11px] mt-2 italic opacity-60">💡 {pr.tip}</div>
                      {done?.done && (
                        <div className="mt-2"><div className="text-[10px] opacity-60">Date occurred</div><input type="date" value={done.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[key]:{done:true, date:e.target.value}}}}; }); }} className="mt-1 w-full rounded-lg border px-2 py-1 text-xs" style={{borderColor:th.border}} /></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6"><div className="flex justify-between items-center"><div className="font-medium text-sm">Photos {curData.photos.length}/10 • Sorted by date</div><div className="h-2 w-24 rounded-full bg-[#E8E2D9] overflow-hidden"><div className="h-full" style={{width:`${curData.photos.length*10}%`,background:th.accent}} /></div></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {[...curData.photos].sort((a,b)=> (a.date||"").localeCompare(b.date||"")).map(p=><div key={p.id} className="relative rounded-xl overflow-hidden aspect-square bg-[#F0E6D8]"><img src={p.url} className="w-full h-full object-cover" /><div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-white">{p.date} {p.fromCamera?"📷":""}</div><button onClick={()=>{setWeeks(w=>{const cd=w[curWeek]||{photos:[]}; return {...w,[curWeek]:{...cd,photos:cd.photos.filter(x=>x.id!==p.id)}};});}} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs">✕</button></div>)}
                {curData.photos.length<10 && <div className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer p-2 text-center" style={{borderColor:th.border}} onClick={()=>setShowPhotoSheet(true)}><span className="text-xl">📸</span><span className="text-xs font-medium mt-1">Add Photo</span><span className="text-[10px] opacity-60">{new Date().toISOString().slice(0,10)}</span></div>}
              </div>
            </div>

            <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}>
              <div className="flex justify-between items-center"><div className="font-medium text-sm">Milestones • {Object.values(curData.milestones||{}).filter((m:any)=>m.checked).length}/{MILESTONES_LIST.length}</div><div className="text-[10px] opacity-60">date + details → book sorted by date</div></div>
              <div className="mt-4 space-y-3 max-h-[500px] overflow-auto pr-1">
                {MILESTONES_LIST.map(m=>{
                  const entry = curData.milestones?.[m] || {checked:false, date:"", details:""};
                  return (
                    <div key={m} className={`rounded-xl border p-3 ${entry.checked?'bg-[#FFFBF0]':''}`} style={{borderColor: entry.checked? th.accent : th.border}}>
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!entry.checked} onChange={e=>{
                          const checked = e.target.checked; const today = new Date().toISOString().slice(0,10);
                          setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{checked, date: checked ? (entry.date||today): "", details: entry.details||""}}}}; });
                        }} className="w-4 h-4" />
                        <span className={entry.checked?"font-medium":""}>{m}</span>
                        {entry.checked && entry.date && <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-white border">{entry.date}</span>}
                      </label>
                      {entry.checked && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2">
                          <div><div className="text-[10px] opacity-60">Date achieved</div><input type="date" value={entry.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...entry, date:e.target.value}}}}; }); }} className="mt-1 w-full rounded-lg border px-2 py-2 text-xs" style={{borderColor:th.border}} /></div>
                          <div><div className="text-[10px] opacity-60">Details - who, reaction, story</div><textarea value={entry.details} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},letter:"",promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...entry, details:e.target.value}}}}; }); }} placeholder="e.g., 6:30am after diaper, grandma visiting..." className="mt-1 w-full rounded-lg border px-2 py-2 text-xs h-[64px]" style={{borderColor:th.border}} /></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}><div className="font-medium text-sm">Letter for this week • Will appear in book by date</div><textarea value={curData.letter||""} onChange={e=>upd({letter:e.target.value})} placeholder="What do you want them to remember about this week?" className="mt-3 w-full rounded-xl border p-3 text-sm h-[80px]" style={{borderColor:th.border}} /></div>
          </>
        )}

        {activeTab==='book' && (
          <>
            {/* BOOK CUSTOMIZATIONS - SMOOTH */}
            <div className="rounded-[24px] border p-6" style={{background:th.card, borderColor:th.border}}>
              <div className="flex justify-between items-center">
                <div><div className="text-[11px] tracking-widest opacity-60">BOOK ASSEMBLY • FROM WEEKLY ENTRIES</div><div className="text-lg font-medium mt-1" style={{fontFamily:safeFont.family}}>Customize Your Heirloom Book</div></div>
                <div className="text-xs px-3 py-1 rounded-full bg-[#FDFBF7] border" style={{borderColor:th.border}}>{bookPages.length} weeks • {totalPhotos} photos</div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="text-[11px] font-medium opacity-70">Photos per week in book</div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[1,2,4,6].map(n=><button key={n} onClick={()=>setPhotosPerPage(n)} className={`rounded-xl border py-2 text-xs ${photosPerPage===n?'bg-[#2B2B2B] text-white':'bg-white'}`} style={{borderColor:th.border}}>{n}</button>)}
                  </div>
                  <div className="text-[10px] opacity-60 mt-1">Quantity: {photosPerPage} per week page</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium opacity-70">Photo style</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PHOTO_STYLES.map(s=><button key={s.id} onClick={()=>setPhotoStyle(s.id)} className={`rounded-xl border px-2 py-2 text-left text-xs ${photoStyle===s.id?'ring-2 ring-[#8A9A8B]':''}`} style={{borderColor:th.border}}><div className="font-medium">{s.name}</div><div className="text-[10px] opacity-60">{s.desc}</div></button>)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium opacity-70">Book content & sorting</div>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showPromptsInBook} onChange={e=>setShowPromptsInBook(e.target.checked)} /> Prompts (by date of occurrence)</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showMilestonesInBook} onChange={e=>setShowMilestonesInBook(e.target.checked)} /> Milestones (by date)</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showLettersInBook} onChange={e=>setShowLettersInBook(e.target.checked)} /> Weekly letters</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={sortByDate} onChange={e=>setSortByDate(e.target.checked)} /> Sort everything by date within week</label>
                  </div>
                </div>
              </div>
            </div>

            {/* COVER PREVIEW */}
            <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-6">
              <div className="rounded-[16px] shadow-xl border p-6 flex flex-col items-center text-center aspect-[3/4]" style={{background:th.card, borderColor:th.border, color:th.text, fontFamily:safeFont.family}}>
                <div className="text-[9px] tracking-[0.3em] opacity-60 uppercase">{COVER_STYLES.find(c=>c.id===coverStyle)?.name} • {th.name}</div>
                <div className="mt-6 text-[26px] leading-[1.1]">{baby.coverTitle || "Little Chapters"}</div>
                <div className="h-[1px] w-12 my-4 opacity-20" style={{background:'currentColor'}} />
                <div className="text-[13px] opacity-80">{baby.name} • First Year</div>
                <div className="text-[10px] mt-4 opacity-50">{baby.birthDate ? new Date(baby.birthDate).toLocaleDateString() : ''}</div>
                <div className="mt-auto text-[9px] opacity-40">{baby.dedication?.slice(0,50)}</div>
              </div>
              <div className="rounded-[16px] border p-4 bg-white max-h-[400px] overflow-auto" style={{borderColor:th.border}}>
                <div className="text-[11px] font-medium opacity-70">Book interior • Assembled from weekly entries • {bookPages.length} pages</div>
                {bookPages.length===0 ? <div className="text-xs opacity-60 mt-4">Add photos, check prompts, add milestones - they will appear here automatically sorted by date.</div> : (
                  <div className="mt-4 space-y-6">
                    {bookPages.map((pg:any)=>(
                      <div key={pg.week} className="border-b pb-4" style={{borderColor:th.border}}>
                        <div className="text-[11px] tracking-widest opacity-60">WEEK {pg.week} • {pg.dateRange}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {pg.photos.map((ph:any)=>(
                            <div key={ph.id} className={`${photoStyle==='polaroid'?'bg-white p-2 pb-6 shadow-md rotate-1': photoStyle==='classic'?'border-2 p-1': photoStyle==='full'?'rounded-none':'rounded-lg'} overflow-hidden`}>
                              <img src={ph.url} className={`w-full object-cover ${photoStyle==='masonry'?'h-auto':'aspect-square'}`} />
                              <div className="text-[9px] mt-1 opacity-60">{ph.date}</div>
                            </div>
                          ))}
                        </div>
                        {showPromptsInBook && pg.prompts.length>0 && (
                          <div className="mt-3"><div className="text-[10px] font-medium opacity-70">Prompts • by date of occurrence within this week</div>
                            {pg.prompts.map((pr:any)=><div key={pr.idx} className="text-xs mt-1"><span className="font-medium">{pr.t}</span> <span className="opacity-60">• {pr.date}</span><div className="text-[11px] opacity-70">{pr.d}</div></div>)}
                          </div>
                        )}
                        {showMilestonesInBook && pg.milestones.length>0 && (
                          <div className="mt-3"><div className="text-[10px] font-medium opacity-70">Milestones • by date</div>
                            {pg.milestones.map((ms:any)=><div key={ms.name} className="text-xs mt-1">✓ {ms.name} <span className="opacity-60">• {ms.date}</span>{ms.details && <div className="text-[11px] opacity-70 italic">"{ms.details}"</div>}</div>)}
                          </div>
                        )}
                        {showLettersInBook && pg.letter && <div className="mt-3 text-xs italic opacity-80">"{pg.letter}"</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab==='settings' && (
          <div className="space-y-6">
            <div className="rounded-[24px] border p-6" style={{background:th.card, borderColor:th.border}}>
              <div className="text-[11px] tracking-widest opacity-60">ACCOUNT INFO</div>
              <div className="mt-4 space-y-3">
                <div><div className="text-[11px] opacity-60">Email</div><div className="text-sm font-medium">{user?.email}</div></div>
                <div><div className="text-[11px] opacity-60">Baby</div><div className="text-sm">{baby.name} • {baby.birthDate}</div></div>
                <div><div className="text-[11px] opacity-60">Book</div><div className="text-sm">{baby.coverTitle} • {weeksFilled} weeks • {totalPhotos} photos</div></div>
                <div className="flex gap-2 pt-2">
                  <button onClick={()=>{setAuth('landing'); setUser(null); localStorage.clear();}} className="text-xs px-4 py-2 rounded-full border" style={{borderColor:th.border}}>Log out</button>
                  <button onClick={()=>{if(confirm('Clear all data?')){localStorage.clear(); location.reload();}}} className="text-xs px-4 py-2 rounded-full bg-[#2B2B2B] text-white">Clear data</button>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border p-6" style={{background:th.card, borderColor:th.border}}>
              <div className="text-[11px] tracking-widest opacity-60">APP SETTINGS • THEME</div>
              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] font-medium opacity-70">Theme</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(THEMES).map(([k,v]:any)=><button key={k} onClick={()=>setTheme(k)} className={`rounded-xl border p-3 text-left ${theme===k?'ring-2 ring-black':''}`} style={{background:v.bg, borderColor:v.border}}><div className="w-6 h-6 rounded-full mb-1" style={{background:v.accent}} /><div className="text-xs">{v.name}</div></button>)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium opacity-70">Title Font</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(FONTS).map(([k,v]:any)=><button key={k} onClick={()=>setFont(k)} className={`rounded-xl border p-3 text-left ${font===k?'ring-2 ring-[#8A9A8B]':''}`} style={{borderColor:th.border}}><div className="text-[13px]" style={{fontFamily:v.family}}>{v.name}</div><div className="text-[10px] opacity-60">{k}</div></button>)}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-[11px] font-medium opacity-70">Cover Style</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {COVER_STYLES.map(cs=><button key={cs.id} onClick={()=>setCoverStyle(cs.id)} className={`rounded-xl border p-3 text-left ${coverStyle===cs.id?'ring-2 ring-[#8A9A8B]':''}`} style={{borderColor:th.border}}><div className="text-xs font-medium">{cs.name}</div><div className="text-[10px] opacity-60">{cs.desc}</div></button>)}
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-3">
                <div><div className="text-[11px] opacity-60">Book Title</div><input value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" style={{borderColor:th.border}} /></div>
                <div><div className="text-[11px] opacity-60">Dedication</div><input value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" style={{borderColor:th.border}} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPhotoSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={()=>setShowPhotoSheet(false)}>
          <div className="bg-white rounded-t-[24px] w-full max-w-[400px] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E8E2D9] rounded-full mx-auto mb-5" />
            <div className="text-lg" style={{fontFamily:safeFont.family}}>Add photo to Week {curWeek}</div>
            <div className="text-xs opacity-60 mt-1">{curData.photos.length}/10 • {new Date().toISOString().slice(0,10)}</div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={openCamera} className="rounded-2xl border p-5 flex flex-col items-center gap-2" style={{borderColor:th.border}}><div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{background:th.bg}}>📷</div><div className="text-sm font-medium">Take Photo</div><div className="text-[10px] px-2 py-1 rounded-full bg-[#2B2B2B] text-white mt-1">capture=environment</div></button>
              <button onClick={openLibrary} className="rounded-2xl border p-5 flex flex-col items-center gap-2" style={{borderColor:th.border}}><div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{background:th.bg}}>🖼️</div><div className="text-sm font-medium">Library</div><div className="text-[10px] px-2 py-1 rounded-full border">multiple</div></button>
            </div>
            <button onClick={()=>setShowPhotoSheet(false)} className="w-full rounded-xl border py-3 text-sm mt-4" style={{borderColor:th.border}}>Cancel</button>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white text-xs px-4 py-2 rounded-full shadow-lg">{toast}</div>}
    </div>
  )
}
