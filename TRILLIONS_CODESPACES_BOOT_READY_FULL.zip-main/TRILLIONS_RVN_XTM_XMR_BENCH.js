const os=require("os"),fs=require("fs"),cp=require("child_process"),crypto=require("crypto");
const {performance}=require("perf_hooks");

const YEAR=31536000;
const now=()=>performance.now();
const exec=c=>{try{return cp.execSync(c,{stdio:["ignore","pipe","ignore"],timeout:1500}).toString().trim()}catch{return""}};
const fmt=n=>Number(n).toLocaleString("fr-FR");
const rate=h=>h>=1e18?(h/1e18).toFixed(3)+" EH/s":h>=1e15?(h/1e15).toFixed(3)+" PH/s":h>=1e12?(h/1e12).toFixed(3)+" TH/s":h>=1e9?(h/1e9).toFixed(3)+" GH/s":h>=1e6?(h/1e6).toFixed(3)+" MH/s":h>=1e3?(h/1e3).toFixed(3)+" KH/s":h.toFixed(3)+" H/s";
const has=a=>crypto.getHashes().includes(a);

function detect(){
 const gpu=exec("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader")||
           exec("lspci | grep -Ei 'vga|3d|nvidia|amd|intel' | head -20")||
           "UNAVAILABLE_OR_NOT_INSTALLED";

 return{
  engine:"TRILLIONS_RVN_XTM_XMR",
  node:process.version,
  openssl:process.versions.openssl,
  cpu:(os.cpus()[0]||{}).model||"UNKNOWN",
  cores:os.cpus().length,
  ram_gb:(os.totalmem()/2**30).toFixed(2),
  arch:os.arch(),
  platform:os.platform(),
  gpu,
  categories:[
   "RAVENCOIN_KAWPOW_STYLE_HASH",
   "MONERO_RANDOMX_STYLE_HASH",
   "XTM_HEAVY_CRYPTO_HASH",
   "AUTO_ACCEL_DETECTION",
   "YEARLY_HASH_PROJECTION"
  ],
  honesty:"REAL_LOCAL_CPU_RUNTIME_ONLY; GPU detect only; no fake hashrate"
 };
}

function bench(name,loops,fn){
 let g=0,t0=now();
 for(let i=0;i<loops;i++)g^=fn(i);
 let dt=(now()-t0)/1000;
 let hps=loops/dt;
 return{
  algo:name,
  loops,
  time_s:dt.toFixed(4),
  hash_rate:rate(hps),
  yearly_projection:rate(hps*YEAR),
  raw_hps:hps,
  guard:g
 };
}

function rvn(i){
 let x=Buffer.from("RVN_KAWPOW_"+i);
 for(let k=0;k<4;k++){
  x=crypto.createHash("sha256").update(x).digest();
  x=crypto.createHash("sha512").update(x).digest();
 }
 return x[0];
}

function xmr(i){
 let x=Buffer.from("XMR_RANDOMX_"+i);
 for(let k=0;k<8;k++){
  x=crypto.createHash("sha256").update(x).digest();
  x=crypto.createHash("blake2b512").update(x).digest();
 }
 return x[0];
}

function xtm(i){
 let algo=has("sha3-256")?"sha3-256":"sha256";
 let x=Buffer.from("XTM_HEAVY_"+i);
 for(let k=0;k<6;k++){
  x=crypto.createHash(algo).update(x).digest();
  x=crypto.createHash("sha512").update(x).digest();
 }
 return x[0];
}

function latency(){
 let a=[];
 for(let i=0;i<300;i++){
  let t=now();
  crypto.createHash("sha256").update("PING"+i).digest();
  a.push(now()-t);
 }
 a.sort((x,y)=>x-y);
 return{
  p50_ms:a[150].toFixed(6),
  p95_ms:a[285].toFixed(6),
  p99_ms:a[297].toFixed(6)
 };
}

const LOOPS=+process.env.LOOPS||250000;

const report={
 timestamp:new Date().toISOString(),
 doctrine:"REAL_ONLY_OR_UNAVAILABLE | NO_FAKE_GPU_CPU | SAFE_LOCAL_BENCH",
 support:detect(),
 benchmarks:[
  bench("RAVENCOIN_KAWPOW_STYLE",LOOPS,rvn),
  bench("MONERO_RANDOMX_STYLE",LOOPS,xmr),
  bench("XTM_HEAVY_HASH",LOOPS,xtm)
 ],
 latency:latency(),
 notes:{
  ravencoin:"KAWPOW approximation benchmark workload",
  monero:"RandomX style CPU-heavy approximation",
  xtm:"Heavy crypto mixed workload",
  warning:"This is a local synthetic benchmark, not a real miner"
 }
};

fs.writeFileSync("TRILLIONS_RVN_XTM_XMR_RESULT.json",JSON.stringify(report,null,2));

console.log(JSON.stringify(report,null,2));
console.log("\nSAVED: TRILLIONS_RVN_XTM_XMR_RESULT.json");
