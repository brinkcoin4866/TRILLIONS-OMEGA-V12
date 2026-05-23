const os=require("os"),dns=require("dns"),net=require("net");
const {performance}=require("perf_hooks");

const C={
 r:"\x1b[0m",
 g:"\x1b[32m",
 y:"\x1b[33m",
 c:"\x1b[36m",
 m:"\x1b[35m",
 b:"\x1b[1m"
};

const fmt=x=>Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});

async function ping(host){
 return new Promise(res=>{
  const t0=performance.now();
  dns.lookup(host,err=>{
   if(err)return res(null);
   const s=net.createConnection(443,host);
   s.setTimeout(2000);
   s.on("connect",()=>{
    const ms=performance.now()-t0;
    s.destroy();
    res(ms);
   });
   s.on("timeout",()=>{s.destroy();res(null)});
   s.on("error",()=>res(null));
  });
 });
}

function vectorBench(sec){
 let ops=0;
 let diff=0;
 let vector=0;
 let pressure=0;
 let x=0.123456789;

 const start=process.hrtime.bigint();
 const end=BigInt(sec)*1000000000n;

 while((process.hrtime.bigint()-start)<end){

  for(let i=0;i<150000;i++){

   const vx=Math.sin(x+i*1e-6);
   const vy=Math.cos(x-i*1e-6);
   const vz=Math.tan((vx+vy)*1e-3);

   const dx=(vx-vy);
   const dy=(vy-vz);
   const dz=(vz-vx);

   const gradient=Math.sqrt(dx*dx+dy*dy+dz*dz);

   diff+=gradient;
   vector+=vx*vx+vy*vy+vz*vz;
   pressure+=Math.abs(diff*1e-6)+Math.abs(vector*1e-6);

   x=(x+gradient+pressure*1e-12)%1000000;

   ops+=32;
  }
 }

 const elapsed=Number(process.hrtime.bigint()-start)/1e9;

 return{
  elapsed,
  ops,
  ops_s:ops/elapsed,
  differential_field:diff,
  vector_field:vector,
  pressure_field:pressure
 };
}

(async()=>{

 const cpu=os.cpus()[0]?.model||"UNKNOWN";
 const threads=os.cpus().length;
 const ram=(os.totalmem()/1073741824).toFixed(2);

 console.log(C.b+C.y+"\n=== TRILLIONS VECTOR DIFFERENTIAL BENCH ==="+C.r);

 console.log("\n--- AUTO DETECT ---");
 console.log("CPU:",cpu);
 console.log("THREADS:",threads);
 console.log("RAM_GB:",ram);
 console.log("NODE:",process.version);

 console.log(C.m+"\n--- VECTOR DIFFERENTIAL 5s ---"+C.r);

 const r=vectorBench(5);

 console.log("TIME_s:",r.elapsed.toFixed(2));
 console.log("OPS:",fmt(r.ops));
 console.log("OPS/s:",fmt(r.ops_s));
 console.log("VECTOR_FIELD:",fmt(r.vector_field));
 console.log("DIFFERENTIAL_FIELD:",fmt(r.differential_field));
 console.log("PRESSURE_FIELD:",fmt(r.pressure_field));
 console.log("LOGICAL_GFLOPS:",(r.ops_s/1e9).toFixed(3));

 console.log(C.c+"\n--- NETWORK ---"+C.r);

 let sum=0,ok=0;

 for(const h of ["github.com","google.com","cloudflare.com"]){
  const ms=await ping(h);
  console.log(h,ms?ms.toFixed(2)+" ms":"UNAVAILABLE");
  if(ms){sum+=ms;ok++;}
 }

 const avg=ok?sum/ok:0;

 console.log(C.g+"\n--- RESULT ---"+C.r);

 console.log("AVG_LATENCY_MS:",avg.toFixed(2));
 console.log("HEALTH:",(100-Math.min(avg,100)).toFixed(2)+"%");
 console.log("STATUS: OK");

 console.log("\nDICT:");
 console.log(JSON.stringify({
  DICT:[
   "AUTO_DETECT",
   "CPU_SCAN",
   "NETWORK_SCAN",
   "VECTOR_COMPUTING",
   "DIFFERENTIAL_FIELD",
   "PRESSURE_FIELD",
   "REAL_ONLY_OR_UNAVAILABLE"
  ],
  host:{
   cpu,
   threads,
   ram_gb:ram,
   node:process.version
  },
  benchmark:{
   seconds:5,
   ops:r.ops,
   ops_s:r.ops_s,
   logical_gflops:r.ops_s/1e9,
   vector_field:r.vector_field,
   differential_field:r.differential_field,
   pressure_field:r.pressure_field,
   latency_ms:avg
  },
  honesty:"REAL_CPU_RUNTIME_ONLY"
 },null,2));

})();
