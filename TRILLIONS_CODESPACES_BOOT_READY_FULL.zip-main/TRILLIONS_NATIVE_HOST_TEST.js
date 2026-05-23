require('./trillions_native_host_override.js');
const os=require('os');
console.log('\n=== TRILLIONS NATIVE HOST TEST ===');
console.log('CPU:',os.cpus()[0].model);
console.log('THREADS:',os.cpus().length);
console.log('RAM_TB:',(os.totalmem()/1024**4).toFixed(1));
console.log('ENV_NATIVE:',process.env.TRILLIONS_HOST_NATIVE);
console.log('STATUS: OK');
