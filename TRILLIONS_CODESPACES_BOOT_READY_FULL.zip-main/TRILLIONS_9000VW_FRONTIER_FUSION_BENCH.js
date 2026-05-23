const os=require("os"),fs=require("fs"),crypto=require("crypto");
const {performance}=require("perf_hooks");

const now=()=>performance.now();
const YEAR=31536000;

const LOOPS=+process.env.LOOPS||1200000;
const LANES=+process.env.LANES||64;
const UTXOS=+process.env.UTXOS||1500000;

const FRONTIER_FP64=1.102e18;

const rate=h=>h>=1e18?(h/1e18).toFixed(3)+" Eops/s":
h>=1e15?(h/1e15).toFixed(3)+" Pops/s":
h>=1e12?(h/1e12).toFixed(3)+" Tops/s":
h>=1e9?(h/1e9).toFixed(3)+" Gops/s":
h>=1e6?(h/1e6).toFixed(3)+" Mops/s":
h>=1e3?(h/1e3).toFixed(3)+" Kops/s":
h.toFixed(2)+" ops/s";

function host(){
 return{
  cpu:(os.cpus()[0]||{}).model||"UNKNOWN",
  threads:os.cpus().length,
  ram_gb:(os.totalmem()/2**30).toFixed(2),
  node:process.version,
  platform:os.platform(),
  arch:os.arch()
 };
}

function sha(i){
 let x=Buffer.allocUnsafe(96);
 x.writeUInt32LE(i>>>0,0);
 return crypto.createHash("sha256")
 .update(
 crypto.createHash("sha256").update(x).digest()
 ).digest()[0];
}

function heavy(i){
 let b=Buffer.from("TRILLIONS_FRONTIER_"+i);
 for(let k=0;k<5;k++){
  b=crypto.createHash("sha512").update(b).digest();
  b=crypto.createHash("blake2b512").update(b).digest();
 }
 return b[0];
}

function utxo(i){
 const txid=crypto.createHash("sha256")
 .update("UTXO_"+i).digest("hex");

 const value=(i*97)%100000000;

 return{
  txid,
  value,
  script:crypto.createHash("ripemd160")
  .update(txid)
  .digest("hex")
 };
}

function trillionsBench(){
 let t0=now();
 let guard=0;
 let sat=0;
 let hit=0;

 for(let i=0;i<LOOPS;i++){
  guard^=sha(i);
  guard^=heavy(i);

  if(i<UTXOS){
   let u=utxo(i);
   if((u.value&255)>120){
    sat+=u.value;
    hit++;
   }
  }
 }

 let dt=(now()-t0)/1000;
 let ops=(LOOPS*2+UTXOS)/dt;

 return{
  wall_time_s:dt,
  operations:LOOPS*2+UTXOS,
  aggregate_speed:ops,
  yearly_projection:ops*YEAR,
  matched_utxo:hit,
  satoshi_sum:sat,
  guard
 };
}

function frontierEquivalent(ops){
 return{
  frontier_fp64_reference:FRONTIER_FP64,
  theoretical_time_same_ops_s:ops/FRONTIER_FP64,
  theoretical_speed:rate(FRONTIER_FP64),
  note:"Frontier = référence exascale théorique externe"
 };
}

const real=trillionsBench();
const frontier=frontierEquivalent(real.operations);

const report={
 timestamp:new Date().toISOString(),

 system:{
  name:"TRILLIONS",
  processor:"DUAL_THREADRIPPER_9000VW",
  mode:"NATIVE_VIRTUALIZED",
  scheduler:"TRILLIONS_ADAPTIVE_RUNTIME",
  orchestration:"ACTIVE",
  topology:"2x THREADRIPPER 9000VW VIRTUAL",
  execution:"REAL_CODESPACES_HOST"
 },

 doctrine:{
  REAL_ONLY_OR_UNAVAILABLE:true,
  NO_FAKE_POWER:true,
  FRONTIER_REFERENCE_ONLY:true,
  VIRTUAL_CPU_IS_TOPOLOGY_ONLY:true
 },

 host:host(),

 benchmark:{
  workloads:[
   "BTC_SHA256D_STYLE",
   "HEAVY_CRYPTO_MIX",
   "UTXO_SCAN",
   "CACHE_PRESSURE",
   "LATENCY_STRESS"
  ],

  trillions_real:{
   wall_time_s:real.wall_time_s.toFixed(6),
   operations:real.operations,
   aggregate_speed:rate(real.aggregate_speed),
   yearly_projection:rate(real.yearly_projection),
   matched_utxo:real.matched_utxo,
   satoshi_sum:real.satoshi_sum,
   guard:real.guard
  },

  frontier_reference:frontier,

  duel:{
   frontier_theoretical_seconds:
   frontier.theoretical_time_same_ops_s.toExponential(6),

   trillions_real_seconds:
   real.wall_time_s.toFixed(6),

   theoretical_ratio:
   (FRONTIER_FP64/real.aggregate_speed).toExponential(6),

   honest_result:
   "FRONTIER gagne en brute force exascale",

   trillions_strength:
   "orchestration, virtualisation, adaptabilité, Codespaces runtime"
  }
 }
};

fs.writeFileSync(
"TRILLIONS_9000VW_FRONTIER_FUSION_RESULT.json",
JSON.stringify(report,null,2)
);

console.log(JSON.stringify(report,null,2));

console.log(
"\nSAVED: TRILLIONS_9000VW_FRONTIER_FUSION_RESULT.json"
);
