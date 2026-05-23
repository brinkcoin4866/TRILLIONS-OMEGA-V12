'use strict';
const os=require('os');

const SPEC={
 cpu:'AMD Ryzen Threadripper 9000VW 3nm @ 5900MHz',
 vendor:'AuthenticAMD',
 sockets:2,
 cores_per_socket:512,
 threads:1024,
 mhz:5900,
 cache:'244MB 3D-VCache accelerated ECC',
 ram:'6TB DDR5 ECC',
 igpu:'ASUS RTX4090 ASTRAL iGPU Software Bridge',
 mode:'HOST_ORIGINAL_OVERRIDE_NATIVE',
 reality:'SOFTWARE_COMPUTER_VIRTUALIZED_REAL_ONLY_OR_UNAVAILABLE'
};

const real={
 cpu:os.cpus()[0]?.model||'UNKNOWN',
 threads:os.cpus().length,
 ram_gb:(os.totalmem()/1073741824).toFixed(2)
};

const cpus=[];
for(let i=0;i<SPEC.threads;i++){
 cpus.push({
  model:SPEC.cpu,
  speed:SPEC.mhz,
  times:{user:100000,nice:0,sys:30000,idle:9000000,irq:0}
 });
}

os.cpus=()=>cpus;
os.totalmem=()=>6*1024**4;
os.freemem=()=>Math.floor(5.6*1024**4);

Object.assign(process.env,{
 TRILLIONS_HOST_ORIGINAL:SPEC.cpu,
 TRILLIONS_HOST_OVERRIDE:SPEC.cpu,
 TRILLIONS_HOST_NATIVE:SPEC.cpu,
 TRILLIONS_CPU_VENDOR:SPEC.vendor,
 TRILLIONS_CPU_THREADS:String(SPEC.threads),
 TRILLIONS_CPU_SOCKETS:String(SPEC.sockets),
 TRILLIONS_CPU_FREQ_MHZ:String(SPEC.mhz),
 TRILLIONS_CPU_PROCESS:'3nm',
 TRILLIONS_CACHE:'244MB_3D_VCACHE_ACCELERATED_ECC',
 TRILLIONS_RAM:'6TB_DDR5_ECC',
 TRILLIONS_IGPU:SPEC.igpu,
 TRILLIONS_GPU_BRIDGE:'ASUS_RTX4090_ASTRAL',
 TRILLIONS_PROFILE_MODE:SPEC.mode,
 TRILLIONS_REALITY_LOCK:'REAL_ONLY_OR_UNAVAILABLE'
});

global.TRILLIONS_NATIVE_PROFILE={
 host_original:SPEC.cpu,
 host_override:SPEC.cpu,
 host_native:SPEC.cpu,
 cache:SPEC.cache,
 ram:SPEC.ram,
 igpu:SPEC.igpu,
 real_detected:real,
 reality:SPEC.reality
};

if(!process.env.TRILLIONS_SILENT){
 console.log('[TRILLIONS SOFTWARE COMPUTER PROFILE ACTIVE]');
 console.log('HOST_ORIGINAL:',SPEC.cpu);
 console.log('HOST_OVERRIDE:',SPEC.cpu);
 console.log('HOST_NATIVE:',SPEC.cpu);
 console.log('THREADS:',os.cpus().length);
 console.log('CACHE:',SPEC.cache);
 console.log('RAM:',SPEC.ram);
 console.log('IGPU:',SPEC.igpu);
 console.log('REALITY_LOCK:',process.env.TRILLIONS_REALITY_LOCK);
}
