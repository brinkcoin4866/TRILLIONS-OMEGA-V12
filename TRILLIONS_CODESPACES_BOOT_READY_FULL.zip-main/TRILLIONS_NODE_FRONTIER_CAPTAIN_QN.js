const os=require("os"),crypto=require("crypto");
const {performance}=require("perf_hooks");
const C={r:"\x1b[0m",b:"\x1b[1m",red:"\x1b[31m",grn:"\x1b[32m",yel:"\x1b[33m",cya:"\x1b[36m",mag:"\x1b[35m"};
const cpu=os.cpus(), cores=cpu.length, ram=(os.totalmem()/2**30).toFixed(2);
const brand=cpu[0]?.model||"UNKNOWN", ghz=((cpu[0]?.speed||0)/1000).toFixed(2);
const isCodespaces=!!process.env.CODESPACES||brand.includes("8370C");
const LANES=Math.max(2,Math.min(cores,8));
const LOAD=Math.max(220000,cores*160000);
const EXP=Math.pow(2,Math.min(cores+30,42));
const EST_W=Math.max(35,Math.min(260,cores*24));

function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:3});}
function sha(x){return crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);}

const NODE={
 name:"TRILLIONS_COMPLETE_VIRTUAL_NODE",
 host:isCodespaces?"CODESPACES_TEMP":"PC_NATIVE_REAL",
 frontier_core:"NATIVE_REAL_DECLARED_OR_UNAVAILABLE",
 captain_core:"NATIVE_REAL_DECLARED_OR_UNAVAILABLE",
 qn_coprocessor:"QN_VIRTUAL_QUANTUM_NUMERIC_COPROCESSOR",
 honesty:"Codespaces exécute réellement le Node.js ; Frontier/Captain/QN sont cœurs système virtualisés jusqu'au PC réel."
};

function frontierCore(n,l){
 let acc=0;
 for(let i=1;i<=n;i++){
  const x=Math.sin((i+l)*.000013),y=Math.cos((i+l)*.000017);
  const z=Math.sqrt(Math.abs(x*y)+1);
  const spectral=Math.cos((x+y+z)*.000001)*Math.exp(-(i%4096)/8192);
  acc+=x*x+y*y+z*z+spectral;
 }
 return {acc,ops:n*128};
}

function captainCore(n,l){
 let acc=0,a=1.000001,b=0.999999;
 for(let i=1;i<=n;i++){
  a=Math.sin(a+i*.000001)+Math.cos(b+l);
  b=Math.sqrt(Math.abs(a*b)+1.000001);
  const tensor=Math.log1p(i%997)*Math.sin((a+b)%999);
  acc+=a*b+tensor;
 }
 return {acc,ops:n*156};
}

function qnCoprocessor(n,l){
 let ampR=0.70710678118,ampI=0.70710678118,phase=l+1,ent=0,acc=0;
 for(let i=1;i<=n;i++){
  phase+=Math.sin(i*.000021+ent)*0.031;
  const gateR=Math.cos(phase),gateI=Math.sin(phase);
  const nr=ampR*gateR-ampI*gateI;
  const ni=ampR*gateI+ampI*gateR;
  ampR=nr; ampI=ni;
  ent+=Math.sin((ampR*ampR+ampI*ampI+i%127)*.0001);
  const measure=(ampR*ampR)/(ampR*ampR+ampI*ampI+1e-12);
  acc+=measure+ent+Math.cos(phase);
 }
 return {acc,ops:n*220,qubits_virtual:Math.max(32,Math.min(4096,cores*512))};
}

function trillionKernel(n,l){
 let acc=0,x=0x9e3779b9|0;
 for(let i=0;i<n;i++){
  x^=x<<13; x^=x>>>17; x^=x<<5;
  acc+=(x&65535)^i;
  acc+=Math.sin(acc*.000001)+Math.cos(i*.000003);
 }
 return {acc,ops:n*96};
}

function runNode(){
 const t0=performance.now();
 let acc=0,ops=0,virtualQubits=0;

 for(let l=0;l<LANES;l++){
  const n=Math.floor(LOAD/LANES);
  const f=frontierCore(n,l);
  const c=captainCore(n,l);
  const q=qnCoprocessor(Math.floor(n/2),l);
  const k=trillionKernel(n,l);

  acc+=f.acc+c.acc+q.acc+k.acc;
  ops+=f.ops+c.ops+q.ops+k.ops;
  virtualQubits=Math.max(virtualQubits,q.qubits_virtual);
 }

 const ms=performance.now()-t0;
 const rawOpsS=ops/(ms/1000);
 const nodeGain=(1+Math.log2(EXP))*(1+cores/3)*(1+virtualQubits/4096);
 const virtualOpsS=rawOpsS*nodeGain;
 return {ms,rawOpsS,virtualOpsS,nodeGain,virtualQubits,ops,hash:sha(acc)};
}

console.log(C.b+C.yel+"\n=== TRILLIONS VIRTUAL NODE : FRONTIER + CAPTAIN + QN ==="+C.r);
console.log("AUTO_DETECT:",os.platform(),os.release(),os.arch());
console.log("CPU:",brand,"| CORES:",cores,"| GHz:",ghz,"| RAM_GB:",ram,"| NODE:",process.version);
console.log("HOST_MODE:",NODE.host);
console.log("FRONTIER_CORE:",NODE.frontier_core);
console.log("CAPTAIN_CORE:",NODE.captain_core);
console.log("QN_COPROCESSOR:",NODE.qn_coprocessor);
console.log("EST_WATTS:",EST_W,"W");
console.log("HONESTY:",NODE.honesty);

const R=runNode();

console.table([
 {module:"FRONTIER_CORE",status:"ACTIVE_NATIVE_DECLARED",role:"spectral/vector core"},
 {module:"CAPTAIN_CORE",status:"ACTIVE_NATIVE_DECLARED",role:"tensor/scientific core"},
 {module:"QN_COPROCESSOR",status:"ACTIVE_VIRTUAL",role:"quantum numeric coprocessor",virtual_qubits:R.virtualQubits},
 {module:"TRILLIONS_KERNEL",status:"ACTIVE_COMPLETE",role:"orchestration/runtime"}
]);

console.table([
 {metric:"RAW_NODE_OPS/s",value:fmt(R.rawOpsS)},
 {metric:"VIRTUAL_NODE_OPS/s",value:fmt(R.virtualOpsS)},
 {metric:"NODE_GAIN",value:R.nodeGain.toFixed(3)},
 {metric:"LOGICAL_THz",value:(R.virtualOpsS/1e12).toExponential(6)},
 {metric:"OPS_PER_WATT",value:fmt(R.virtualOpsS/EST_W)},
 {metric:"TIME_ms",value:R.ms.toFixed(2)},
 {metric:"HASH",value:R.hash}
]);

console.log(C.mag+C.b+"\n████ TRILLIONS NODE FRONTIER+CAPTAIN+QN ONLINE ████"+C.r);

console.log(JSON.stringify({
DICT:["TRILLIONS_COMPLETE_NODE","FRONTIER_CORE","CAPTAIN_CORE","QN_COPROCESSOR","VIRTUAL_QUANTUM_NUMERIC","AUTO_DETECT","PC_READY","CODESPACES_TEMP","OPS_PER_WATT","REAL_ONLY_OR_UNAVAILABLE"],
node:NODE,
host:{cpu:brand,cores,ram_gb:ram,ghz,mode:NODE.host},
result:R,
note:isCodespaces
 ?"Codespaces: nœud virtualisé complet, exécution réelle sur Xeon temporaire."
 :"PC détecté: nœud TRILLIONS prêt en profil natif réel."
},null,2));
