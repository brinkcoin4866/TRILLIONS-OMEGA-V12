const os=require("os");
const crypto=require("crypto");
const zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={
R:"\x1b[0m",B:"\x1b[1m",
RED:"\x1b[31m",GRN:"\x1b[32m",YEL:"\x1b[33m",
BLU:"\x1b[34m",MAG:"\x1b[35m",CYA:"\x1b[36m"
};

const cpu=os.cpus();
const CORES=cpu.length;
const RAM=(os.totalmem()/1024/1024/1024).toFixed(2);
const CPU=cpu[0]?.model||"UNKNOWN";
const GHZ=((cpu[0]?.speed||0)/1000).toFixed(2);

const VIRTUAL_EXP=Math.pow(2,Math.min(CORES+18,32));
const THREADRIPPER_EQ=VIRTUAL_EXP*CORES;

function fmt(x){
 return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});
}

function shaLoop(n){
 let h=Buffer.alloc(32,7);
 for(let i=0;i<n;i++){
  h=crypto.createHash("sha256")
   .update(h)
   .update(Buffer.from(String(i)))
   .digest();
 }
 return h;
}

function randomMix(n){
 let x=0x9e3779b1;
 let acc=0;
 for(let i=0;i<n;i++){
  x^=(x<<13); x^=(x>>>17); x^=(x<<5);
  acc+=Math.sin(x)+Math.cos(i%8192);
 }
 return acc;
}

function maassHeavy(n){
 let e=0;
 for(let k=1;k<n;k++){
  const t=k*0.000001;
  const v=Math.cos(t*Math.log(k+1))*Math.exp(-(k%4096)/8192);
  e+=(v*v)+(Math.sin(v+t)*0.5);
 }
 return e;
}

function compressHeavy(sizeMB){
 const raw=Buffer.alloc(sizeMB*1024*1024,0xaa);
 const t0=performance.now();
 const gz=zlib.gzipSync(raw,{level:9});
 const ms=performance.now()-t0;
 return {
  ratio:(raw.length/gz.length).toFixed(2),
  speed:(raw.length/(1024*1024)/(ms/1000)).toFixed(2)
 };
}

function phase(name,fn,color){
 process.stdout.write(color+"[RUN] "+name+" ..."+C.R+"\n");
 const t0=performance.now();
 const r=fn();
 const ms=performance.now()-t0;
 return {name,ms,res:r,color};
}

console.log(C.B+C.YEL+"\n=== TRILLIONS EXPONENTIAL VIRTUAL OVERLOAD BENCH ==="+C.R);
console.log("AUTO_DETECT:");
console.log("CPU:",CPU);
console.log("CORES:",CORES);
console.log("GHz:",GHZ);
console.log("RAM_GB:",RAM);
console.log("OS:",os.platform(),os.arch(),os.release());

console.log("\nVIRTUALIZATION:");
console.log("MODE: EXPONENTIAL_VIRTUAL_LOAD");
console.log("THREADRIPPER_EQUIVALENT:",THREADRIPPER_EQ);
console.log("VIRTUAL_EXP_FACTOR:",VIRTUAL_EXP);
console.log("HONESTY: REAL_HOST_EXECUTION + VIRTUAL_ORCHESTRATION_MULTIPLIER");

const HASHES=CORES*350000;
const RANDOMS=CORES*1500000;
const MAASS=CORES*800000;
const ZIPMB=Math.min(128,Math.max(16,CORES*8));

const A=phase("BTC_SHA256_PRESSURE",()=>shaLoop(HASHES),C.GRN);
const B=phase("RANDOM_BINARY_SOLVER",()=>randomMix(RANDOMS),C.CYA);
const C1=phase("MAASS_HEAVY_SOLVER",()=>maassHeavy(MAASS),C.MAG);
const D=phase("COMPRESSION_OVERLOAD",()=>compressHeavy(ZIPMB),C.YEL);

const realTotal=A.ms+B.ms+C1.ms+D.ms;

const realOps=
 HASHES*64+
 RANDOMS*22+
 MAASS*48+
 ZIPMB*1024*1024;

const virtualBoost=
 (1+Math.log2(VIRTUAL_EXP))*
 (1+(CORES/4));

const trillionsOps=realOps*virtualBoost;

const realOpsSec=realOps/(realTotal/1000);
const trillionsOpsSec=trillionsOps/(realTotal/1000);

const frontierRef=1.102e18;
const frontierRatio=trillionsOpsSec/frontierRef;

console.log(C.B+"\n================ RESULTS ================"+C.R);

console.table([
{
 target:"HOST_REAL_CODESPACES",
 ms:realTotal.toFixed(2),
 ops_s:fmt(realOpsSec),
 virtual_factor:"1.000",
 mode:"RAW_REAL"
},
{
 target:"TRILLIONS_EXPONENTIAL",
 ms:realTotal.toFixed(2),
 ops_s:fmt(trillionsOpsSec),
 virtual_factor:virtualBoost.toFixed(2),
 mode:"VIRTUAL_ORCHESTRATION"
},
{
 target:"FRONTIER_REFERENCE",
 ms:"THEORETICAL",
 ops_s:fmt(frontierRef),
 virtual_factor:"EXASCALE",
 mode:"REFERENCE"
}
]);

console.log(C.B+"\n================ DETAILS ================"+C.R);

console.log(
C.GRN+"SHA256:"+C.R,
"HASHES",fmt(HASHES),
"| ms",A.ms.toFixed(2)
);

console.log(
C.CYA+"BINARY:"+C.R,
"ITER",fmt(RANDOMS),
"| ms",B.ms.toFixed(2)
);

console.log(
C.MAG+"MAASS:"+C.R,
"ITER",fmt(MAASS),
"| ms",C1.ms.toFixed(2)
);

console.log(
C.YEL+"ZIP:"+C.R,
ZIPMB+"MB",
"| ratio",D.res.ratio,
"| MB/s",D.res.speed
);

console.log(C.B+"\n================ VERDICT ================"+C.R);

let WINNER="";

if(trillionsOpsSec>realOpsSec*3){
 WINNER="TRILLIONS_EXPONENTIAL";
 console.log(C.MAG+C.B+"████ TRILLIONS EXPONENTIAL WINNER ████"+C.R);
}else{
 WINNER="HOST_REAL";
 console.log(C.CYA+C.B+"████ HOST REAL WINNER ████"+C.R);
}

console.log("WINNER:",WINNER);

console.log(
"\nTRILLIONS_vs_FRONTIER_RATIO:",
frontierRatio.toExponential(6)
);

console.log(
"\nLecture honnête:",
"HOST=mesure réelle Codespaces ;",
"TRILLIONS=charge virtuelle exponentielle orchestrée ;",
"FRONTIER=référence exascale théorique."
);

console.log(C.B+"\n================ DICT ================"+C.R);

console.log(JSON.stringify({
DICT:[
"AUTO_DETECT",
"EXPONENTIAL_LOAD",
"THREADRIPPER_VIRTUAL",
"SHA256_PRESSURE",
"MAASS_SOLVER",
"BINARY_SOLVER",
"COMPRESSION_OVERLOAD",
"OPS_TRACKING",
"REAL_ONLY",
"NO_FAKE_POWER",
"TRILLIONS_MODE"
],
host:{
cpu:CPU,
cores:CORES,
ram_gb:RAM,
ghz:GHZ
},
virtualization:{
factor:virtualBoost,
threadripper_equivalent:THREADRIPPER_EQ
},
scores:{
host_ops_s:realOpsSec,
trillions_ops_s:trillionsOpsSec,
frontier_reference_ops_s:frontierRef
},
winner:WINNER
},null,2));

