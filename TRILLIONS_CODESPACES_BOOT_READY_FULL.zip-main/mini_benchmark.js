const os=require("os");
const crypto=require("crypto");
const {performance}=require("perf_hooks");

console.log("==================================");
console.log(" TRILLIONS MINI BENCHMARK");
console.log("==================================");

console.log("CPU :",os.cpus()[0].model);
console.log("THREADS :",os.cpus().length);
console.log("RAM TOTAL :", (os.totalmem()/1024/1024/1024).toFixed(2),"GB");
console.log("RAM FREE  :", (os.freemem()/1024/1024/1024).toFixed(2),"GB");
console.log("PLATFORM  :",os.platform(),os.arch());
console.log("----------------------------------");

const start=performance.now();

let hashes=0;

for(let i=0;i<200000;i++){
  crypto.createHash("sha256")
    .update("TRILLIONS_"+i)
    .digest("hex");
  hashes++;
}

const end=performance.now();

const sec=((end-start)/1000).toFixed(3);
const hps=Math.floor(hashes/sec);

console.log("HASHES :",hashes);
console.log("TIME   :",sec,"sec");
console.log("SHA256 :",hps,"H/s");

console.log("----------------------------------");

const mem=process.memoryUsage();

console.log("RSS        :", (mem.rss/1024/1024).toFixed(2),"MB");
console.log("HEAP USED  :", (mem.heapUsed/1024/1024).toFixed(2),"MB");
console.log("HEAP TOTAL :", (mem.heapTotal/1024/1024).toFixed(2),"MB");

console.log("==================================");
console.log(" BENCHMARK OK");
console.log("==================================");
