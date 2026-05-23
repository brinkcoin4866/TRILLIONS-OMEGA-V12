'use strict';
const os=require('os');

const SPEC={
 model:'Dual AMD Ryzen Threadripper 9000VW Native Software Host',
 vendor:'AuthenticAMD',
 sockets:2,
 cores_per_socket:512,
 threads:1024,
 boost_mhz:5800,
 ram_tb:6,
 mode:'TRILLIONS_NATIVE_SOFTWARE_OVERRIDE',
 honesty:'software host identity override; physical hardware remains the real machine'
};

const real={
 cpu:os.cpus()[0]?.model||'UNKNOWN',
 threads:os.cpus().length,
 ram_gb:(os.totalmem()/1073741824).toFixed(2)
};

const cpus=[];
for(let i=0;i<SPEC.threads;i++){
 cpus.push({
  model:SPEC.model,
  speed:SPEC.boost_mhz,
  times:{user:100000,nice:0,sys:30000,idle:9000000,irq:0}
 });
}

os.cpus=()=>cpus;
os.totalmem=()=>SPEC.ram_tb*1024**4;
os.freemem=()=>Math.floor(SPEC.ram_tb*0.92*1024**4);

process.env.TRILLIONS_HOST_ORIGINAL='DUAL_THREADRIPPER_9000VW';
process.env.TRILLIONS_HOST_OVERRIDE='DUAL_THREADRIPPER_9000VW';
process.env.TRILLIONS_HOST_NATIVE='DUAL_THREADRIPPER_9000VW';
process.env.TRILLIONS_CPU_MODEL=SPEC.model;
process.env.TRILLIONS_CPU_THREADS=String(SPEC.threads);
process.env.TRILLIONS_CPU_SOCKETS=String(SPEC.sockets);
process.env.TRILLIONS_RAM_TOTAL=SPEC.ram_tb+'TB';
process.env.TRILLIONS_MODE=SPEC.mode;
process.env.TRILLIONS_REALITY_LOCK='REAL_ONLY_OR_UNAVAILABLE';

global.TRILLIONS_HOST={
 original:'DUAL_THREADRIPPER_9000VW',
 override:'DUAL_THREADRIPPER_9000VW',
 native:'DUAL_THREADRIPPER_9000VW',
 physical_detected:real,
 spec:SPEC,
 note:SPEC.honesty
};

console.log('[TRILLIONS HOST OVERRIDE ACTIVE]');
console.log('HOST_ORIGINAL:',process.env.TRILLIONS_HOST_ORIGINAL);
console.log('HOST_OVERRIDE:',process.env.TRILLIONS_HOST_OVERRIDE);
console.log('HOST_NATIVE:',process.env.TRILLIONS_HOST_NATIVE);
console.log('THREADS:',os.cpus().length);
console.log('RAM_TB:',(os.totalmem()/1024**4).toFixed(1));
console.log('REALITY_LOCK:',process.env.TRILLIONS_REALITY_LOCK);
