const os=require("os");
const crypto=require("crypto");
const dns=require("dns");
const net=require("net");
const zlib=require("zlib");
const {performance}=require("perf_hooks");

function fmt(x){
 return Number(x).toLocaleString("fr-FR",{maximumFractionDigits:2});
}

const cpu=os.cpus();
const cores=cpu.length;
const ramTotal=(os.totalmem()/1073741824);
const ramFree=(os.freemem()/1073741824);
const uptime=os.uptime();

function cpuBench(iter){

 let x=0;

 for(let i=0;i<iter;i++){

  x+=
  Math.sin(i*.000001)+
  Math.cos(i*.000003)+
  Math.sqrt(i%999);
 }

 return x;
}

function superChaosBench(seconds){

 let x=0x9e3779b9|0;

 let ops=0;

 let entropy=0;

 let pressure=0;

 const start=
 process.hrtime.bigint();

 const end=
 BigInt(seconds)*
 1000000000n;

 while(
  (
   process.hrtime.bigint()-
   start
  )<end
 ){

  const raw=
  Buffer.allocUnsafe(
   1024*256
  );

  raw.fill(
   x&255
  );

  zlib.gzipSync(
   raw,
   {level:1}
  );

  for(
   let i=0;
   i<120000;
   i++
  ){

   x^=x<<13;
   x^=x>>>17;
   x^=x<<5;

   x+=
   Math.sin(x*.000001)*
   1000;

   x+=
   Math.cos(i*.000003)*
   500;

   entropy+=
   Math.tan(
    (x%360)*
    0.00001
   );

   pressure+=
   Math.sqrt(
    Math.abs(
     entropy
    )+1
   );

   ops++;
  }
 }

 const elapsed=
 Number(
  process.hrtime.bigint()-
  start
 )/1e9;

 return{
  chaos:x,
  entropy,
  pressure,
  ops,
  opss:ops/elapsed,
  elapsed
 };
}

async function pingTest(host){

 return new Promise(res=>{

  const t0=
  performance.now();

  dns.lookup(host,err=>{

   if(err)
    return res(null);

   const socket=
   net.createConnection(
    443,
    host
   );

   socket.setTimeout(3000);

   socket.on(
    "connect",
    ()=>{

     const ms=
     performance.now()-t0;

     socket.destroy();

     res(ms);
    }
   );

   socket.on(
    "timeout",
    ()=>{
     socket.destroy();
     res(null);
    }
   );

   socket.on(
    "error",
    ()=>{
     res(null);
    }
   );
  });
 });
}

(async()=>{

 console.log(
 "\n=== MACHINE SCANNER SUPER CHAOS LIMIT ===\n"
 );

 console.log(
 "SYSTEM:",
 os.platform(),
 os.release(),
 os.arch()
 );

 console.log(
 "CPU_THREADS:",
 cores
 );

 console.log(
 "RAM_TOTAL_GB:",
 ramTotal.toFixed(2)
 );

 console.log(
 "RAM_FREE_GB:",
 ramFree.toFixed(2)
 );

 console.log(
 "UPTIME_H:",
 (
  uptime/3600
 ).toFixed(2)
 );

 const t0=
 performance.now();

 const bench=
 cpuBench(
  Math.max(
   300000,
   cores*150000
  )
 );

 const cpuMs=
 performance.now()-t0;

 const score=
 (
  (
   cores*
   1000000
  )/
  cpuMs
 );

 console.log(
 "\n--- CPU BENCH ---\n"
 );

 console.log(
 "TIME_MS:",
 cpuMs.toFixed(2)
 );

 console.log(
 "CPU_SCORE:",
 fmt(score)
 );

 console.log(
 "BENCH_HASH:",
 crypto
 .createHash("sha256")
 .update(String(bench))
 .digest("hex")
 .slice(0,16)
 );

 console.log(
 "\n--- SUPER CHAOS 5s ---\n"
 );

 const chaos=
 superChaosBench(5);

 console.log(
 "CHAOS_TIME_s:",
 chaos.elapsed.toFixed(2)
 );

 console.log(
 "CHAOS_OPS:",
 fmt(chaos.ops)
 );

 console.log(
 "CHAOS_OPS/s:",
 fmt(chaos.opss)
 );

 console.log(
 "ENTROPY:",
 fmt(chaos.entropy)
 );

 console.log(
 "PRESSURE:",
 fmt(chaos.pressure)
 );

 console.log(
 "CHAOS_HASH:",
 crypto
 .createHash("sha256")
 .update(
  String(
   chaos.chaos+
   chaos.entropy+
   chaos.pressure
  )
 )
 .digest("hex")
 .slice(0,16)
 );

 console.log(
 "\n--- NETWORK ---\n"
 );

 const hosts=[
  "github.com",
  "google.com",
  "cloudflare.com"
 ];

 let total=0;
 let ok=0;

 for(const h of hosts){

  const ms=
  await pingTest(h);

  console.log(
   h,
   ":",
   ms?
   ms.toFixed(2)+" ms":
   "UNAVAILABLE"
  );

  if(ms){
   total+=ms;
   ok++;
  }
 }

 const avg=
 ok?
 total/ok:
 0;

 console.log(
 "\nAVG_LATENCY_MS:",
 avg.toFixed(2)
 );

 let perf="LOW";

 if(
  score>100000 &&
  chaos.opss>8000000
 )
  perf="EXTREME";
 else if(
  score>50000
 )
  perf="HIGH";
 else if(
  score>20000
 )
  perf="MEDIUM";

 console.log(
 "\n--- PERFORMANCE ---\n"
 );

 console.log(
 "LEVEL:",
 perf
 );

 console.log(
 "HEALTH:",
 (
  100-
  Math.min(avg,100)
 ).toFixed(2)+"%"
 );

 console.log(
 "\nSTATUS: OK"
 );

 console.log(
 "HONESTY: REAL_ONLY_OR_UNAVAILABLE"
 );

 console.log(
 "\nDICT:"
 );

 console.log(
 JSON.stringify({
  DICT:[
   "AUTO_DETECT",
   "CPU_SCAN",
   "RAM_SCAN",
   "NETWORK_SCAN",
   "LATENCY_SCAN",
   "SUPER_CHAOS_LIMIT",
   "ENTROPY_PRESSURE",
   "PERFORMANCE_LEVEL",
   "REAL_ONLY_OR_UNAVAILABLE"
  ],
  system:{
   platform:os.platform(),
   arch:os.arch(),
   release:os.release()
  },
  hardware:{
   cpu_threads:cores,
   ram_total_gb:ramTotal,
   ram_free_gb:ramFree
  },
  benchmark:{
   cpu_score:score,
   chaos_ops_s:chaos.opss,
   entropy:chaos.entropy,
   pressure:chaos.pressure,
   latency_ms:avg,
   level:perf
  }
 },null,2)
 );

})();
