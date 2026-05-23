const crypto = require('crypto');
const {performance} = require('perf_hooks');

console.log('\n🔴 SHA256 AVX512 TEST\n');

// Test avec crypto Node.js (baseline)
console.log('🔵 Node.js crypto baseline:');
const buf = Buffer.alloc(32);
const t1 = performance.now();
let count = 0;
for(let i = 0; i < 100000; i++) {
  crypto.createHash('sha256').update(buf).digest();
  count++;
}
const ms1 = performance.now() - t1;
const baseline = Math.round(count / (ms1 / 1000));
console.log(`   ${baseline} hashes/sec\n`);

// Si module compilé existe, tester
try {
  const sha256 = require('./build/Release/sha256_avx512');
  console.log('🔵 AVX512 module (si compilé):');
  const t2 = performance.now();
  for(let i = 0; i < 10000; i++) {
    sha256.hash(buf);
  }
  const ms2 = performance.now() - t2;
  const avx512_rate = Math.round(10000 / (ms2 / 1000));
  console.log(`   ${avx512_rate} hashes/sec`);
  console.log(`   Gain: ${((avx512_rate / baseline) - 1) * 100).toFixed(0)}%\n`);
} catch(e) {
  console.log('⚠️  Module pas encore compilé (normal)\n');
}

console.log('✅ Test complete\n');
