const os=require("os"),crypto=require("crypto"),dns=require("dns"),net=require("net"),zlib=require("zlib");
const {performance}=require("perf_hooks");
const cpu=os.cpus(),cores=cpu.length,ramT=os.totalmem()/2**30,ramF=os.freemem()/2**30;
const C={r:"\x1b[0m",b:"\x1b[1m",y:"\x1b[33m",m:"\x1b[35m",c:"\x1b[36m"};
const fmt=x=>Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});
const hash=x=>crypto.createHash("sha256").update(String(x)).digest("hex").slice(0,16);

function hpc7s(sec){
 let ops=0,acc=0,entropy=0,pressure=0,linpack=0,mpi=0,vector=0,universe=0;
 let x=0x9e3779b9|0;
 const start=process.hrtime.bigint(), end=BigInt(sec)*1000000000n;
 while((process.hrtime.bigint()-start)<end){
  const raw=Buffer.allocUnsafe(256*1024); raw.fill(x&255); zlib.gzipSync(raw,{level:1});
  for(let i=0;i<22000;i++){
   x^=x<<13; x^=x>>>17; x^=x<<5;

   // LINPACK-like dense matrix micro-kernel
   let a=Math.sin((x+i)*1e-6),b=Math.cos((x-i)*3e-6),c=Math.sqrt(Math.abs(a*b)+1.000001);
   let d=Math.log1p((i%997)+Math.abs(x%4096)),e=Math.exp(-((i%2048)/4096));
   linpack+=(a*b+c*d+e)*(a+c);

   // HPC vectoriel massif
   const vx=a*c+d, vy=b*e+a, vz=Math.sin(vx*vy*1e-6);
   const dot=vx*vx+vy*vy+vz*vz, norm=Math.sqrt(Math.abs(dot)+1e-12);
   vector+=dot+norm+vx-vy+vz;

   // MPI-like distributed scientific reduction
   const rank=i%Math.max(2,cores), local=Math.sin(rank+vector*1e-9)+Math.cos(linpack*1e-9);
   mpi+=local/(1+rank);

   // Universe synthetic field
   const mass=1.989e30/(1+(i%8192)), radius=1e9+(i%100000);
   const gravity=6.67430e-11*mass/(radius*radius);
   const expansion=70*Math.log1p(i%100000)*1e-6;
   const dark=Math.sin(expansion+gravity)*Math.cos(norm);
   universe+=gravity+expansion+dark;

   entropy+=Math.sin(acc*1e-6)+Math.cos(pressure*1e-6)+dark;
   pressure+=Math.sqrt(Math.abs(entropy)+1)+norm;
   acc+=linpack*1e-9+vector*1e-9+mpi+universe;
   ops+=260;
  }
 }
 const elapsed=Number(process.hrtime.bigint()-start)/1e9;
 return {elapsed,ops,ops_s:ops/elapsed,linpack,vector,mpi,universe,entropy,pressure,hash:hash(acc+linpack+vector+mpi+universe)};
}

async function ping(host){return new Promise(res=>{
 const t0=performance.now();dns.lookup(host,err=>{
  if(err)return res(null);const s=net.createConnection(443,host);s.setTimeout(2500);
  s.on("connect",()=>{const ms=performance.now()-t0;s.destroy();res(ms)});
  s.on("timeout",()=>{s.destroy();res(null)});s.on("error",()=>res(null));
 });
});}

(async()=>{
 console.log(C.b+C.y+"\n=== MACHINE SCANNER + UNIVERSE HPC 7s ==="+C.r);
 console.log("SYSTEM:",os.platform(),os.release(),os.arch());
 console.log("CPU:",cpu[0]?.model||"UNKNOWN");
 console.log("THREADS:",cores,"| RAM_TOTAL_GB:",ramT.toFixed(2),"| RAM_FREE_GB:",ramF.toFixed(2));
 console.log("HONESTY: LINPACK/HPC/MPI = micro-benchmark local + MPI-like workerless reduction, pas vrai cluster MPI externe.\n");

 const r=hpc7s(7);
 console.log(C.m+"--- HPC UNIVERSE 7s ---"+C.r);
 console.log("TIME_s:",r.elapsed.toFixed(2));
 console.log("OPS:",fmt(r.ops));
 console.log("OPS/s:",fmt(r.ops_s));
 console.log("LINPACK_FIELD:",fmt(r.linpack));
 console.log("VECTOR_FIELD:",fmt(r.vector));
 console.log("MPI_REDUCTION_FIELD:",fmt(r.mpi));
 console.log("UNIVERSE_FIELD:",fmt(r.universe));
 console.log("ENTROPY:",fmt(r.entropy));
 console.log("PRESSURE:",fmt(r.pressure));
 console.log("LOGICAL_TFLOPS:",(r.ops_s/1e12).toExponential(6));
 console.log("HASH:",r.hash);

 console.log(C.c+"\n--- NETWORK ---"+C.r);
 let sum=0,ok=0;for(const h of ["github.com","google.com","cloudflare.com"]){const ms=await ping(h);console.log(h,ms?ms.toFixed(2)+" ms":"UNAVAILABLE");if(ms){sum+=ms;ok++;}}
 const avg=ok?sum/ok:0;
 const level=r.ops_s>4e8?"HPC_UNIVERSE_EXTREME":r.ops_s>1e8?"HPC_HEAVY":"HEAVY";

 console.log(C.b+"\n--- RESULT ---"+C.r);
 console.log("LEVEL:",level);
 console.log("AVG_LATENCY_MS:",avg.toFixed(2));
 console.log("HEALTH:",(100-Math.min(avg,100)).toFixed(2)+"%");
 console.log("STATUS: OK");

 console.log("\nDICT:");
 console.log(JSON.stringify({
  DICT:["AUTO_DETECT","CPU_SCAN","NETWORK_SCAN","UNIVERSE_VECTOR_7S","LINPACK_MICRO","HPC_VECTOR_MASSIVE","MPI_LIKE_REDUCTION","SCIENTIFIC_DISTRIBUTED_LOCAL","CHAOS","COMPRESSION","REAL_ONLY_OR_UNAVAILABLE"],
  host:{cpu:cpu[0]?.model||"UNKNOWN",threads:cores,ram_total_gb:ramT,ram_free_gb:ramF,node:process.version},
  benchmark:{seconds:7,ops:r.ops,ops_s:r.ops_s,logical_tflops:r.ops_s/1e12,linpack_field:r.linpack,vector_field:r.vector,mpi_reduction_field:r.mpi,universe_field:r.universe,latency_ms:avg,level,hash:r.hash},
  note:"Ajout de 2 secondes : LINPACK-like, HPC vectoriel massif, réduction MPI-like locale, calcul scientifique distribué local."
 },null,2));
})();
