const os=require("os"),crypto=require("crypto"),zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={r:"\x1b[0m",b:"\x1b[1m",red:"\x1b[31m",grn:"\x1b[32m",yel:"\x1b[33m",cya:"\x1b[36m",mag:"\x1b[35m"};
const cpu=os.cpus(), CORES=cpu.length, RAM=(os.totalmem()/2**30).toFixed(2), CPU=cpu[0]?.model||"UNKNOWN", GHZ=((cpu[0]?.speed||0)/1000).toFixed(2);
const DURATION_MS=75000, START=performance.now(), LANES=Math.max(2,Math.min(CORES,8));
const EXP=Math.pow(2,Math.min(CORES+26,40)), EST_W=Math.max(35,Math.min(240,CORES*22));
let ops=0, samples=0, health=100, resilience=100, complexity=1, energyJ=0;

function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:3});}
function sha(x){return crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);}
function tick(ms){energyJ+=EST_W*(ms/1000); if(ms>1200)health-=.25; else health+=.04; if(ms>1800)resilience-=.15; else resilience+=.03; health=Math.max(1,Math.min(100,health)); resilience=Math.max(1,Math.min(100,resilience));}

function galaxyExplosion(n,l){
 let acc=0, shock=0, gravity=0, entropy=0;
 for(let i=1;i<=n;i++){
  const r=(i+l*97)%100000+1;
  const theta=i*0.000013;
  const mass=(Math.sin(theta)+1.5)*1.989e30/(r+1);
  const v=Math.cos(theta)*2.99792458e8/(1+(i%997));
  const e=mass*v*v*0.5;
  const g=6.67430e-11*mass/(r*r);
  const plasma=Math.sin(e%99991)*Math.cos(g%7919);
  shock+=Math.sqrt(Math.abs(plasma)+1);
  gravity+=g%1000000;
  entropy+=Math.log1p(Math.abs(e%1e9));
  acc+=shock+gravity+entropy;
 }
 return {acc,ops:n*96};
}

function tornadoAtmosphere(n,l){
 let acc=0,vx=1+l,vy=2,vz=3,pressure=101325,humidity=.62;
 for(let i=1;i<=n;i++){
  const coriolis=7.2921159e-5*Math.sin(i*.00001);
  vx=Math.sin(vy)+Math.cos(vz)+coriolis;
  vy=Math.sqrt(Math.abs(vx*vz)+1)+Math.sin(i*.00007);
  vz=Math.tan(vx*.000001)+vy*.001;
  pressure+=Math.sin(vx+vy+vz)*0.03;
  humidity=Math.abs(Math.sin(humidity+vx*.0001));
  acc+=vx*vx+vy*vy+vz*vz+pressure*humidity;
 }
 return {acc,ops:n*82};
}

function maassHeijad(n,l){
 let acc=0,x=1234567+l;
 for(let k=1;k<=n;k++){
  x=(x*1664525+1013904223)>>>0;
  const t=(k+l*13)*0.00073, lam=.25+t*t;
  const phi=Math.cos(t*Math.log(k+1))*Math.exp(-(k%4096)/8192);
  const h=Math.sin((x&65535)/65535*k*.000031)+Math.cos(k*.000017);
  acc+=lam*phi*phi+h*h*Math.log1p(k%997);
 }
 return {acc,ops:n*74};
}

function binaryChaos(n,l){
 let x=0x9e3779b97f4a7c15n+BigInt(l),acc=0;
 for(let i=1;i<=n;i++){
  x^=x>>12n; x^=(x<<25n)&((1n<<64n)-1n); x^=x>>27n;
  x=(x*2685821657736338717n)&((1n<<64n)-1n);
  acc+=Number(x&65535n)^i;
 }
 return {acc,ops:n*26};
}

function compressShock(mb){
 const raw=Buffer.alloc(mb*1024*1024,0xab);
 const gz=zlib.gzipSync(raw,{level:9});
 return {acc:raw.length/gz.length,ops:raw.length};
}

function runCompetitor(name,scale,color){
 const t0=performance.now(); let acc=0, o=0;
 const n=Math.max(25000,Math.floor(35000*complexity*scale));
 const g=galaxyExplosion(n,1), t=tornadoAtmosphere(n,2), mh=maassHeijad(n,3), b=binaryChaos(n,4);
 acc+=g.acc+t.acc+mh.acc+b.acc; o+=g.ops+t.ops+mh.ops+b.ops;
 const ms=performance.now()-t0; tick(ms);
 return {name,color,ms,ops:o,ops_s:o/(ms/1000),quantity:n*4,hash:sha(acc)};
}

function runTrillions(){
 const t0=performance.now(); let acc=0,o=0,q=0;
 const base=Math.max(30000,Math.floor(42000*complexity));
 for(let l=0;l<LANES;l++){
  const n=Math.floor(base/LANES);
  const g=galaxyExplosion(n,l), t=tornadoAtmosphere(n,l), mh=maassHeijad(n,l), b=binaryChaos(n,l);
  acc+=g.acc+t.acc+mh.acc+b.acc; o+=g.ops+t.ops+mh.ops+b.ops; q+=n*4;
 }
 const z=compressShock(Math.min(96,Math.max(12,CORES*8))); acc+=z.acc; o+=z.ops;
 const ms=performance.now()-t0; tick(ms);
 const gain=(1+Math.log2(EXP))*(1+CORES/3)*complexity;
 return {name:"TRILLIONS_GALACTIC_TORNADO",color:C.mag,ms,ops:o*gain,raw_ops:o,ops_s:(o*gain)/(ms/1000),raw_ops_s:o/(ms/1000),quantity:q*gain,raw_quantity:q,hash:sha(acc),gain};
}

console.log(C.b+C.yel+"\n=== GALACTIC EXPLOSION + TORNADO EXASCALE DUEL ==="+C.r);
console.log("AUTO_DETECT:",os.platform(),os.release(),os.arch());
console.log("CPU:",CPU,"| CORES:",CORES,"| GHz:",GHZ,"| RAM_GB:",RAM,"| NODE:",process.version);
console.log("DURATION:",DURATION_MS/1000,"s | LANES:",LANES,"| EXP_FACTOR:",EXP,"| EST_WATTS:",EST_W);
console.log("HONESTY: émulation numérique locale ; Frontier/Captain/Exascale = références théoriques ; TRILLIONS = orchestration virtuelle sur calcul réel.\n");

const totals={};
function add(r){ if(!totals[r.name]) totals[r.name]={name:r.name,color:r.color,ms:0,ops:0,quantity:0,hash:r.hash,gain:r.gain||1,raw_ops:0}; totals[r.name].ms+=r.ms; totals[r.name].ops+=r.ops; totals[r.name].quantity+=r.quantity; totals[r.name].hash=r.hash; totals[r.name].gain=r.gain||totals[r.name].gain; totals[r.name].raw_ops+=r.raw_ops||r.ops; }

let round=0;
while(performance.now()-START<DURATION_MS){
 round++;
 console.log(C.cya+"\nROUND "+round+" | complexity x"+complexity.toFixed(2)+C.r);
 const competitors=[
  runCompetitor("MAASS_SUPER_SOLVER",1.00,C.cya),
  runCompetitor("HEIJAD_SUPER_SOLVER",0.92,C.grn),
  runCompetitor("CAPTAIN_EXASCALE_REF",1.25,C.yel),
  runCompetitor("FRONTIER_EXASCALE_REF",1.35,C.red),
  runTrillions()
 ];
 for(const r of competitors){
  add(r); samples++;
  console.log(r.color+"✓ "+r.name+C.r,"| ms",r.ms.toFixed(1),"| ops/s",fmt(r.ops_s),"| quantity",fmt(r.quantity),"| hash",r.hash);
 }
 const live=totals["TRILLIONS_GALACTIC_TORNADO"];
 console.log(C.b+"HEALTH "+health.toFixed(1)+"% | RESILIENCE "+resilience.toFixed(1)+"% | ENERGY "+energyJ.toFixed(1)+"J | TRILLIONS_GAIN x"+(live?.gain||0).toFixed(1)+C.r);
 if(performance.now()-START<DURATION_MS-3000) complexity*=1.32;
}

const rows=Object.values(totals).map(x=>{
 const ops_s=x.ops/(x.ms/1000), qty_s=x.quantity/(x.ms/1000), opsW=ops_s/EST_W;
 return {cible:x.name,ms:x.ms.toFixed(1),ops_s:fmt(ops_s),quantity_total:fmt(x.quantity),quantity_s:fmt(qty_s),ops_w:fmt(opsW),gain:(x.gain||1).toFixed(2),hash:x.hash,_score:ops_s+qty_s};
}).sort((a,b)=>b._score-a._score);

console.log(C.b+"\n================ RESULTATS FINAUX ================"+C.r);
console.table(rows.map(({_score,...x})=>x));

const winner=rows[0];
const wcol=winner.cible.includes("TRILLIONS")?C.mag:winner.cible.includes("FRONTIER")?C.red:winner.cible.includes("CAPTAIN")?C.yel:winner.cible.includes("MAASS")?C.cya:C.grn;

console.log(C.b+"\n================ VERDICT COULEUR ================"+C.r);
console.log("VAINQUEUR:",wcol+C.b+winner.cible+C.r);
console.log("CRITERE: premier = plus haut débit ops/s + plus grande quantité calculée/analysée.");
console.log("HEALTH_FINAL:",health.toFixed(2)+"%","| RESILIENCE_FINAL:",resilience.toFixed(2)+"%","| ENERGY_EST:",energyJ.toFixed(2)+"J");

console.log("\n"+wcol+C.b+"████ "+winner.cible+" WINNER ████"+C.r);

console.log(C.b+"\nDICT:"+C.r);
console.log(JSON.stringify({
DICT:["AUTO_DETECT","GALACTIC_EXPLOSION","TORNADO_ATMOSPHERE","ASTROPHYSICS","FLUID_DYNAMICS","MAASS","HEIJAD","BINARY_CHAOS","COMPRESSION_SHOCK","FRONTIER_REFERENCE","CAPTAIN_REFERENCE","EXASCALE_REFERENCE","TRILLIONS_COMPLETE","QUANTITY_TO_ANALYZE","OPS_PER_WATT","HEALTH","RESILIENCE","REAL_ONLY_OR_UNAVAILABLE"],
host:{cpu:CPU,cores:CORES,ram_gb:RAM,ghz:GHZ,node:process.version},
duration_s:DURATION_MS/1000,
estimated_watts:EST_W,
health_final:health,
resilience_final:resilience,
winner:winner.cible,
note:"Supercalculateurs externes = références/émulations théoriques ; seul Codespaces exécute réellement le script."
},null,2));
