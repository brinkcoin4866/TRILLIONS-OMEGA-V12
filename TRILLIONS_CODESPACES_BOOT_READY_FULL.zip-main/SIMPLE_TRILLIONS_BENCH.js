const os=require("os");
const crypto=require("crypto");
const {performance}=require("perf_hooks");

const cpu=os.cpus();
const cores=cpu.length;
const ram=(os.totalmem()/1073741824).toFixed(2);
const model=cpu[0]?.model||"UNKNOWN";
const ghz=((cpu[0]?.speed||0)/1000).toFixed(2);

const LOAD=Math.max(500000,cores*250000);

function fmt(x){
 return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});
}

function shaBench(n){

 let h=Buffer.alloc(32,7);

 for(let i=0;i<n;i++){

  h=crypto
  .createHash("sha256")
  .update(h)
  .update(String(i))
  .digest();
 }

 return h.toString("hex");
}

console.log("\n=== SIMPLE TRILLIONS BENCH ===\n");

console.log("CPU:",model);
console.log("CORES:",cores);
console.log("GHz:",ghz);
console.log("RAM_GB:",ram);
console.log("NODE:",process.version);

console.log("\nLOAD:",LOAD);

const t0=performance.now();

const hash=shaBench(LOAD);

const ms=performance.now()-t0;

const hashRate=LOAD/(ms/1000);

console.log("\n--- RESULT ---\n");

console.log("TIME_ms:",ms.toFixed(2));
console.log("HASH/s:",fmt(hashRate));
console.log("KH/s:",fmt(hashRate/1000));
console.log("MH/s:",fmt(hashRate/1e6));
console.log("HASH:",hash.slice(0,16));

console.log("\nSTATUS: OK");
console.log("HONESTY: REAL_ONLY_OR_UNAVAILABLE");

console.log("\nDICT:");

console.log(JSON.stringify({
DICT:[
 "AUTO_DETECT",
 "SHA256_BENCH",
 "REAL_ONLY_OR_UNAVAILABLE"
],
host:{
 cpu:model,
 cores,
 ram_gb:ram,
 ghz,
 node:process.version
},
benchmark:{
 load:LOAD,
 time_ms:ms,
 hash_s:hashRate
}
},null,2));
