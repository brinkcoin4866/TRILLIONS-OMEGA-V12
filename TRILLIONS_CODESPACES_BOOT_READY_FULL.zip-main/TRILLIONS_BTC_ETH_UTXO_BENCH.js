const os=require("os"),crypto=require("crypto"),fs=require("fs");
const {performance}=require("perf_hooks");

const S=()=>performance.now();
const sec=x=>(x/1000).toFixed(3)+" s";
const fmt=n=>Number(n).toLocaleString("fr-FR");
const rate=n=>{
 if(n>=1e18)return(n/1e18).toFixed(3)+" EH/s";
 if(n>=1e15)return(n/1e15).toFixed(3)+" PH/s";
 if(n>=1e12)return(n/1e12).toFixed(3)+" TH/s";
 if(n>=1e9)return(n/1e9).toFixed(3)+" GH/s";
 if(n>=1e6)return(n/1e6).toFixed(3)+" MH/s";
 if(n>=1e3)return(n/1e3).toFixed(3)+" KH/s";
 return n.toFixed(2)+" H/s";
};
const yearly=h=>h*31536000;

function hasAlgo(a){return crypto.getHashes().includes(a)}
function support(){
 const hashes=crypto.getHashes();
 const cpu=os.cpus()[0]||{};
 const arch=os.arch(),plat=os.platform();
 return {
  base:"TRILLIONS",
  node:process.version,
  platform:plat,
  arch,
  cores:os.cpus().length,
  cpu:cpu.model||"UNKNOWN",
  ram_gb:(os.totalmem()/1024/1024/1024).toFixed(2),
  openssl:process.versions.openssl,
  btc_sha256:hasAlgo("sha256"),
  eth_sha3_256:hasAlgo("sha3-256"),
  ripemd160:hasAlgo("ripemd160"),
  blake2b512:hasAlgo("blake2b512"),
  categories:[
   "BTC_SUPPORT: SHA256d block/header hash",
   "UTXO_SUPPORT: txid/index/address/value scan synthétique",
   "ETH_SUPPORT: sha3-256 disponible si OpenSSL le supporte; ETH réel actuel = PoS, pas mining GPU/CPU",
   "AUTO_DETECT: CPU/RAM/Node/OpenSSL/hash algorithms",
   "YEAR_SPEED: projection hash/s sur 365 jours"
  ]
 }
}

function bench(name,loops,fn){
 const t0=S(); let x=0;
 for(let i=0;i<loops;i++)x^=fn(i);
 const dt=S()-t0, hps=loops/(dt/1000);
 return {name,loops,time_ms:dt.toFixed(2),speed:rate(hps),hps,year:rate(yearly(hps)),guard:x};
}

function sha256d(i){
 const b=Buffer.allocUnsafe(80);
 b.writeUInt32LE(i,0); b.writeUInt32LE(i*2654435761>>>0,4);
 const h1=crypto.createHash("sha256").update(b).digest();
 const h2=crypto.createHash("sha256").update(h1).digest();
 return h2[0];
}

function ethHash(i){
 const b=Buffer.from("TRILLIONS_ETH_TX_"+i);
 const algo=hasAlgo("sha3-256")?"sha3-256":"sha256";
 return crypto.createHash(algo).update(b).digest()[0];
}

function utxoScan(n){
 const utxos=[];
 for(let i=0;i<n;i++){
  const txid=crypto.createHash("sha256").update("utxo"+i).digest("hex");
  utxos.push({txid,vout:i&3,value:(i*17)%100000000,addr:"T"+txid.slice(0,20)});
 }
 const t0=S(); let sum=0,found=0;
 for(const u of utxos){
  if((u.value&255)>128){sum+=u.value;found++}
 }
 const dt=S()-t0;
 return {
  name:"UTXO_SCAN_SYNTH",
  entries:n,
  matched:found,
  satoshi_sum:sum,
  time_ms:dt.toFixed(2),
  scan_rate:fmt(n/(dt/1000))+" UTXO/s",
  year_capacity:fmt((n/(dt/1000))*31536000)+" UTXO/an"
 }
}

function latency(){
 const r=[];
 for(let k=0;k<200;k++){
  const t=S();
  crypto.createHash("sha256").update("ping"+k).digest();
  r.push(S()-t);
 }
 r.sort((a,b)=>a-b);
 return {
  p50_ms:r[Math.floor(r.length*.50)].toFixed(6),
  p95_ms:r[Math.floor(r.length*.95)].toFixed(6),
  p99_ms:r[Math.floor(r.length*.99)].toFixed(6)
 }
}

async function main(){
 const info=support();
 const loops=Number(process.env.LOOPS||200000);
 const utxos=Number(process.env.UTXOS||100000);

 console.log("=== TRILLIONS BTC ETH UTXO BENCH EOF ===");
 console.log(JSON.stringify(info,null,2));
 console.log("\n--- BENCH ---");

 const btc=bench("BTC_SHA256D_HEADER_HASH",loops,sha256d);
 const eth=bench("ETH_SHA3_256_OR_FALLBACK",loops,ethHash);
 const ux=utxoScan(utxos);
 const lat=latency();

 const out={
  timestamp:new Date().toISOString(),
  doctrine:"REAL_LOCAL_MEASURE_ONLY; yearly speed is projection from current Codespaces runtime",
  warning:"ETH mainnet is Proof-of-Stake: this is hash workload benchmark, not ETH mining",
  support:info,
  latency_hash_microtask:lat,
  results:[btc,eth],
  utxo:ux,
  categories_found:{
   BTC:info.btc_sha256?"SUPPORTED_SHA256D":"UNAVAILABLE",
   ETH_HASH_WORKLOAD:info.eth_sha3_256?"SUPPORTED_SHA3_256":"FALLBACK_SHA256",
   UTXO:"SUPPORTED_SYNTH_SCAN",
   HASH_YEAR_PROJECTION:"SUPPORTED",
   HARDWARE_DETECT:"SUPPORTED"
  }
 };
 fs.writeFileSync("TRILLIONS_BTC_ETH_UTXO_BENCH_RESULT.json",JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 console.log("\nRESULT saved: TRILLIONS_BTC_ETH_UTXO_BENCH_RESULT.json");
}
main().catch(e=>{console.error("BENCH_ERROR",e);process.exit(1)});
