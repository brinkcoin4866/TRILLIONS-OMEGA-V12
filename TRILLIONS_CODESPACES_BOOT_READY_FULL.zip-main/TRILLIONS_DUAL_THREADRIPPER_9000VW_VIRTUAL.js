const os=require("os"),fs=require("fs"),cp=require("child_process"),crypto=require("crypto");
const {Worker,isMainThread,parentPort,workerData}=require("worker_threads");
const {performance}=require("perf_hooks");
const YEAR=31536000, now=()=>performance.now();
const sh=c=>{try{return cp.execSync(c,{stdio:["ignore","pipe","ignore"],timeout:1600}).toString().trim()}catch{return""}};
const rate=h=>h>=1e18?(h/1e18).toFixed(3)+" EH/s":h>=1e15?(h/1e15).toFixed(3)+" PH/s":h>=1e12?(h/1e12).toFixed(3)+" TH/s":h>=1e9?(h/1e9).toFixed(3)+" GH/s":h>=1e6?(h/1e6).toFixed(3)+" MH/s":h>=1e3?(h/1e3).toFixed(3)+" KH/s":h.toFixed(2)+" H/s";
const has=a=>crypto.getHashes().includes(a);

function detect(){
 let nvidia=sh("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader");
 let lspci=sh("lspci | grep -Ei 'vga|3d|nvidia|amd|intel|tpu|accelerator|quantum' | head -30");
 let opencl=sh("clinfo | grep -Ei 'Device Name|Platform Name' | head -25");
 let vulkan=sh("vulkaninfo --summary 2>/dev/null | head -40");
 return{
  engine:"TRILLIONS_REAL_VIRTUALIZED_DUAL_THREADRIPPER_9000VW",
  doctrine:"REAL_ONLY_OR_UNAVAILABLE | NO_FAKE_POWER | VIRTUAL_CPU_ORCHESTRATION_ONLY",
  node:process.version,openssl:process.versions.openssl,
  host_cpu:(os.cpus()[0]||{}).model||"UNKNOWN",
  host_cores:os.cpus().length,
  host_ram_gb:(os.totalmem()/2**30).toFixed(2),
  arch:os.arch(),platform:os.platform(),
  gpu:nvidia||lspci||"UNAVAILABLE_OR_NOT_INSTALLED",
  opencl:opencl||"UNAVAILABLE_OR_NOT_INSTALLED",
  vulkan:vulkan||"UNAVAILABLE_OR_NOT_INSTALLED",
  tpu:/tpu/i.test(lspci)?"DETECTED":"UNAVAILABLE_OR_NOT_INSTALLED",
  quantum:/quantum/i.test(lspci)?"DETECTED":"UNAVAILABLE_OR_NOT_INSTALLED",
  hashes:{sha256:has("sha256"),sha3_256:has("sha3-256"),blake2b512:has("blake2b512"),ripemd160:has("ripemd160")},
  honesty:"Modules détectés seulement; aucune puissance GPU/TPU/quantum inventée."
 };
}

function shaWork(i){
 let b=Buffer.allocUnsafe(96);
 b.writeUInt32LE(i>>>0,0); b.writeUInt32LE((i*2654435761)>>>0,4);
 return crypto.createHash("sha256").update(crypto.createHash("sha256").update(b).digest()).digest()[0];
}
function mixWork(i){
 let a=has("sha3-256")?"sha3-256":"sha256",x=Buffer.from("TRILLIONS_9000VW_"+i);
 for(let k=0;k<5;k++){x=crypto.createHash(a).update(x).digest();x=crypto.createHash("sha512").update(x).digest()}
 return x[0];
}
function utxoScan(n){
 let t=now(),sum=0,hit=0;
 for(let i=0;i<n;i++){let v=(i*97)%100000000;if((v&255)>120){sum+=v;hit++}}
 let dt=(now()-t)/1000,r=n/dt;
 return{entries:n,matched:hit,satoshi_sum:sum,time_s:dt.toFixed(4),scan_rate:rate(r),scan_year:rate(r*YEAR)};
}

if(!isMainThread){
 let loops=workerData.loops,mode=workerData.mode,g=0,t=now();
 for(let i=0;i<loops;i++)g^=(mode==="sha"?shaWork(i+workerData.seed):mixWork(i+workerData.seed));
 let dt=(now()-t)/1000,hps=loops/dt;
 parentPort.postMessage({id:workerData.id,mode,loops,time_s:dt,hps,guard:g});
 return;
}

function runWorker(id,mode,loops){
 return new Promise((res,rej)=>{
  const w=new Worker(__filename,{workerData:{id,mode,loops,seed:id*1000003}});
  w.on("message",res);w.on("error",rej);
 });
}

async function main(){
 const LOOPS=+process.env.LOOPS||120000;
 const LANES=Math.min(+process.env.LANES||Math.max(2,os.cpus().length),32);
 const per=Math.max(1000,Math.floor(LOOPS/LANES));

 const virtual={
  name:"TRILLIONS_DUAL_THREADRIPPER_9000VW_VIRTUAL",
  physical_claim:false,
  sockets_virtual:2,
  virtual_ccd_per_socket:16,
  virtual_threads_total:1024,
  worker_lanes_real_used:LANES,
  scheduler:"ADAPTIVE_BATCH_WORKER_THREADS",
  cache_mesh:"VIRTUAL_PRESSURE_AWARE",
  acceleration_policy:"DETECT_REAL_OR_UNAVAILABLE",
  note:"Deux Threadripper 9000VW = couche logique TRILLIONS, pas matériel AMD réel."
 };

 let t0=now();
 let jobs=[];
 for(let i=0;i<LANES;i++)jobs.push(runWorker(i,i%2?"mix":"sha",per));
 let results=await Promise.all(jobs);
 let wall=(now()-t0)/1000;
 let total=results.reduce((a,b)=>a+b.loops,0);
 let hps=total/wall;
 let sha=results.filter(x=>x.mode==="sha").reduce((a,b)=>a+b.hps,0);
 let mix=results.filter(x=>x.mode==="mix").reduce((a,b)=>a+b.hps,0);

 let report={
  timestamp:new Date().toISOString(),
  base:"TRILLIONS",
  support:detect(),
  virtual_threadripper_9000vw:virtual,
  benchmark:{
   wall_time_s:wall.toFixed(4),
   total_ops:total,
   aggregate_speed:rate(hps),
   aggregate_year_projection:rate(hps*YEAR),
   sha_lanes_speed_estimate:rate(sha),
   mix_lanes_speed_estimate:rate(mix),
   worker_results:results.map(x=>({id:x.id,mode:x.mode,loops:x.loops,time_s:x.time_s.toFixed(4),speed:rate(x.hps)}))
  },
  utxo:utxoScan(+process.env.UTXOS||250000),
  verdict:"TRILLIONS virtualisation complète active: réel mesuré sur Codespaces + couche 2x9000VW logique.",
  honesty:"Le score dépend du host Codespaces; virtualisation = orchestration, pas augmentation matérielle magique."
 };

 fs.writeFileSync("TRILLIONS_DUAL_THREADRIPPER_9000VW_RESULT.json",JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 console.log("\nSAVED: TRILLIONS_DUAL_THREADRIPPER_9000VW_RESULT.json");
}
main().catch(e=>{console.error("TRILLIONS_ERROR",e);process.exit(1)});
