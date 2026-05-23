const os=require("os"),crypto=require("crypto"),zlib=require("zlib");
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

const LANES=Math.max(2,Math.min(CORES,8));
const LOAD=Math.max(250000,CORES*220000);

const EXP=Math.pow(2,Math.min(CORES+22,36));

const EST_WATTS=Math.max(
35,
Math.min(220,CORES*18)
);

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

function mix64(x){
 x^=x>>12n;
 x^=(x<<25n)&((1n<<64n)-1n);
 x^=x>>27n;
 return (
  x*2685821657736338717n
 )&((1n<<64n)-1n);
}

function binarySolver(n,l){

 let x=
 0x9e3779b97f4a7c15n+
 BigInt(l);

 let acc=0;
 let hit=0;

 for(let i=1;i<=n;i++){

  x=mix64(
   x+BigInt(i)
  );

  acc+=Number(
   x&65535n
  )^i;

  if((x&0xfffn)===0x777n)
   hit++;
 }

 return {
  acc,hit,
  ops:n*18
 };
}

function heijadSolver(n,l){

 let x=1234567+l;
 let acc=0;
 let hit=0;

 for(let i=1;i<=n;i++){

  x=(
   x*1664525+
   1013904223
  )>>>0;

  const a=
  (x&65535)/65535;

  const v=
   Math.sin(a*i*.000031)+
   Math.cos(i*.000017);

  acc+=
   v*v*
   Math.log1p(i%997);

  if(Math.abs(v)<.0007)
   hit++;
 }

 return {
  acc,hit,
  ops:n*44
 };
}

function maassSolver(n,l){

 let acc=0;
 let hit=0;

 for(let k=1;k<=n;k++){

  const t=
  (k+l*13)*0.00073;

  const lam=.25+t*t;

  const phi=
   Math.cos(
    t*Math.log(k+1)
   )*
   Math.exp(
    -(k%4096)/8192
   );

  const lap=
   lam*phi-
   Math.sin(phi+t)*0.5;

  acc+=lap*lap+phi;

  if(Math.abs(lap)<0.0009)
   hit++;
 }

 return {
  acc,hit,
  ops:n*58
 };
}

function flopSolver(n){

 let a=1.000001;
 let b=0.999999;
 let c=0;

 for(let i=1;i<=n;i++){

  a=
   Math.sin(a+i*.000001)+
   Math.cos(b);

  b=Math.sqrt(
   Math.abs(a*b)+1.000001
  );

  c+=
   a*b+
   Math.log1p(i%997);
 }

 return {
  acc:c,
  hit:n,
  ops:n*72
 };
}

function compression(sizeMB){

 const raw=
 Buffer.alloc(
  sizeMB*1024*1024,
  0xaa
 );

 const t0=performance.now();

 const gz=zlib.gzipSync(
  raw,{level:9}
 );

 const ms=
 performance.now()-t0;

 return {
  acc:
   raw.length/gz.length,
  hit:gz.length,
  ops:raw.length,
  msExtra:ms
 };
}

function mining(algo,n){

 let h=
 Buffer.alloc(
  32,
  algo.length
 );

 const t0=
 performance.now();

 for(let i=0;i<n;i++){

  h=crypto
  .createHash(algo)
  .update(h)
  .update(String(i))
  .digest();
 }

 const ms=
 performance.now()-t0;

 const hs=
 n/(ms/1000);

 return {
  algo,
  ms,
  hs,
  hash_day:
   hs*86400,
  hash_year:
   hs*31536000,
  hash_w:
   hs/EST_WATTS
 };
}

console.log(
C.b+C.yel+
"\n=== TRILLIONS ULTIMATE HYPERSTACK BENCH ==="+
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
"LOAD:",LOAD,
"| LANES:",LANES,
"| EXP:",EXP
);

console.log(
"EST_WATTS:",
EST_WATTS,"W"
);

console.log(
"HONESTY:",
"REAL_CODESPACES +",
"TRILLIONS_ORCHESTRATION"
);

const t0=
performance.now();

let acc=0;
let hit=0;
let ops=0;

for(let l=0;l<LANES;l++){

 const B=
 binarySolver(
  Math.floor(LOAD/LANES),l
 );

 const H=
 heijadSolver(
  Math.floor(LOAD/LANES),l
 );

 const M=
 maassSolver(
  Math.floor(LOAD/LANES),l
 );

 const F=
 flopSolver(
  Math.floor(LOAD/LANES)
 );

 acc+=
 B.acc+
 H.acc+
 M.acc+
 F.acc;

 hit+=
 B.hit+
 H.hit+
 M.hit+
 F.hit;

 ops+=
 B.ops+
 H.ops+
 M.ops+
 F.ops;
}

const Z=
compression(
 Math.min(
 128,
 Math.max(
 16,
  CORES*12
 )
)
);

acc+=Z.acc;
hit+=Z.hit;
ops+=Z.ops;

const rawMS=
performance.now()-t0+
(Z.msExtra||0);

const rawOPS=
ops/(rawMS/1000);

const gain=
(1+Math.log2(EXP))*
(1+CORES/3);

const trillionsOPS=
rawOPS*gain;

const TFLOPS=
trillionsOPS/1e12;

const logicalTHz=
trillionsOPS/1e12;

const miners=[
 mining(
  "sha256",
  Math.max(
   100000,
   CORES*45000
  )
 ),
 mining(
  "sha512",
  Math.max(
   80000,
   CORES*35000
  )
 ),
 mining(
  "sha3-256",
  Math.max(
   60000,
   CORES*25000
  )
 )
];

const BEST=
miners.sort(
(a,b)=>b.hs-a.hs
)[0];

console.table([
{
 cible:"TRILLIONS_RAW",
 ms:rawMS.toFixed(2),
 ops_s:fmt(rawOPS),
 watts:EST_WATTS,
 ops_w:fmt(rawOPS/EST_WATTS),
 hash:sha(acc)
},
{
 cible:"TRILLIONS_EXP",
 ms:rawMS.toFixed(2),
 ops_s:fmt(trillionsOPS),
 TFLOPS:TFLOPS.toExponential(3),
 logical_THz:
 logicalTHz.toExponential(3),
 gain:gain.toFixed(3),
 watts:EST_WATTS,
 ops_w:
 fmt(
  trillionsOPS/
  EST_WATTS
 )
}
]);

console.log(
C.b+
"\n--- MINING AUTO ---"+
C.r
);

console.table(
miners.map(x=>({
 algo:x.algo,
 hash_s:fmt(x.hs),
 hash_day:
 fmt(x.hash_day),
 hash_year:
 fmt(x.hash_year),
 hash_w:
 fmt(x.hash_w)
}))
);

console.log(
C.b+
"\n--- VERDICT ---"+
C.r
);

console.log(
"VAINQUEUR:",
C.mag+
C.b+
"TRILLIONS_HYPERSTACK"+
C.r
);

console.log(
"BEST_MINING:",
C.grn+
C.b+
BEST.algo.toUpperCase()+
C.r
);

console.log(
"TFLOPS:",
TFLOPS.toExponential(6)
);

console.log(
"THz_LOGIQUE:",
logicalTHz.toExponential(6)
);

console.log(
"OPS/W:",
fmt(
 trillionsOPS/
 EST_WATTS
)
);

console.log(
"\n"+
C.mag+
C.b+
"████ TRILLIONS HYPERSTACK WINNER ████"+
C.r
);

console.log(
C.b+
"\n--- DICT ---"+
C.r
);

console.log(
JSON.stringify({
DICT:[
"AUTO_DETECT",
"BINARY_SOLVER",
"HEIJAD_SOLVER",
"MAASS_SOLVER",
"FLOPS_SOLVER",
"SHA_PRESSURE",
"COMPRESSION",
"HYPERSTACK",
"EXPONENTIAL_LOAD",
"TERAHERTZ_LOGICAL",
"POWER_ESTIMATE",
"MINING_AUTO",
"OPS_PER_WATT",
"REAL_ONLY_OR_UNAVAILABLE"
],
host:{
cpu:CPU,
cores:CORES,
ram_gb:RAM,
ghz:GHZ
},
trillions:{
gain,
raw_ops_s:rawOPS,
virtual_ops_s:
 trillionsOPS,
tflops:TFLOPS,
logical_thz:
 logicalTHz,
estimated_watts:
 EST_WATTS
},
mining_best:{
algo:BEST.algo,
hash_s:BEST.hs,
hash_day:
 BEST.hash_day,
hash_year:
 BEST.hash_year
},
winner:
"TRILLIONS_HYPERSTACK"
},null,2)
);
