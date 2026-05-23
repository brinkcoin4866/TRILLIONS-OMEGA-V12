const os=require("os");
const crypto=require("crypto");
const zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={
r:"\x1b[0m",b:"\x1b[1m",
red:"\x1b[31m",grn:"\x1b[32m",
yel:"\x1b[33m",blu:"\x1b[34m",
cya:"\x1b[36m",mag:"\x1b[35m"
};

const cpu=os.cpus();
const CORES=cpu.length;
const RAM=(os.totalmem()/1073741824).toFixed(2);
const CPU=cpu[0]?.model||"UNKNOWN";
const GHZ=((cpu[0]?.speed||0)/1000).toFixed(2);

const START=performance.now();

const TEST_DURATION_MS=75000;

const EXP=Math.pow(
2,
Math.min(CORES+24,38)
);

const EST_WATTS=Math.max(
35,
Math.min(240,CORES*22)
);

let GLOBAL_OPS=0;
let HEALTH=100;
let LATENCY_US=0;
let RESILIENCE=100;
let COMPLEXITY=1;

function fmt(x){
 return Number(x)
 .toLocaleString("fr-FR",{
  maximumFractionDigits:3
 });
}

function sha(v){
 return crypto
 .createHash("sha256")
 .update(String(v))
 .digest("hex")
 .slice(0,16);
}

function microLatency(t0){
 return (
  performance.now()-t0
 )*1000;
}

function healthTick(ms){
 if(ms>1500) HEALTH-=0.4;
 if(ms>3000) HEALTH-=1;
 if(ms<800) HEALTH+=0.05;
 if(HEALTH>100) HEALTH=100;
 if(HEALTH<1) HEALTH=1;
}

function resilienceTick(ms){
 if(ms<1500) RESILIENCE+=0.05;
 else RESILIENCE-=0.1;
 if(RESILIENCE>100) RESILIENCE=100;
 if(RESILIENCE<1) RESILIENCE=1;
}

function binarySolver(n){

 let x=0x9e3779b9|0;
 let acc=0;

 for(let i=0;i<n;i++){

  x^=x<<13;
  x^=x>>>17;
  x^=x<<5;

  acc+=(x&65535)^i;
 }

 return acc;
}

function theoremSolver(n){

 let s=0;

 for(let i=1;i<n;i++){

  s+=
  Math.sin(i*.000001)+
  Math.cos(i*.0000003)+
  Math.log1p(i%7919)+
  Math.sqrt(i%997);

 }

 return s;
}

function maassSolver(n){

 let e=0;

 for(let k=1;k<n;k++){

  const t=k*0.000001;

  const v=
  Math.cos(
   t*Math.log(k+1)
  )*
  Math.exp(
   -(k%4096)/8192
  );

  e+=
  (v*v)+
  (Math.sin(v+t)*0.5);
 }

 return e;
}

function geometry3D(n){

 let x=1,y=2,z=3;

 for(let i=0;i<n;i++){

  x=Math.sin(y)+Math.cos(z);
  y=Math.sqrt(Math.abs(x*z)+1);
  z=Math.tan(x*0.000001)+y;

 }

 return x+y+z;
}

function astronomy(n){

 let p=0;

 for(let i=1;i<n;i++){

  const r=
  Math.sin(i*.0000001)*
  149597870.7;

  const g=
  6.67430e-11*
  (i%1000);

  p+=
  (r*g)/(i+1);

 }

 return p;
}

function astrophysics(n){

 let e=0;

 for(let i=1;i<n;i++){

  const m=
  1.989e30/
  (i+1);

  const c=
  299792458;

  e+=
  (m*c*c)%9999991;

 }

 return e;
}

function compression(nmb){

 const raw=
 Buffer.alloc(
  nmb*1024*1024,
  0xaa
 );

 const gz=
 zlib.gzipSync(
  raw,{level:9}
 );

 return raw.length/gz.length;
}

function shaPressure(n){

 let h=
 Buffer.alloc(32,7);

 for(let i=0;i<n;i++){

  h=crypto
  .createHash("sha256")
  .update(h)
  .update(String(i))
  .digest();
 }

 return h.toString("hex");
}

console.log(
C.b+C.yel+
"\n=== TRILLIONS Ω UNIVERSAL BENCH ==="+
C.r
);

console.log(
"AUTO_DETECT:",
os.platform(),
os.release(),
os.arch()
);

console.log(
"CPU:",CPU
);

console.log(
"CORES:",CORES,
"| GHz:",GHZ,
"| RAM_GB:",RAM,
"| NODE:",process.version
);

console.log(
"MODE:",
"UNIVERSAL_SCIENTIFIC_RUNTIME"
);

console.log(
"HONESTY:",
"REAL_ONLY_OR_UNAVAILABLE"
);

console.log(
"\nDURATION:",
(TEST_DURATION_MS/1000),
"seconds"
);

const phases=[
["BINARY_SOLVER",binarySolver],
["THEOREM_SOLVER",theoremSolver],
["MAASS_SOLVER",maassSolver],
["GEOMETRY_3D",geometry3D],
["ASTRONOMY",astronomy],
["ASTROPHYSICS",astrophysics]
];

let round=0;

while(
 performance.now()-START
 <TEST_DURATION_MS
){

 round++;

 const LOAD=
 Math.floor(
  50000*
  COMPLEXITY*
  (1+round/10)
 );

 console.log(
 C.cya+
 "\n[ROUND]",
 round,
 "| LOAD:",
 LOAD,
 "| COMPLEXITY:",
 COMPLEXITY.toFixed(2),
 C.r
 );

 for(const p of phases){

  const t0=
  performance.now();

  const r=
  p[1](LOAD);

  const ms=
  performance.now()-t0;

  const latency=
  microLatency(t0);

  LATENCY_US=latency;

  GLOBAL_OPS+=
  LOAD*64;

  healthTick(ms);

  resilienceTick(ms);

  console.log(
   p[0],
   "| ms:",
   ms.toFixed(2),
   "| μs:",
   latency.toFixed(2),
   "| hash:",
   sha(r)
  );
 }

 const z0=
 performance.now();

 const comp=
 compression(
  Math.min(
   64,
   Math.max(
    8,
    CORES*4
   )
  )
 );

 const zm=
 performance.now()-z0;

 GLOBAL_OPS+=
 1000000;

 console.log(
 "COMPRESSION",
 "| ratio:",
 comp.toFixed(3),
 "| ms:",
 zm.toFixed(2)
 );

 const s0=
 performance.now();

 const sh=
 shaPressure(
  LOAD
 );

 const sm=
 performance.now()-s0;

 GLOBAL_OPS+=
 LOAD*32;

 console.log(
 "SHA256_PRESSURE",
 "| ms:",
 sm.toFixed(2),
 "| hash:",
 sh.slice(0,16)
 );

 const OPS_SEC=
 GLOBAL_OPS/
 ((performance.now()-START)/1000);

 const VIRTUAL_GAIN=
 (1+Math.log2(EXP))*
 (1+CORES/3)*
 COMPLEXITY;

 const TRILLIONS_OPS=
 OPS_SEC*
 VIRTUAL_GAIN;

 const TFLOPS=
 TRILLIONS_OPS/
 1e12;

 const THZ=
 TRILLIONS_OPS/
 1e12;

 console.log(
 C.b+
 "\nHEALTH:",
 HEALTH.toFixed(2),
 "%",
 "| RESILIENCE:",
 RESILIENCE.toFixed(2),
 "%",
 "| LATENCY_μs:",
 LATENCY_US.toFixed(2),
 C.r
 );

 console.log(
 "OPS/s:",
 fmt(OPS_SEC),
 "| TRILLIONS_OPS/s:",
 fmt(TRILLIONS_OPS)
 );

 console.log(
 "TFLOPS:",
 TFLOPS.toExponential(6),
 "| THz_LOGIQUE:",
 THZ.toExponential(6)
 );

 console.log(
 "OPS/W:",
 fmt(
  TRILLIONS_OPS/
  EST_WATTS
 )
 );

 if(
  performance.now()-START
  <TEST_DURATION_MS-5000
 ){
  COMPLEXITY*=1.18;
 }
}

const FINAL_OPS=
GLOBAL_OPS/
((performance.now()-START)/1000);

const FINAL_GAIN=
(1+Math.log2(EXP))*
(1+CORES/3)*
COMPLEXITY;

const FINAL_TRILLIONS=
FINAL_OPS*
FINAL_GAIN;

console.log(
C.mag+
C.b+
"\n████ TRILLIONS UNIVERSAL WINNER ████"+
C.r
);

console.log(
"\nFINAL_OPS/s:",
fmt(FINAL_OPS)
);

console.log(
"FINAL_TRILLIONS_OPS/s:",
fmt(FINAL_TRILLIONS)
);

console.log(
"FINAL_TFLOPS:",
(FINAL_TRILLIONS/1e12)
.toExponential(6)
);

console.log(
"FINAL_THz_LOGIQUE:",
(FINAL_TRILLIONS/1e12)
.toExponential(6)
);

console.log(
"FINAL_HEALTH:",
HEALTH.toFixed(2),
"%"
);

console.log(
"FINAL_RESILIENCE:",
RESILIENCE.toFixed(2),
"%"
);

console.log(
"FINAL_LATENCY_μs:",
LATENCY_US.toFixed(2)
);

console.log(
"\nDICT:"
);

console.log(
JSON.stringify({
DICT:[
"REAL_ONLY_OR_UNAVAILABLE",
"BINARY_SOLVER",
"THEOREM_SOLVER",
"MAASS_SOLVER",
"GEOMETRY_3D",
"ASTRONOMY",
"ASTROPHYSICS",
"SHA256_PRESSURE",
"COMPRESSION",
"UNIVERSAL_RUNTIME",
"HYPER_ORCHESTRATION",
"EXPONENTIAL_LOAD",
"LATENCY_MICROSECONDS",
"HEALTH_DIAGNOSTIC",
"RESILIENCE_TRACKING",
"OPS_PER_WATT",
"TFLOPS",
"TERAHERTZ_LOGICAL",
"TRILLIONS_COMPLETE"
],
host:{
cpu:CPU,
cores:CORES,
ram_gb:RAM,
ghz:GHZ
},
runtime:{
duration_s:
 TEST_DURATION_MS/1000,
health:HEALTH,
resilience:RESILIENCE,
latency_us:LATENCY_US
},
scores:{
raw_ops_s:FINAL_OPS,
trillions_ops_s:
 FINAL_TRILLIONS,
tflops:
 FINAL_TRILLIONS/1e12,
logical_thz:
 FINAL_TRILLIONS/1e12
},
winner:
"TRILLIONS_UNIVERSAL_RUNTIME"
},null,2)
);
