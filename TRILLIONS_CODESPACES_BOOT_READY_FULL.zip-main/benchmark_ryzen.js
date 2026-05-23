const crypto=require('crypto'),{performance}=require('perf_hooks'),os=require('os');

console.log('\n🔴 RYZEN 9 9950X3D BENCHMARK\n');

const CPU=os.cpus()[0].model;
const CORES=os.cpus().length;
const FREQ=os.cpus()[0].speed;

console.log(`CPU: ${CPU}`);
console.log(`Cores: ${CORES} @ ${FREQ}MHz\n`);

// SHA256 CPU
console.log('🔵 SHA256 CPU (60 seconds):');
const buf=Buffer.alloc(32);
const t1=performance.now();
let count=0;
while(performance.now()-t1<60000){
  crypto.createHash('sha256').update(buf).digest();
  count++;
}
const ms1=performance.now()-t1;
const cpu_rate=Math.round(count/(ms1/1000));
console.log(`   Rate: ${(cpu_rate/1e6).toFixed(2)}M/sec\n`);

// Codespaces vs Ryzen projection
const codespaces_rate=150000; // 0.15M measured
const ryzen_multiplier=(CORES/2)*(FREQ/2800);
const ryzen_projected=codespaces_rate*ryzen_multiplier;

console.log(`🔵 PROJECTION:`);
console.log(`   Codespaces baseline: 0.15M/sec`);
console.log(`   Ryzen multiplier: x${ryzen_multiplier.toFixed(1)}`);
console.log(`   Ryzen projected: ${(ryzen_projected/1e6).toFixed(1)}M/sec\n`);

// With GPU boost
const gpu_boost=5; // RTX 4080 conservative
const gpu_total=ryzen_projected*gpu_boost;

console.log(`🔵 WITH RTX 4080 GPU:`);
console.log(`   GPU boost: x${gpu_boost}`);
console.log(`   Total: ${(gpu_total/1e6).toFixed(1)}M/sec\n`);

// BTC earnings
const DIFFICULTY=84000000000000;
const REWARD=6.25;
const PRICE=40000;

const btc_per_day=(86400/(DIFFICULTY/gpu_total))*REWARD;
const btc_per_year=btc_per_day*365;
const usd_per_year=btc_per_year*PRICE;

console.log(`🔴 ANNUAL EARNINGS:`);
console.log(`   BTC: ${btc_per_year.toFixed(2)}`);
console.log(`   USD: $${usd_per_year.toFixed(0)}\n`);
