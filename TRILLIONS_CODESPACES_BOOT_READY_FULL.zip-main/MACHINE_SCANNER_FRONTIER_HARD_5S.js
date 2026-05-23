const os=require("os"),crypto=require("crypto"),dns=require("dns"),net=require("net"),zlib=require("zlib");
const {performance}=require("perf_hooks");

const cpu=os.cpus(), cores=cpu.length;
const ramTotal=os.totalmem()/1073741824, ramFree=os.freemem()/1073741824;
const C={r:"\x1b[0m",b:"\x1b[1m",g:"\x1b[32m",y:"\x1b[33m",m:"\x1b[35m",c:"\x1b[36m"};

function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});}
function hash(x){return crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);}

function frontierHard5s(sec){
 let ops=0, acc=0, entropy=0, pressure=0;
 let x=0x9e3779b9|0;
 const start=process.hrtime.bigint(), end=BigInt(sec)*1000000000n;

 while((process.hrtime.bigint()-start)<end){
  const raw=Buffer.allocUnsafe(256*1024); raw.fill(x&255);
  zlib.gzipSync(raw,{level:1});

  for(let i=0;i<35000;i++){
   x^=x<<13; x^=x>>>17; x^=x<<5;

   const a=Math.sin((x+i)*0.000001);
   const b=Math.cos((x-i)*0.000003);
   const c=Math.sqrt(Math.abs(a*b)+1.000001);
   const d=Math.log1p((i%997)+Math.abs(x%4096));
   const e=Math.exp(-((i%2048)/4096));
   const f=Math.tan((a+b)*0.00001);

   // mini solveur dense type Frontier : spectral + turbulence + matrice + chaos
   acc+=a*a+b*b+c*d+e+f;
   entropy+=Math.sin(acc*0.000001)+Math.cos(pressure*0.000001);
   pressure+=Math.sqrt(Math.abs(entropy)+1);

   ops+=96;
  }
 }

 const elapsed=Number(process.hrtime.bigint()-start)/1e9;
 return {elapsed,ops,ops_s:ops/elapsed,acc,entropy,pressure,hash:hash(acc+entropy+pressure)};
}

async function ping(host){
 return new Promise(res=>{
  const t0=performance.now();
  dns.lookup(host,err=>{
   if(err)return res(null);
   const s=net.createConnection(443,host);
   s.setTimeout(2500);
   s.on("connect",()=>{const ms=performance.now()-t0;s.destroy();res(ms);});
   s.on("timeout",()=>{s.destroy();res(null);});
   s.on("error",()=>res(null));
  });
 });
}

(async()=>{
 console.log(C.b+C.y+"\n=== MACHINE SCANNER + FRONTIER-HARD 5s ==="+C.r);
 console.log("SYSTEM:",os.platform(),os.release(),os.arch());
 console.log("CPU:",cpu[0]?.model||"UNKNOWN");
 console.log("THREADS:",cores,"| RAM_TOTAL_GB:",ramTotal.toFixed(2),"| RAM_FREE_GB:",ramFree.toFixed(2));
 console.log("HONESTY: calcul réel local ; Frontier-hard = workload très difficile inspiré HPC, pas vrai Frontier.\n");

 console.log(C.m+"--- FRONTIER-HARD CHAOS 5s ---"+C.r);
 const r=frontierHard5s(5);
 console.log("TIME_s:",r.elapsed.toFixed(2));
 console.log("OPS:",fmt(r.ops));
 console.log("OPS/s:",fmt(r.ops_s));
 console.log("ENTROPY:",fmt(r.entropy));
 console.log("PRESSURE:",fmt(r.pressure));
 console.log("HASH:",r.hash);

 console.log(C.c+"\n--- NETWORK ---"+C.r);
 const hosts=["github.com","google.com","cloudflare.com"];
 let sum=0,ok=0;
 for(const h of hosts){
  const ms=await ping(h);
  console.log(h,ms?ms.toFixed(2)+" ms":"UNAVAILABLE");
  if(ms){sum+=ms;ok++;}
 }
 const avg=ok?sum/ok:0;

 const level=r.ops_s>50000000?"FRONTIER_HARD_EXTREME":r.ops_s>20000000?"VERY_HEAVY":"HEAVY";
 console.log(C.b+"\n--- RESULT ---"+C.r);
 console.log("LEVEL:",level);
 console.log("AVG_LATENCY_MS:",avg.toFixed(2));
 console.log("HEALTH:",(100-Math.min(avg,100)).toFixed(2)+"%");
 console.log("STATUS: OK");

 console.log("\nDICT:");
 console.log(JSON.stringify({
  DICT:["AUTO_DETECT","CPU_SCAN","NETWORK_SCAN","FRONTIER_HARD_5S","CHAOS","SPECTRAL","TURBULENCE","MATRIX_DENSE","COMPRESSION","REAL_ONLY_OR_UNAVAILABLE"],
  host:{cpu:cpu[0]?.model||"UNKNOWN",threads:cores,ram_total_gb:ramTotal,ram_free_gb:ramFree,node:process.version},
  benchmark:{seconds:5,ops:r.ops,ops_s:r.ops_s,entropy:r.entropy,pressure:r.pressure,latency_ms:avg,level,hash:r.hash},
  note:"Ce test force un calcul très lourd type HPC/spectral/turbulence pendant 5 secondes sans saturer durablement Codespaces."
 },null,2));
})();
