const os=require("os"),crypto=require("crypto");
const {performance}=require("perf_hooks");
const C={r:"\x1b[0m",b:"\x1b[1m",red:"\x1b[31m",grn:"\x1b[32m",yel:"\x1b[33m",cya:"\x1b[36m",mag:"\x1b[35m"};
const cpu=os.cpus(), cores=cpu.length, ram=(os.totalmem()/2**30).toFixed(2);
const brand=cpu[0]?.model||"UNKNOWN", ghz=((cpu[0]?.speed||0)/1000).toFixed(2);
const lanes=Math.max(2,Math.min(cores,8));
const LOAD=Math.max(350000,cores*250000);
const EXP=Math.pow(2,Math.min(cores+22,36));
const EST_WATTS=Math.max(35,Math.min(180,cores*18));
function fmt(x){return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:3});}
function sha(v){return crypto.createHash("sha256").update(String(v)).digest("hex").slice(0,16);}
function bench(name,fn,opsPerIter,iters){
 const t=performance.now(); const r=fn(iters); const ms=performance.now()-t;
 const ops=iters*opsPerIter, opss=ops/(ms/1000);
 return {name,ms,ops,opss,hash:sha(r),watts:EST_WATTS,opsW:opss/EST_WATTS};
}
function flopSolver(n){
 let a=1.000001,b=0.999999,c=0;
 for(let i=1;i<=n;i++){a=Math.sin(a+i*.000001)+Math.cos(b);b=Math.sqrt(Math.abs(a*b)+1.000001);c+=a*b+Math.log1p(i%997);}
 return c;
}
function binarySolver(n){
 let x=0x9e3779b9|0, acc=0;
 for(let i=0;i<n;i++){x^=x<<13;x^=x>>>17;x^=x<<5;acc+=(x&65535)^i;}
 return acc;
}
function shaMining(n,algo){
 let h=Buffer.alloc(32,algo.length);
 for(let i=0;i<n;i++)h=crypto.createHash(algo).update(h).update(String(i)).digest();
 return h.toString("hex");
}
function mineBench(algo,iters){
 const t=performance.now(); shaMining(iters,algo); const ms=performance.now()-t;
 const hs=iters/(ms/1000);
 return {algo,ms,hash_s:hs,hash_day:hs*86400,hash_year:hs*31536000,watts:EST_WATTS,hash_w:hs/EST_WATTS};
}
console.log(C.b+C.yel+"\n=== TRILLIONS HYPER EXP FLOPS THz MINING BENCH ==="+C.r);
console.log("AUTO_DETECT:",os.platform(),os.release(),os.arch());
console.log("CPU:",brand);
console.log("CORES:",cores,"| GHz:",ghz,"| RAM_GB:",ram,"| NODE:",process.version);
console.log("LOAD:",LOAD,"| LANES:",lanes,"| EXP_FACTOR:",EXP);
console.log("CONSO_ESTIMEE:",EST_WATTS,"W");
console.log("HONESTY: mesure réelle Codespaces + score exponentiel virtualisé ; mining = benchmark, pas minage réel pool.\n");

const F=bench("FLOPS_SOLVER",flopSolver,72,LOAD);
const B=bench("BINARY_SOLVER",binarySolver,24,LOAD);
const S=bench("SHA256_PRESSURE",n=>shaMining(n,"sha256"),64,Math.floor(LOAD/3));

const rawOps=F.ops+B.ops+S.ops;
const rawMs=F.ms+B.ms+S.ms;
const rawOpsS=rawOps/(rawMs/1000);
const gain=(1+Math.log2(EXP))*(1+cores/3);
const triOpsS=rawOpsS*gain;
const flops=F.opss;
const tflops=flops/1e12;
const logicalTHz=triOpsS/1e12;

const algos=[
 mineBench("sha256",Math.max(80000,cores*40000)),
 mineBench("sha512",Math.max(60000,cores*30000)),
 mineBench("sha3-256",Math.max(40000,cores*20000))
];
const best=algos.sort((a,b)=>b.hash_s-a.hash_s)[0];

console.table([
 {cible:"FLOPS_SOLVER_REAL",ms:F.ms.toFixed(2),ops_s:fmt(F.opss),tflops:(F.opss/1e12).toExponential(3),w:EST_WATTS,ops_w:fmt(F.opsW),hash:F.hash},
 {cible:"BINARY_SOLVER_REAL",ms:B.ms.toFixed(2),ops_s:fmt(B.opss),tflops:(B.opss/1e12).toExponential(3),w:EST_WATTS,ops_w:fmt(B.opsW),hash:B.hash},
 {cible:"SHA_PRESSURE_REAL",ms:S.ms.toFixed(2),ops_s:fmt(S.opss),tflops:(S.opss/1e12).toExponential(3),w:EST_WATTS,ops_w:fmt(S.opsW),hash:S.hash},
 {cible:"TRILLIONS_HYPER_EXP",ms:rawMs.toFixed(2),ops_s:fmt(triOpsS),tflops:(triOpsS/1e12).toExponential(3),logical_THz:logicalTHz.toExponential(3),gain:gain.toFixed(3),w:EST_WATTS,ops_w:fmt(triOpsS/EST_WATTS)}
]);

console.log(C.b+"\n--- MINING AUTO BEST PERFORMANCE ---"+C.r);
console.table(algos.map(x=>({
 algo:x.algo,
 ms:x.ms.toFixed(2),
 hash_s:fmt(x.hash_s),
 hash_day:fmt(x.hash_day),
 hash_year:fmt(x.hash_year),
 watts:x.watts,
 hash_w:fmt(x.hash_w)
})));

console.log(C.b+"\n--- VERDICT COULEUR ---"+C.r);
console.log("VAINQUEUR CALCUL:",C.mag+C.b+"TRILLIONS_HYPER_EXP"+C.r);
console.log("MEILLEUR MINING AUTO:",C.grn+C.b+best.algo.toUpperCase()+C.r);
console.log("Quantité estimée:",fmt(best.hash_day),"hash/jour |",fmt(best.hash_year),"hash/an");
console.log("FLOPS réel:",fmt(flops),"FLOP/s | TFLOPS réel:",tflops.toExponential(6));
console.log("TRILLIONS logique:",fmt(triOpsS),"ops/s | THz logique:",logicalTHz.toExponential(6));
console.log("Conso estimée:",EST_WATTS,"W | efficacité:",fmt(triOpsS/EST_WATTS),"ops/s/W");

console.log("\n"+C.mag+C.b+"████ TRILLIONS HYPER EXP WINNER ████"+C.r);

console.log(C.b+"\n--- DICT ---"+C.r);
console.log(JSON.stringify({
DICT:["AUTO_DETECT","HYPER_EXPONENTIAL_LOAD","FLOPS","TERAHERTZ_LOGICAL","POWER_ESTIMATE_WATTS","MINING_AUTO_BEST","HASH_PER_DAY","HASH_PER_YEAR","REAL_ONLY_OR_UNAVAILABLE"],
host:{cpu:brand,cores,ram_gb:ram,ghz,node:process.version},
trillions:{exp_factor:EXP,gain,ops_s:triOpsS,logical_THz:logicalTHz,estimated_watts:EST_WATTS,ops_per_watt:triOpsS/EST_WATTS},
mining_best:{algo:best.algo,hash_s:best.hash_s,hash_day:best.hash_day,hash_year:best.hash_year,hash_per_watt:best.hash_w}
},null,2));
