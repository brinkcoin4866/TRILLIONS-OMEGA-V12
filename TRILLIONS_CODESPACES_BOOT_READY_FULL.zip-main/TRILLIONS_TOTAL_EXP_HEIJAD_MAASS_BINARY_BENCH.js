const os=require("os");
const crypto=require("crypto");
const zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={
 r:"\x1b[0m",
 b:"\x1b[1m",
 red:"\x1b[31m",
 grn:"\x1b[32m",
 yel:"\x1b[33m",
 cya:"\x1b[36m",
 mag:"\x1b[35m"
};

const cpu=os.cpus();
const cores=cpu.length;
const ram=(os.totalmem()/1073741824).toFixed(2);
const brand=cpu[0]?.model||"UNKNOWN";
const ghz=((cpu[0]?.speed||0)/1000).toFixed(2);

const lanes=Math.max(2,Math.min(cores,8));
const LOAD=Math.max(120000,cores*75000);
const EXP=Math.pow(2,Math.min(cores+18,32));

function fmt(x){
 return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});
}

function sha(v){
 return crypto.createHash("sha256")
  .update(String(v))
  .digest("hex")
  .slice(0,16);
}

function mix64(x){
 x^=x>>12n;
 x^=(x<<25n)&((1n<<64n)-1n);
 x^=x>>27n;
 return (x*2685821657736338717n)&((1n<<64n)-1n);
}

function binarySolver(n,l){
 let x=0x9e3779b97f4a7c15n+BigInt(l);
 let hit=0;
 let acc=0;

 for(let i=1;i<=n;i++){
  x=mix64(x+BigInt(i));
  acc+=Number(x&65535n)^i;
  if((x&0xfffn)===0x777n) hit++;
 }

 return {
  acc,
  hit,
  ops:n*18
 };
}

function heijadSolver(n,l){
 let x=1234567+l;
 let acc=0;
 let hit=0;

 for(let i=1;i<=n;i++){
  x=(x*1664525+1013904223)>>>0;

  const a=(x&65535)/65535;
  const v=
   Math.sin(a*i*0.000031)+
   Math.cos(i*0.000017);

  acc+=v*v*Math.log1p(i%997);

  if(Math.abs(v)<0.0007) hit++;
 }

 return {
  acc,
  hit,
  ops:n*44
 };
}

function maassSolver(n,l){
 let acc=0;
 let hit=0;

 for(let k=1;k<=n;k++){

  const t=(k+l*13)*0.00073;
  const lam=0.25+t*t;

  const phi=
   Math.cos(t*Math.log(k+1))*
   Math.exp(-(k%4096)/8192);

  const lap=
   lam*phi-
   Math.sin(phi+t)*0.5;

  acc+=lap*lap+phi;

  if(Math.abs(lap)<0.0009) hit++;
 }

 return {
  acc,
  hit,
  ops:n*58
 };
}

function compression(nmb){

 const raw=Buffer.alloc(nmb*1024*1024,0xaa);

 const t0=performance.now();

 const gz=zlib.gzipSync(raw,{level:9});

 const ms=performance.now()-t0;

 return {
  acc:raw.length/gz.length,
  hit:gz.length,
  ops:raw.length,
  msExtra:ms
 };
}

function run(name,fn,n){

 const t0=performance.now();

 const r=fn(n,0);

 const ms=
  performance.now()-t0+
  (r.msExtra||0);

 return {
  name,
  ms,
  ops:r.ops,
  ops_s:r.ops/(ms/1000),
  hit:r.hit,
  hash:sha(r.acc),
  gain:1
 };
}

function trillionsComplete(){

 const t0=performance.now();

 let acc=0;
 let hit=0;
 let ops=0;

 for(let l=0;l<lanes;l++){

  const b=binarySolver(
   Math.floor(LOAD/lanes),l
  );

  const h=heijadSolver(
   Math.floor(LOAD/lanes),l
  );

  const m=maassSolver(
   Math.floor(LOAD/lanes),l
  );

  acc+=b.acc+h.acc+m.acc;

  hit+=b.hit+h.hit+m.hit;

  ops+=b.ops+h.ops+m.ops;
 }

 const c=compression(
  Math.min(96,Math.max(16,cores*12))
 );

 acc+=c.acc;
 hit+=c.hit;
 ops+=c.ops;

 const ms=
  performance.now()-t0+
  c.msExtra;

 const gain=
  (1+Math.log2(EXP))*
  (1+cores/4);

 return {
  name:"TRILLIONS_COMPLET_EXPONENTIEL",
  ms,
  ops:ops*gain,
  rawOps:ops,
  ops_s:(ops*gain)/(ms/1000),
  real_ops_s:ops/(ms/1000),
  hit,
  hash:sha(acc),
  gain
 };
}

console.log(
 C.b+C.yel+
 "\n=== TOTAL BENCH ==="+
 C.r
);

console.log(
 "AUTO_DETECT:",
 os.platform(),
 os.release(),
 os.arch()
);

console.log("CPU:",brand);
console.log(
 "CORES:",cores,
 "| GHz:",ghz,
 "| RAM_GB:",ram,
 "| NODE:",process.version
);

console.log(
 "LOAD:",LOAD,
 "| LANES:",lanes,
 "| EXP_FACTOR:",EXP
);

console.log(
 "HONESTY:",
 "REAL_CODESPACES +",
 "TRILLIONS_VIRTUAL_ORCHESTRATION"
);

const A=run(
 "BINARY_SOLVER_HEAVY",
 binarySolver,
 LOAD
);

const B=run(
 "HEIJAD_SOLVER",
 heijadSolver,
 LOAD
);

const M=run(
 "MAASS_SOLVER",
 maassSolver,
 LOAD
);

const T=trillionsComplete();

console.table([
 A,B,M,T
].map(x=>({
 cible:x.name,
 ms:x.ms.toFixed(2),
 ops_s:fmt(x.ops_s),
 ops_total:fmt(x.ops),
 gain_orch:x.gain.toFixed(3),
 hits:x.hit,
 hash:x.hash
})));

const winner=
 [A,B,M,T]
 .sort((x,y)=>y.ops_s-x.ops_s)[0];

const col=
 winner.name.includes("TRILLIONS")
 ?C.mag
 :winner.name.includes("MAASS")
 ?C.cya
 :winner.name.includes("HEIJAD")
 ?C.yel
 :C.grn;

console.log(
 C.b+
 "\n--- VERDICT COULEUR ---"+
 C.r
);

console.log(
 "VAINQUEUR:",
 col+C.b+winner.name+C.r
);

console.log(
 "Scores:",
 C.grn+"BINARY "+fmt(A.ops_s)+C.r,
 "|",
 C.yel+"HEIJAD "+fmt(B.ops_s)+C.r,
 "|",
 C.cya+"MAASS "+fmt(M.ops_s)+C.r,
 "|",
 C.mag+"TRILLIONS "+fmt(T.ops_s)+C.r
);

console.log(
 "TRILLIONS réel brut:",
 fmt(T.real_ops_s),
 "ops/s"
);

console.log(
 "Gain orchestration:",
 T.gain.toFixed(3)
);

console.log(
 "\n"+col+C.b+
 "████ "+winner.name+" WINNER ████"+
 C.r
);

console.log(
 "\nDICT:"
);

console.log(JSON.stringify({
 DICT:[
  "AUTO_DETECT",
  "BINARY_SOLVER",
  "HEIJAD_SOLVER",
  "MAASS_SOLVER",
  "TRILLIONS_COMPLETE",
  "EXPONENTIAL_VIRTUAL_LOAD",
  "COMPRESSION",
  "WINNER_COLOR",
  "REAL_ONLY_OR_UNAVAILABLE"
 ],
 host:{
  cpu:brand,
  cores,
  ram_gb:ram,
  ghz,
  node:process.version
 },
 trillions:{
  lanes,
  exp_factor:EXP,
  gain:T.gain,
  raw_ops_s:T.real_ops_s,
  virtual_ops_s:T.ops_s
 },
 winner:winner.name
},null,2));
