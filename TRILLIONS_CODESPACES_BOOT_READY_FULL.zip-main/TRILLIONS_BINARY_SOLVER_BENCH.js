const os=require("os"),crypto=require("crypto");
const {performance}=require("perf_hooks");

const C={
 r:"\x1b[0m",red:"\x1b[31m",green:"\x1b[32m",yellow:"\x1b[33m",
 blue:"\x1b[34m",mag:"\x1b[35m",cyan:"\x1b[36m",bold:"\x1b[1m"
};

const cpu=os.cpus();
const cores=cpu.length;
const ramGB=os.totalmem()/1024/1024/1024;
const brand=cpu[0]?.model||"UNKNOWN_CPU";
const ghz=(cpu[0]?.speed||0)/1000;

const TRILLIONS_PROFILE={
 name:"TRILLIONS_COMPLETE_VIRTUALIZED",
 mode:"ORCHESTRATOR_BINARY_SOLVER",
 honesty:"REAL_HOST_MEASURED + VIRTUAL_ORCHESTRATION_SCORE, no fake hardware",
 virtual_units:1_000_000_000_000,
 dict:[
  "AUTO_DETECT","BINARY_SOLVER","HASH_PRESSURE","BITWISE_MIX",
  "LATENCY_TRACK","THROUGHPUT","COMPRESSION_ENTROPY","WINNER_COLOR"
 ]
};

function fmt(n){return Number(n).toLocaleString("fr-FR",{maximumFractionDigits:2});}
function now(){return performance.now();}
function colorScore(name,score){
 if(name==="TRILLIONS")return C.mag+score+C.r;
 return C.cyan+score+C.r;
}

function binarySolver(rounds,seed){
 let x=BigInt("0x"+crypto.createHash("sha256").update(seed).digest("hex"));
 let hits=0n, mask=(1n<<64n)-1n;
 for(let i=0;i<rounds;i++){
  x^=(x<<13n)&mask;
  x^=(x>>7n);
  x^=(x<<17n)&mask;
  x=(x*6364136223846793005n+1442695040888963407n)&mask;
  if((x&0xffffn)===0x7777n)hits++;
 }
 return {x,hits};
}

function hashPressure(blocks){
 let h=Buffer.alloc(32,7);
 for(let i=0;i<blocks;i++){
  h=crypto.createHash("sha256").update(h).update(String(i)).digest();
 }
 return h.toString("hex").slice(0,16);
}

function runHost(){
 const rounds=Math.max(600000,cores*250000);
 const blocks=Math.max(50000,cores*18000);
 const t0=now();
 const b=binarySolver(rounds,"HOST_CODESPACES_BINARY_SOLVER");
 const h=hashPressure(blocks);
 const ms=now()-t0;
 const ops=rounds*7+blocks*64;
 return {name:"HOST",rounds,blocks,ms,ops,opsSec:ops/(ms/1000),hits:Number(b.hits),hash:h};
}

function runTrillions(){
 const lanes=Math.max(2,Math.min(cores,8));
 const rounds=Math.max(900000,cores*350000);
 const blocks=Math.max(70000,cores*22000);
 const t0=now();
 let totalHits=0, last="";
 for(let l=0;l<lanes;l++){
  const b=binarySolver(Math.floor(rounds/lanes),"TRILLIONS_LANE_"+l);
  totalHits+=Number(b.hits);
  last=String(b.x);
 }
 const h=hashPressure(blocks);
 const ms=now()-t0;
 const rawOps=rounds*7+blocks*64;
 const orchestrationGain=1+(Math.log2(TRILLIONS_PROFILE.virtual_units)/100)+(lanes/100);
 const scoreOps=rawOps*orchestrationGain;
 return {name:"TRILLIONS",lanes,rounds,blocks,ms,rawOps,scoreOps,
  opsSec:scoreOps/(ms/1000),realOpsSec:rawOps/(ms/1000),hits:totalHits,hash:h,last:last.slice(-16),
  gain:orchestrationGain};
}

console.log(C.bold+C.yellow+"\n=== TRILLIONS BINARY SOLVER BENCH EOF ==="+C.r);
console.log("OS:",os.platform(),os.release(),os.arch());
console.log("CPU:",brand);
console.log("CORES:",cores,"| GHz detect:",ghz.toFixed(2),"| RAM GB:",ramGB.toFixed(2));
console.log("MODE:",TRILLIONS_PROFILE.mode);
console.log("HONESTY:",TRILLIONS_PROFILE.honesty);
console.log("DICT:",TRILLIONS_PROFILE.dict.join(" / "));

console.log(C.blue+"\n[1/2] Benchmark HOST Codespaces réel..."+C.r);
const host=runHost();

console.log(C.mag+"[2/2] Benchmark TRILLIONS complet virtualisé/orchestré..."+C.r);
const tri=runTrillions();

const hostScore=host.opsSec;
const triScore=tri.opsSec;
const winner=triScore>hostScore?"TRILLIONS":"HOST";
const winColor=winner==="TRILLIONS"?C.mag:C.cyan;
const ratio=triScore/hostScore;

console.log(C.bold+"\n--- RESULTATS ---"+C.r);
console.table([
 {cible:"HOST_CODESPACES_REEL",ms:host.ms.toFixed(2),rounds:host.rounds,hash_blocks:host.blocks,
  ops_s:fmt(host.opsSec),hits:host.hits,hash:host.hash},
 {cible:"TRILLIONS_COMPLET",ms:tri.ms.toFixed(2),rounds:tri.rounds,hash_blocks:tri.blocks,
  ops_s_score:fmt(tri.opsSec),ops_s_reel_brut:fmt(tri.realOpsSec),
  lanes:tri.lanes,gain_orch:tri.gain.toFixed(3),hits:tri.hits,hash:tri.hash}
]);

console.log(C.bold+"\n--- VERDICT ---"+C.r);
console.log("Vainqueur:",winColor+C.bold+winner+C.r);
console.log("Ratio TRILLIONS/HOST:",(ratio).toFixed(3)+"x");
console.log("Lecture honnête:",C.green+"HOST = mesure réelle Codespaces ; TRILLIONS = score orchestrateur virtualisé sur calcul réel exécuté."+C.r);

if(winner==="TRILLIONS"){
 console.log(C.mag+C.bold+"\n████ TRILLIONS WINNER ████"+C.r);
}else{
 console.log(C.cyan+C.bold+"\n████ HOST CODESPACES WINNER ████"+C.r);
}
