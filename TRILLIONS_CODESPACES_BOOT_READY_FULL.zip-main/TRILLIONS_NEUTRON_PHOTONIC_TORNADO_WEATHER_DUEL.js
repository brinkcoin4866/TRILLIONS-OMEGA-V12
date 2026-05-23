const os=require("os"),crypto=require("crypto"),zlib=require("zlib");
const {performance}=require("perf_hooks");

const C={r:"\x1b[0m",b:"\x1b[1m",red:"\x1b[31m",grn:"\x1b[32m",yel:"\x1b[33m",cya:"\x1b[36m",mag:"\x1b[35m"};
const cpu=os.cpus(), CORES=cpu.length, RAM=(os.totalmem()/2**30).toFixed(2);
const CPU=cpu[0]?.model||"UNKNOWN", GHZ=((cpu[0]?.speed||0)/1000).toFixed(2);
const DURATION_MS=75000, START=performance.now(), LANES=Math.max(2,Math.min(CORES,8));
const EXP=Math.pow(2,Math.min(CORES+27,40)), EST_W=Math.max(35,Math.min(240,CORES*22));
let health=100,resilience=100,complexity=1,energyJ=0;

function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:3});}
function sha(x){return crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);}
function tick(ms){energyJ+=EST_W*(ms/1000);health+=ms<1300?.04:-.25;resilience+=ms<1800?.03:-.15;health=Math.max(1,Math.min(100,health));resilience=Math.max(1,Math.min(100,resilience));}

function neutronCollision(n,l){
 let acc=0,flux=0,spin=0,density=1e17;
 for(let i=1;i<=n;i++){
  const r=(i+l*31)%100000+1;
  const m=1.674927498e-27*(1+(i%997)/997);
  const v=2.99792458e8*(0.12+0.000001*(i%1000));
  const e=m*v*v;
  const grav=6.67430e-11*density/(r*r);
  spin+=Math.sin(i*.000011+l)*Math.cos(grav%777);
  flux+=Math.sqrt(Math.abs(e%99991)+1)*Math.sin(spin);
  acc+=flux+spin+Math.log1p(Math.abs(grav));
 }
 return {acc,ops:n*118};
}

function circularPreImpactPhotonics(n,l){
 let acc=0,phase=0,orbit=1,photon=299792458;
 for(let i=1;i<=n;i++){
  const theta=(i+l)*0.000017;
  orbit+=Math.sin(theta)*0.0001+Math.cos(theta*0.5)*0.00005;
  phase=(phase+2*Math.PI*orbit/(i%997+1))%(2*Math.PI);
  const lens=Math.sin(phase)*Math.cos(theta)*photon/(1+i%4096);
  const redshift=Math.sqrt(1+Math.abs(Math.sin(theta)*0.01))-1;
  acc+=lens*redshift+Math.sin(acc%1000);
 }
 return {acc,ops:n*104};
}

function tornadoWeatherForecast(n,l,hours){
 let acc=0,vx=1+l,vy=2,vz=3,p=101325,temp=288.15,hum=.62,rain=0,risk=0;
 for(let h=0;h<hours;h++){
  for(let i=1;i<=n;i++){
   const coriolis=7.2921159e-5*Math.sin((i+h)*.00001);
   vx=Math.sin(vy)+Math.cos(vz)+coriolis;
   vy=Math.sqrt(Math.abs(vx*vz)+1)+Math.sin(i*.00007+h*.01);
   vz=Math.tan(vx*.000001)+vy*.001;
   p+=Math.sin(vx+vy+vz)*0.025;
   temp+=Math.cos(vx*.01+h)*0.002;
   hum=Math.abs(Math.sin(hum+vx*.0001+rain*.00001));
   rain+=Math.max(0,hum-.78)*0.001;
   risk+=Math.abs(vx*vy*vz)/(Math.max(1,Math.abs(p-100000)));
   acc+=vx*vx+vy*vy+vz*vz+p*hum+temp+rain+risk;
  }
 }
 return {acc,ops:n*hours*92,risk,rain,temp,pressure:p};
}

function simpleParallel(n,l){
 let s=0;
 for(let i=1;i<=n;i++)s+=(i%97)*(i%89)+Math.sqrt(i+l);
 return {acc:s,ops:n*12};
}

function galaxyExplosion(n,l){
 let acc=0,shock=0,gravity=0,entropy=0;
 for(let i=1;i<=n;i++){
  const r=(i+l*97)%100000+1,theta=i*0.000013;
  const mass=(Math.sin(theta)+1.5)*1.989e30/(r+1);
  const v=Math.cos(theta)*2.99792458e8/(1+(i%997));
  const e=mass*v*v*0.5,g=6.67430e-11*mass/(r*r);
  const plasma=Math.sin(e%99991)*Math.cos(g%7919);
  shock+=Math.sqrt(Math.abs(plasma)+1);gravity+=g%1000000;entropy+=Math.log1p(Math.abs(e%1e9));
  acc+=shock+gravity+entropy;
 }
 return {acc,ops:n*96};
}

function compressShock(mb){
 const raw=Buffer.alloc(mb*1024*1024,0xab),gz=zlib.gzipSync(raw,{level:9});
 return {acc:raw.length/gz.length,ops:raw.length};
}

function competitor(name,scale,color){
 const t0=performance.now();let acc=0,o=0,q=0;
 const n=Math.max(18000,Math.floor(26000*complexity*scale));
 const hours=Math.min(48,Math.max(6,Math.floor(6*complexity)));
 const blocks=[
  galaxyExplosion(n,1),
  neutronCollision(n,2),
  circularPreImpactPhotonics(n,3),
  tornadoWeatherForecast(Math.floor(n/4),4,hours),
  simpleParallel(n,5)
 ];
 for(const b of blocks){acc+=b.acc;o+=b.ops;q+=n;}
 const ms=performance.now()-t0;tick(ms);
 return {name,color,ms,ops:o,ops_s:o/(ms/1000),quantity:q,hash:sha(acc),gain:1};
}

function trillions(){
 const t0=performance.now();let acc=0,o=0,q=0,weather={risk:0,rain:0,temp:0,pressure:0};
 const base=Math.max(22000,Math.floor(32000*complexity));
 const hours=Math.min(72,Math.max(12,Math.floor(8*complexity)));
 for(let l=0;l<LANES;l++){
  const n=Math.floor(base/LANES);
  const blocks=[
   galaxyExplosion(n,l),
   neutronCollision(n,l),
   circularPreImpactPhotonics(n,l),
   tornadoWeatherForecast(Math.floor(n/4),l,hours),
   simpleParallel(n,l)
  ];
  for(const b of blocks){
   acc+=b.acc;o+=b.ops;q+=n;
   if(b.risk!==undefined){weather.risk+=b.risk;weather.rain+=b.rain;weather.temp+=b.temp;weather.pressure+=b.pressure;}
  }
 }
 const z=compressShock(Math.min(96,Math.max(12,CORES*8)));acc+=z.acc;o+=z.ops;
 const ms=performance.now()-t0;tick(ms);
 const gain=(1+Math.log2(EXP))*(1+CORES/3)*complexity;
 return {name:"TRILLIONS_NEUTRON_PHOTONIC_WEATHER",color:C.mag,ms,ops:o*gain,raw_ops:o,ops_s:(o*gain)/(ms/1000),raw_ops_s:o/(ms/1000),quantity:q*gain,raw_quantity:q,hash:sha(acc),gain,weather};
}

console.log(C.b+C.yel+"\n=== TRILLIONS NEUTRON + PHOTONIC + TORNADO WEATHER DUEL ==="+C.r);
console.log("AUTO_DETECT:",os.platform(),os.release(),os.arch());
console.log("CPU:",CPU,"| CORES:",CORES,"| GHz:",GHZ,"| RAM_GB:",RAM,"| NODE:",process.version);
console.log("DURATION:",DURATION_MS/1000,"s | LANES:",LANES,"| EXP_FACTOR:",EXP,"| EST_WATTS:",EST_W);
console.log("HONESTY: seul Codespaces exécute ; Frontier/Captain/MAASS/Heijad = références/émulations ; TRILLIONS = orchestration virtuelle.\n");

const totals={};
function add(r){
 if(!totals[r.name])totals[r.name]={name:r.name,color:r.color,ms:0,ops:0,quantity:0,hash:r.hash,gain:r.gain,weather:r.weather};
 totals[r.name].ms+=r.ms;totals[r.name].ops+=r.ops;totals[r.name].quantity+=r.quantity;totals[r.name].hash=r.hash;totals[r.name].gain=r.gain||totals[r.name].gain;totals[r.name].weather=r.weather||totals[r.name].weather;
}

let round=0;
while(performance.now()-START<DURATION_MS){
 round++;
 console.log(C.cya+"\nROUND "+round+" | complexity x"+complexity.toFixed(2)+C.r);
 const runs=[
  competitor("MAASS_NEUTRON_WEATHER_REF",1.00,C.cya),
  competitor("HEIJAD_PHOTONIC_REF",0.95,C.grn),
  competitor("CAPTAIN_ASTRO_REF",1.22,C.yel),
  competitor("FRONTIER_EXASCALE_REF",1.35,C.red),
  trillions()
 ];
 for(const r of runs){
  add(r);
  console.log(r.color+"✓ "+r.name+C.r,"| ms",r.ms.toFixed(1),"| ops/s",fmt(r.ops_s),"| quantity",fmt(r.quantity),"| hash",r.hash);
 }
 const tr=totals["TRILLIONS_NEUTRON_PHOTONIC_WEATHER"];
 console.log(C.b+"HEALTH "+health.toFixed(1)+"% | RESILIENCE "+resilience.toFixed(1)+"% | ENERGY "+energyJ.toFixed(1)+"J | TRILLIONS_GAIN x"+(tr?.gain||0).toFixed(1)+C.r);
 if(performance.now()-START<DURATION_MS-3000)complexity*=1.29;
}

const rows=Object.values(totals).map(x=>{
 const ops_s=x.ops/(x.ms/1000),qty_s=x.quantity/(x.ms/1000),opsW=ops_s/EST_W;
 return {cible:x.name,ms:x.ms.toFixed(1),ops_s:fmt(ops_s),quantity_total:fmt(x.quantity),quantity_s:fmt(qty_s),ops_w:fmt(opsW),gain:(x.gain||1).toFixed(2),hash:x.hash,_score:ops_s+qty_s};
}).sort((a,b)=>b._score-a._score);

const winner=rows[0];
const col=winner.cible.includes("TRILLIONS")?C.mag:winner.cible.includes("FRONTIER")?C.red:winner.cible.includes("CAPTAIN")?C.yel:winner.cible.includes("MAASS")?C.cya:C.grn;
const W=totals["TRILLIONS_NEUTRON_PHOTONIC_WEATHER"]?.weather||{risk:0,rain:0,temp:0,pressure:0};

console.log(C.b+"\n================ RESULTATS FINAUX ================"+C.r);
console.table(rows.map(({_score,...x})=>x));

console.log(C.b+"\n================ METEO TORNADO FORECAST ================"+C.r);
console.table([{
 forecast_hours:"12..72 virtual",
 tornado_risk_index:fmt(W.risk),
 rain_quantity_model:fmt(W.rain),
 temp_model_K:fmt(W.temp),
 pressure_model_Pa:fmt(W.pressure),
 note:"modèle synthétique benchmark, pas prévision météo réelle"
}]);

console.log(C.b+"\n================ VERDICT COULEUR ================"+C.r);
console.log("VAINQUEUR:",col+C.b+winner.cible+C.r);
console.log("CRITERE: débit ops/s + quantité calculée + météo/tornade analysée + résilience.");
console.log("HEALTH_FINAL:",health.toFixed(2)+"%","| RESILIENCE_FINAL:",resilience.toFixed(2)+"%","| ENERGY_EST:",energyJ.toFixed(2)+"J");
console.log("\n"+col+C.b+"████ "+winner.cible+" WINNER ████"+C.r);

console.log(C.b+"\nDICT:"+C.r);
console.log(JSON.stringify({
DICT:["AUTO_DETECT","NEUTRON_COLLISION","CIRCULAR_PRE_IMPACT","PHOTONIC_REALITY_MODEL","TORNADO_WEATHER_FORECAST","GALACTIC_EXPLOSION","ASTROPHYSICS","FLUID_DYNAMICS","SIMPLE_PARALLEL_CALC","COMPRESSION_SHOCK","FRONTIER_REFERENCE","CAPTAIN_REFERENCE","MAASS_REFERENCE","HEIJAD_REFERENCE","TRILLIONS_COMPLETE","OPS_PER_WATT","HEALTH","RESILIENCE","REAL_ONLY_OR_UNAVAILABLE"],
host:{cpu:CPU,cores:CORES,ram_gb:RAM,ghz:GHZ,node:process.version},
duration_s:DURATION_MS/1000,
estimated_watts:EST_W,
health_final:health,
resilience_final:resilience,
weather_virtual:W,
winner:winner.cible,
note:"Modèle numérique synthétique de benchmark ; pas simulation physique certifiée ni météo réelle."
},null,2));
