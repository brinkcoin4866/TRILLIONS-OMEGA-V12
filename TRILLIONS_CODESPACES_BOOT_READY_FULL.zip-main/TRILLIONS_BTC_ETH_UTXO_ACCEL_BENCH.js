const os=require("os"),fs=require("fs"),cp=require("child_process"),crypto=require("crypto");
const {performance}=require("perf_hooks");
const now=()=>performance.now(),YEAR=31536000;
const fmt=n=>Number(n).toLocaleString("fr-FR");
const rate=h=>h>=1e18?(h/1e18).toFixed(3)+" EH/s":h>=1e15?(h/1e15).toFixed(3)+" PH/s":h>=1e12?(h/1e12).toFixed(3)+" TH/s":h>=1e9?(h/1e9).toFixed(3)+" GH/s":h>=1e6?(h/1e6).toFixed(3)+" MH/s":h>=1e3?(h/1e3).toFixed(3)+" KH/s":h.toFixed(2)+" H/s";
const sh=c=>{try{return cp.execSync(c,{stdio:["ignore","pipe","ignore"],timeout:1500}).toString().trim()}catch{return""}};
const has=a=>crypto.getHashes().includes(a);

function detect(){
 let nvidia=sh("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader");
 let lspci=sh("lspci | grep -Ei 'vga|3d|nvidia|amd|intel|tpu|accelerator' | head -20");
 let opencl=sh("clinfo | grep -Ei 'Device Name|Platform Name' | head -20");
 let vulkan=sh("vulkaninfo --summary 2>/dev/null | head -40");
 return {
  engine:"TRILLIONS_ACCEL_AUTO_DETECT",
  node:process.version,openssl:process.versions.openssl,
  cpu:(os.cpus()[0]||{}).model||"UNKNOWN",cores:os.cpus().length,
  arch:os.arch(),platform:os.platform(),
  ram_gb:(os.totalmem()/2**30).toFixed(2),
  gpu:nvidia||lspci||"UNAVAILABLE_OR_NOT_INSTALLED",
  opencl:opencl||"UNAVAILABLE_OR_NOT_INSTALLED",
  vulkan:vulkan||"UNAVAILABLE_OR_NOT_INSTALLED",
  tpu:/tpu/i.test(lspci)?"DETECTED":"UNAVAILABLE_OR_NOT_INSTALLED",
  quantum:"UNAVAILABLE_OR_NOT_INSTALLED",
  hashes:{sha256:has("sha256"),sha3_256:has("sha3-256"),ripemd160:has("ripemd160"),blake2b512:has("blake2b512")},
  honesty:"GPU/TPU/quantum detection only; no fake accelerator FLOPS or hash claim"
 };
}

function bench(name,loops,fn){
 let t=now(),g=0; for(let i=0;i<loops;i++)g^=fn(i);
 let dt=(now()-t)/1000,hps=loops/dt;
 return {name,loops,time_s:dt.toFixed(4),speed:rate(hps),hash_per_second:hps,hash_per_year:rate(hps*YEAR),guard:g};
}
function btc(i){
 let b=Buffer.allocUnsafe(80); b.writeUInt32LE(i>>>0,0); b.writeUInt32LE((i*2654435761)>>>0,4);
 return crypto.createHash("sha256").update(crypto.createHash("sha256").update(b).digest()).digest()[0];
}
function eth(i){
 let a=has("sha3-256")?"sha3-256":"sha256";
 return crypto.createHash(a).update("TRILLIONS_ETH_WORK_"+i).digest()[0];
}
function utxo(n){
 let arr=[]; for(let i=0;i<n;i++){let tx=crypto.createHash("sha256").update("u"+i).digest("hex");arr.push({tx,v:i&3,val:(i*97)%100000000})}
 let t=now(),sum=0,hit=0; for(const u of arr){if((u.val&255)>120){sum+=u.val;hit++}}
 let dt=(now()-t)/1000,r=n/dt;
 return {name:"UTXO_SYNTH_SCAN",entries:n,matched:hit,satoshi_sum:sum,time_s:dt.toFixed(4),scan_rate:fmt(r)+" UTXO/s",scan_year:fmt(r*YEAR)+" UTXO/an"};
}
function latency(){
 let r=[]; for(let i=0;i<300;i++){let t=now();crypto.createHash("sha256").update("p"+i).digest();r.push(now()-t)}
 r.sort((a,b)=>a-b); return {p50_ms:r[150].toFixed(6),p95_ms:r[285].toFixed(6),p99_ms:r[297].toFixed(6)};
}

const LOOPS=+process.env.LOOPS||300000, UTXOS=+process.env.UTXOS||150000;
let report={
 timestamp:new Date().toISOString(),
 doctrine:"REAL_LOCAL_MEASURE_ONLY | REAL_OR_UNAVAILABLE | NO_FAKE_GPU_CPU",
 base:"TRILLIONS",
 support:detect(),
 categories:{
  BTC:"SHA256D_HEADER_HASH",
  ETH:"SHA3_256_IF_AVAILABLE_ELSE_SHA256_WORKLOAD; ETH_MAINNET_IS_POS",
  UTXO:"SYNTHETIC_LOCAL_SCAN",
  ACCEL:"GPU_TPU_QUANTUM_ACCELERATOR_DETECTION_ONLY"
 },
 benchmarks:[
  bench("BTC_SHA256D",LOOPS,btc),
  bench("ETH_SHA3_256_OR_FALLBACK",LOOPS,eth)
 ],
 utxo:utxo(UTXOS),
 latency:latency()
};
fs.writeFileSync("TRILLIONS_BTC_ETH_UTXO_ACCEL_RESULT.json",JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
console.log("\nSAVED: TRILLIONS_BTC_ETH_UTXO_ACCEL_RESULT.json");
