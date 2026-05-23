const fs=require("fs");

const targets=["app.js","server.js","runtime.js"];

const PATCH=`

// ===== TRILLIONS SOCKET + UPTIME PATCH =====
global.TRILLIONS_RUNTIME_START=global.TRILLIONS_RUNTIME_START||Date.now();

function trillionsSafe(v,d=0){
 return Number.isFinite(v)?v:d;
}

function trillionsUptime(){
 const s=Math.floor((Date.now()-global.TRILLIONS_RUNTIME_START)/1000);
 const d=Math.floor(s/86400);
 const h=Math.floor((s%86400)/3600);
 const m=Math.floor((s%3600)/60);
 const sec=s%60;
 return d+"d "+h+"h "+m+"m "+sec+"s";
}

function trillionsSocketState(io){
 try{
  if(!io)return "SOCKET OFF";
  return io.engine&&io.engine.clientsCount>=0
   ? "SOCKET ON "+io.engine.clientsCount
   : "SOCKET ON";
 }catch(e){
  return "SOCKET OFF";
 }
}

setInterval(()=>{
 try{
  const up=document.getElementById("uptime");
  if(up)up.innerText="UPTIME "+trillionsUptime();

  const sock=document.getElementById("socket-state");
  if(sock)sock.innerText=window.socket&&window.socket.connected
   ?"SOCKET ON"
   :"SOCKET OFF";
 }catch(e){}
},1000);

// JSON SAFE FETCH
async function trillionsFetchJSON(url,opt={}){
 try{
  const r=await fetch(url,opt);
  const t=await r.text();

  if(!t||!t.trim()){
   return {ok:false,error:"EMPTY_RESPONSE"};
  }

  try{
   return JSON.parse(t);
  }catch(e){
   return {
    ok:false,
    error:"INVALID_JSON",
    preview:t.slice(0,120)
   };
  }
 }catch(e){
  return {
   ok:false,
   error:e.message
  };
 }
}

// OUTPUT SAFE
function trillionsOutput(msg){
 const el=document.getElementById("output");
 if(!el)return;
 if(typeof msg==="object"){
  el.textContent=JSON.stringify(msg,null,2);
 }else{
  el.textContent=String(msg);
 }
}

console.log("[TRILLIONS PATCH] UPTIME + SOCKET + JSON FIX ACTIVE");

// ===== END PATCH =====
`;

for(const f of targets){
 if(!fs.existsSync(f))continue;

 let txt=fs.readFileSync(f,"utf8");

 if(!txt.includes("TRILLIONS SOCKET + UPTIME PATCH")){
  txt+=PATCH;
 }

 txt=txt.replace(
  /response\.json\(\)/g,
  "trillionsFetchJSON(response)"
 );

 txt=txt.replace(
  /fetch\(([^)]+)\)\s*\.then\(([^=]+)=>\s*\\2\.json\(\)\)/g,
  "fetch($1).then(async r=>trillionsFetchJSON($1))"
 );

 fs.writeFileSync(f,txt);
 console.log("[PATCHED]",f);
}

console.log("\\nTRILLIONS UPTIME PATCH COMPLETE");
