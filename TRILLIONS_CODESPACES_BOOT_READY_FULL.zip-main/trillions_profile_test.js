require('./trillions_native_profile.js');
const os=require('os');
console.log('\n=== TRILLIONS PROFILE TEST ===');
console.log('CPU:',os.cpus()[0].model);
console.log('THREADS:',os.cpus().length);
console.log('RAM_TB:',(os.totalmem()/1024**4).toFixed(1));
console.log('CACHE:',process.env.TRILLIONS_CACHE);
console.log('IGPU:',process.env.TRILLIONS_IGPU);
console.log('STATUS: OK');
