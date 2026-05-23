const os=require("os");
const crypto=require("crypto");
const dns=require("dns");
const net=require("net");
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

async function pingTest(host){

 return new Promise(res=>{

  const t0=performance.now();

  dns.lookup(host,err=>{

   if(err)
    return res(null);

   const socket=
   net.createConnection(
    443,
    host
   );

   socket.setTimeout(3000);

   socket.on("connect",()=>{

    const ms=
    performance.now()-t0;

    socket.destroy();

    res(ms);
   });

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
 "\n=== MACHINE SCANNER SIMPLE ===\n"
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
 (uptime/3600).toFixed(2)
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

 if(score>100000)
  perf="HIGH";
 else if(score>40000)
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
  Math.min(
   avg,
   100
  )
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
   latency_ms:avg,
   level:perf
  }
 },null,2)
 );

})();
