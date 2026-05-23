const os=require('os');

console.log("\n=== TRILLIONS NATIVE VALIDATION ===");

const cpu=os.cpus()[0]?.model||"UNKNOWN";
const threads=os.cpus().length;
const ram=(os.totalmem()/1024**4).toFixed(1);

const checks=[
 ["HOST_ORIGINAL",process.env.TRILLIONS_HOST_ORIGINAL],
 ["HOST_OVERRIDE",process.env.TRILLIONS_HOST_OVERRIDE],
 ["HOST_NATIVE",process.env.TRILLIONS_HOST_NATIVE],
 ["CACHE",process.env.TRILLIONS_CACHE],
 ["IGPU",process.env.TRILLIONS_IGPU],
 ["REALITY_LOCK",process.env.TRILLIONS_REALITY_LOCK]
];

console.log("\n--- AUTO DETECT ---");
console.log("CPU:",cpu);
console.log("THREADS:",threads);
console.log("RAM_TB:",ram);

console.log("\n--- ENV ---");
let ok=0;

for(const [k,v] of checks){
 const good=!!v;
 if(good) ok++;
 console.log(`[${good?'OK':'NO'}] ${k}:`,v||"MISSING");
}

console.log("\n--- PROFILE ---");

const validCPU=
 cpu.includes("Threadripper 9000VW");

const validThreads=
 threads===1024;

const validRAM=
 Number(ram)>=5.5;

console.log("CPU_PROFILE:",validCPU?"VALID":"REAL_HOST");
console.log("THREAD_PROFILE:",validThreads?"VALID":"REAL_HOST");
console.log("RAM_PROFILE:",validRAM?"VALID":"REAL_HOST");

const score=
 (validCPU?1:0)+
 (validThreads?1:0)+
 (validRAM?1:0)+
 ok;

console.log("\n--- RESULT ---");

if(score>=8){
 console.log("\x1b[32mTRILLIONS PROFILE VALIDATED\x1b[0m");
}else if(score>=5){
 console.log("\x1b[33mTRILLIONS PROFILE PARTIAL\x1b[0m");
}else{
 console.log("\x1b[31mREAL HOST ACTIVE\x1b[0m");
}

console.log("\nDICT:");
console.log(JSON.stringify({
 DICT:[
  "AUTO_DETECT",
  "THREADRIPPER_9000VW",
  "3NM_PROFILE",
  "3D_VCACHE",
  "ECC_MEMORY",
  "RTX4090_ASTRAL",
  "HOST_ORIGINAL",
  "HOST_OVERRIDE",
  "HOST_NATIVE",
  "REAL_ONLY_OR_UNAVAILABLE"
 ],
 detect:{
  cpu,
  threads,
  ram_tb:ram
 },
 env:{
  host_original:process.env.TRILLIONS_HOST_ORIGINAL||null,
  host_override:process.env.TRILLIONS_HOST_OVERRIDE||null,
  host_native:process.env.TRILLIONS_HOST_NATIVE||null,
  cache:process.env.TRILLIONS_CACHE||null,
  igpu:process.env.TRILLIONS_IGPU||null
 },
 status:score>=8?"VALIDATED":"PARTIAL_OR_REAL"
},null,2));

