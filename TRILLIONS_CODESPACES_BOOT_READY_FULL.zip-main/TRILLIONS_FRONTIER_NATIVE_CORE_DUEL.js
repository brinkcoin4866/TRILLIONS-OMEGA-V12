const os=require("os"),crypto=require("crypto"),zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={r:"\x1b[0m",b:"\x1b[1m",red:"\x1b[31m",grn:"\x1b[32m",yel:"\x1b[33m",cya:"\x1b[36m",mag:"\x1b[35m"};
const cpu=os.cpus(), CORES=cpu.length, RAM=(os.totalmem()/2**30).toFixed(2);
const CPU=cpu[0]?.model||"UNKNOWN", GHZ=((cpu[0]?.speed||0)/1000).toFixed(2);
const DURATION_MS=75000, START=performance.now(), LANES=Math.max(2,Math.min(CORES,8));
const EXP=Math.pow(2,Math.min(CORES+27,40)), EST_W=Math.max(35,Math.min(240,CORES*22));

const FRONTIER_CORE={
 mode:"NATIVE_LOGICAL_CORE",
 real_hardware:false,
 reference:"FRONTIER_EXASCALE_REFERENCE",
 fp64_ops_s:1.102e18,
 note:"Frontier est cœur logique de référence, pas matériel natif Codespaces."
};

let health=100,resilience=100,complexity=1,energyJ=0;

function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:3});}
function sha(x){return crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);}
function tick(ms){energyJ+=EST_W*(ms/1000);health+=ms<1300?.04:-.25;resilience+=ms<1800?.03:-.15;health=Math.max(1,Math.min(100,health));resilience=Math.max(1,Math.min(100,resilience));}

function frontierNativeCore(n,l){
 let acc=0,vector=0,tensor=0,spectral=0;
 for(let i=1;i<=n;i++){
  const x=Math.sin((i+l)*0.000013);
  const y=Math.cos((i+l)*0.000017);
  const z=Math.sqrt(Math.abs(x*y)+1);
  vector+=x*x+y*y+z*z;
  tensor+=Math.log1p(i%997)*Math.sin(vector%999);
  spectral+=Math.cos(tensor*0.000001)*Math.exp(-(i%4096)/8192);
  acc+=vector+tensor+spectral;
 }
 return {acc,ops:n*128};
}

function neutronCollision(n,l){
 let acc=0,spin=0,density=1e17;
 for(let i=1;i<=n;i++){
  const r=(i+l*31)%100000+1,m=1.674927498e-27*(1+(i%997)/997),v=2.99792458e8*(.12+.000001*(i%1000));
  const e=m*v*v,grav=6.67430e-11*density/(r*r);
  spin+=Math.sin(i*.000011+l)*Math.cos(grav%777);
  acc+=Math.sqrt(Math.abs(e%99991)+1)*Math.sin(spin)+Math.log1p(Math.abs(grav));
 }
 return {acc,ops:n*118};
}

function photonicImpact(n,l){
 let acc=0,phase=0,orbit=1,photon=299792458;
 for(let i=1;i<=n;i++){
  const theta=(i+l)*0.000017;
  orbit+=Math.sin(theta)*.0001+Math.cos(theta*.5)*.00005;
  phase=(phase+2*Math.PI*orbit/(i%997+1))%(2*Math.PI);
  acc+=Math.sin(phase)*Math.cos(theta)*photon/(1+i%4096);
 }
 return {acc,ops:n*104};
}

function tornadoWeather(n,l,hours){
 let acc=0,vx=1+l,vy=2,vz=3,p=101325,temp=288.15,hum=.62,risk=0;
 for(let h=0;h<hours;h++)for(let i=1;i<=n;i++){
  const coriolis=7.2921159e-5*Math.sin((i+h)*.00001);
  vx=Math.sin(vy)+Math.cos(vz)+coriolis;
  vy=Math.sqrt(Math.abs(vx*vz)+1)+Math.sin(i*.00007+h*.01);
  vz=Math.tan(vx*.000001)+vy*.001;
  p+=Math.sin(vx+vy+vz)*.025;
  temp+=Math.cos(vx*.01+h)*.002;
  hum=Math.abs(Math.sin(hum+vx*.0001));
  risk+=Math.abs(vx*vy*vz)/(Math.max(1,Math.abs(p-100000)));
  acc+=vx*vx+vy*vy+vz*vz+p*hum+temp+risk;
 }
 return {acc,ops:n*hours*92,risk,temp,pressure:p};
}

function simpleParallel(n,l){let s=0;for(let i=1;i<=n;i++)s+=(i%97)*(i%89)+Math.sqrt(i+l);return {acc:s,ops:n*12};}
function compressShock(mb){const raw=Buffer.alloc(mb*1024*1024,0xab),gz=zlib.gzipSync(raw,{level:9});return {acc:raw.length/gz.length,ops:raw.length};}

function runCore(name,scale,color){
 const t0=performance.now();let acc=0,o=0,q=0;
 const n=Math.max(18000,Math.floor(26000*complexity*scale)),hours=Math.min(72,Math.max(12,Math.floor(8*complexity)));
 const blocks=[frontierNativeCore(n,1),neutronCollision(n,2),photonicImpact(n,3),tornadoWeather(Math.floor(n/4),4,hours),simpleParallel(n,5)];
 for(const b of blocks){acc+=b.acc;o+=b.ops;q+=n;}
 const ms=performance.now()-t0;tick(ms);
 return {name,color,ms,ops:o,ops_s:o/(ms/1000),quantity:q,hash:sha(acc),gain:1};
}

function trillionsFrontierNative(){
 const t0=performance.now();let acc=0,o=0,q=0,weather={risk:0,temp:0,pressure:0};
 const base=Math.max(22000,Math.floor(32000*complexity)),hours=Math.min(96,Math.max(12,Math.floor(8*complexity)));
 for(let l=0;l<LANES;l++){
  const n=Math.floor(base/LANES);
  const blocks=[frontierNativeCore(n,l),neutronCollision(n,l),photonicImpact(n,l),tornadoWeather(Math.floor(n/4),l,hours),simpleParallel(n,l)];
  for(const b of blocks){
   acc+=b.acc;o+=b.ops;q+=n;
   if(b.risk!==undefined){weather.risk+=b.risk;weather.temp+=b.temp;weather.pressure+=b.pressure;}
  }
 }
 const z=compressShock(Math.min(96,Math.max(12,CORES*8)));acc+=z.acc;o+=z.ops;
 const ms=performance.now()-t0;tick(ms);
 const gain=(1+Math.log2(EXP))*(1+CORES/3)*complexity;
 const logicalOps=(o*gain)/(ms/1000);
 const frontierRatio=logicalOps/FRONTIER_CORE.fp64_ops_s;
 return {name:"TRILLIONS_FRONTIER_NATIVE_CORE",color:C.mag,ms,ops:o*gain,raw_ops:o,ops_s:logicalOps,raw_ops_s:o/(ms/1000),quantity:q*gain,raw_quantity:q,hash:sha(acc),gain,frontierRatio,weather};
}

console.log(C.b+C.yel+"\n=== TRILLIONS + FRONTIER NATIVE LOGICAL CORE DUEL ==="+C.r);
console.log("AUTO_DETECT:",os.platform(),os.release(),os.arch());
console.log("CPU:",CPU,"| CORES:",CORES,"| GHz:",GHZ,"| RAM_GB:",RAM,"| NODE:",process.version);
console.log("FRONTIER_CORE:",FRONTIER_CORE.mode,"| real_hardware:",FRONTIER_CORE.real_hardware,"| ref_ops_s:",FRONTIER_CORE.fp64_ops_s);
console.log("DURATION:",DURATION_MS/1000,"s | LANES:",LANES,"| EXP_FACTOR:",EXP,"| EST_WATTS:",EST_W);
console.log("HONESTY: Frontier cœur logique/référence ; seul Codespaces exécute réellement.\n");

const totals={};
function add(r){
 if(!totals[r.name])totals[r.name]={name:r.name,color:r.color,ms:0,ops:0,quantity:0,hash:r.hash,gain:r.gain,frontierRatio:r.frontierRatio||0,weather:r.weather};
 totals[r.name].ms+=r.ms;totals[r.name].ops+=r.ops;totals[r.name].quantity+=r.quantity;totals[r.name].hash=r.hash;totals[r.name].gain=r.gain||totals[r.name].gain;totals[r.name].frontierRatio=r.frontierRatio||totals[r.name].frontierRatio;totals[r.name].weather=r.weather||totals[r.name].weather;
}

let round=0;
while(performance.now()-START<DURATION_MS){
 round++;
 console.log(C.cya+"\nROUND "+round+" | complexity x"+complexity.toFixed(2)+C.r);
 const runs=[
  runCore("FRONTIER_NATIVE_LOGICAL_CORE",1.35,C.red),
  runCore("MAASS_CORE_REF",1.00,C.cya),
  runCore("HEIJAD_CORE_REF",.95,C.grn),
  runCore("CAPTAIN_CORE_REF",1.22,C.yel),
  trillionsFrontierNative()
 ];
 for(const r of runs){add(r);console.log(r.color+"✓ "+r.name+C.r,"| ms",r.ms.toFixed(1),"| ops/s",fmt(r.ops_s),"| quantity",fmt(r.quantity),"| hash",r.hash);}
 const tr=totals["TRILLIONS_FRONTIER_NATIVE_CORE"];
 console.log(C.b+"HEALTH "+health.toFixed(1)+"% | RESILIENCE "+resilience.toFixed(1)+"% | ENERGY "+energyJ.toFixed(1)+"J | TRILLIONS_GAIN x"+(tr?.gain||0).toFixed(1)+C.r);
 if(performance.now()-START<DURATION_MS-3000)complexity*=1.29;
}

const rows=Object.values(totals).map(x=>{
 const ops_s=x.ops/(x.ms/1000),qty_s=x.quantity/(x.ms/1000),opsW=ops_s/EST_W;
 return {cible:x.name,ms:x.ms.toFixed(1),ops_s:fmt(ops_s),quantity_total:fmt(x.quantity),quantity_s:fmt(qty_s),ops_w:fmt(opsW),gain:(x.gain||1).toFixed(2),frontier_ratio:(x.frontierRatio||ops_s/FRONTIER_CORE.fp64_ops_s).toExponential(3),hash:x.hash,_score:ops_s+qty_s};
}).sort((a,b)=>b._score-a._score);

const winner=rows[0], col=winner.cible.includes("TRILLIONS")?C.mag:winner.cible.includes("FRONTIER")?C.red:winner.cible.includes("CAPTAIN")?C.yel:winner.cible.includes("MAASS")?C.cya:C.grn;
const W=totals["TRILLIONS_FRONTIER_NATIVE_CORE"]?.weather||{risk:0,temp:0,pressure:0};

console.log(C.b+"\n================ RESULTATS FINAUX ================"+C.r);
console.table(rows.map(({_score,...x})=>x));

console.log(C.b+"\n================ VERDICT COULEUR ================"+C.r);
console.log("VAINQUEUR:",col+C.b+winner.cible+C.r);
console.log("FRONTIER_NATIVE_CORE:",FRONTIER_CORE.note);
console.log("WEATHER_RISK:",fmt(W.risk),"| TEMP_MODEL_K:",fmt(W.temp),"| PRESSURE_MODEL_PA:",fmt(W.pressure));
console.log("HEALTH_FINAL:",health.toFixed(2)+"%","| RESILIENCE_FINAL:",resilience.toFixed(2)+"%","| ENERGY_EST:",energyJ.toFixed(2)+"J");
console.log("\n"+col+C.b+"████ "+winner.cible+" WINNER ████"+C.r);

console.log(C.b+"\nDICT:"+C.r);
console.log(JSON.stringify({
DICT:["AUTO_DETECT","FRONTIER_NATIVE_LOGICAL_CORE","FRONTIER_REFERENCE_FP64","NEUTRON_COLLISION","PHOTONIC_PRE_IMPACT","TORNADO_WEATHER","TRILLIONS_COMPLETE","OPS_PER_WATT","HEALTH","RESILIENCE","REAL_ONLY_OR_UNAVAILABLE"],
host:{cpu:CPU,cores:CORES,ram_gb:RAM,ghz:GHZ,node:process.version},
frontier_core:FRONTIER_CORE,
duration_s:DURATION_MS/1000,
estimated_watts:EST_W,
health_final:health,
resilience_final:resilience,
weather_virtual:W,
winner:winner.cible,
note:"Frontier est cœur logique natif du benchmark, pas matériel réel dans Codespaces."
},null,2));
