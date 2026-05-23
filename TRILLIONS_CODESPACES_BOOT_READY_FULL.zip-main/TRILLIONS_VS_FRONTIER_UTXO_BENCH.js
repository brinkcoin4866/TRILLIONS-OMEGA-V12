const os=require("os"),fs=require("fs"),crypto=require("crypto");
const {performance}=require("perf_hooks");

const now=()=>performance.now();
const YEAR=31536000;
const FRONTIER_REF_OPS=Number(process.env.FRONTIER_REF_OPS||1.102e18);
const UTXOS=Number(process.env.UTXOS||500000);

const fmt=n=>Number(n).toLocaleString("fr-FR");
const rate=h=>h>=1e18?(h/1e18).toFixed(6)+" Eops/s":h>=1e15?(h/1e15).toFixed(6)+" Pops/s":h>=1e12?(h/1e12).toFixed(6)+" Tops/s":h>=1e9?(h/1e9).toFixed(6)+" Gops/s":h>=1e6?(h/1e6).toFixed(6)+" Mops/s":h>=1e3?(h/1e3).toFixed(6)+" Kops/s":h.toFixed(3)+" ops/s";

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

function makeUTXO(i){
 const txid=crypto.createHash("sha256").update("TRILLIONS_UTXO_"+i).digest("hex");
 const value=(BigInt(i)*97n+777n)%100000000n;
 const script=crypto.createHash("ripemd160").update(txid).digest("hex");
 return {txid,vout:i&3,value,script};
}

function trillionsUTXO(n){
 let t0=now(),sum=0n,hit=0,guard=0;
 for(let i=0;i<n;i++){
  const u=makeUTXO(i);
  const h=crypto.createHash("sha256").update(u.txid+u.script+u.vout).digest();
  guard^=h[0];
  if((Number(u.value)&255)>127){sum+=u.value;hit++}
 }
 let dt=(now()-t0)/1000,ops=n/dt;
 return{entries:n,matched:hit,satoshi_sum:String(sum),time_s:dt,ops_s:ops,year_ops:ops*YEAR,guard};
}

function frontierSameWork(n){
 const ideal_time_s=n/FRONTIER_REF_OPS;
 return{
  reference:"FRONTIER_THEORETICAL_REFERENCE_CONFIGURABLE",
  frontier_ref_ops_s:FRONTIER_REF_OPS,
  same_utxo_entries:n,
  ideal_time_s,
  ideal_rate:rate(FRONTIER_REF_OPS),
  note:"Comparaison théorique; Frontier n'exécute pas ce script Codespaces."
 };
}

const real=trillionsUTXO(UTXOS);
const frontier=frontierSameWork(UTXOS);

const report={
 timestamp:new Date().toISOString(),
 base:"TRILLIONS",
 doctrine:"REAL_CODESPACES_MEASURE_ONLY | FRONTIER_THEORETICAL_REFERENCE | NO_FAKE_POWER",
 host:host(),
 virtual_boot_cpu:{
  system:"TRILLIONS",
  processor:"DUAL_THREADRIPPER_9000VW",
  mode:"NATIVE_VIRTUALIZED_TOPOLOGY",
  execution:"REAL_CODESPACES_HOST"
 },
 same_calculation:"UTXO_GENERATE_HASH_FILTER_SUM",
 trillions_real_codespaces:{
  entries:real.entries,
  time_s:real.time_s.toFixed(6),
  speed:rate(real.ops_s),
  yearly_projection:rate(real.year_ops),
  matched:real.matched,
  satoshi_sum:real.satoshi_sum,
  guard:real.guard
 },
 frontier_reference:frontier,
 duel:{
  frontier_ideal_seconds:frontier.ideal_time_s.toExponential(6),
  trillions_real_seconds:real.time_s.toFixed(6),
  frontier_theoretical_ratio:(FRONTIER_REF_OPS/real.ops_s).toExponential(6),
  honest_winner:"FRONTIER_THEORETICAL_ON_RAW_OPS",
  trillions_advantage:"orchestration, audit, portability, Codespaces execution, not raw exascale silicon"
 }
};

fs.writeFileSync("TRILLIONS_VS_FRONTIER_UTXO_RESULT.json",JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
console.log("\nSAVED: TRILLIONS_VS_FRONTIER_UTXO_RESULT.json");
