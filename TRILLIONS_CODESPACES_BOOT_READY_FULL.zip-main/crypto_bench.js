const crypto=require('crypto'),{performance}=require('perf_hooks'),os=require('os');

console.log('\n🔴 CRYPTO BENCHMARK\n');

const buf32=Buffer.alloc(32);

// SHA256
console.log('🔵 SHA256:');
const t1=performance.now();
for(let i=0;i<100000;i++)crypto.createHash('sha256').update(buf32).digest();
const ms1=performance.now()-t1;
console.log(`   ${(100000/(ms1/1000)/1e6).toFixed(1)}M/sec\n`);

// SHA512
console.log('🔵 SHA512:');
const t2=performance.now();
for(let i=0;i<50000;i++)crypto.createHash('sha512').update(buf32).digest();
const ms2=performance.now()-t2;
console.log(`   ${(50000/(ms2/1000)/1e6).toFixed(1)}M/sec\n`);

// MINING
console.log('🔵 MINING (100M nonces):');
let found=0;
const t3=performance.now();
for(let i=0;i<100000000;i++){
  const h=crypto.createHash('sha256').update(i.toString()).digest();
  if(h[0]<16)found++;
}
const ms3=performance.now()-t3;
console.log(`   Found: ${found} | ${(100000000/(ms3/1000)/1e6).toFixed(1)}M/sec\n`);

console.log('✅ Done');
