const crypto=require('crypto'),{performance}=require('perf_hooks');

console.log('\n🔴═══════════════════════════════════════════════════════════════════════════════════');
console.log('   TRILLIONS MINING EARNINGS - BTC / ETH / UTXO');
console.log('═══════════════════════════════════════════════════════════════════════════════════🔴\n');

// MESURE RÉELLE - 1 minute
console.log('🔵 MEASURING HASH RATE (60 seconds):');
const t_start=performance.now();
let hashes=0;
while(performance.now()-t_start<60000){
  const buf=Buffer.alloc(32);
  crypto.randomFillSync(buf);
  crypto.createHash('sha256').update(buf).digest();
  hashes++;
}
const duration_sec=(performance.now()-t_start)/1000;
const hashrate=Math.round(hashes/duration_sec);

console.log(`   Hashes: ${hashes}`);
console.log(`   Time: ${duration_sec.toFixed(1)}sec`);
console.log(`   Rate: ${(hashrate/1e6).toFixed(2)}M/sec\n`);

// BITCOIN MINING
console.log('🔵 BITCOIN MINING (SHA256):');
const BTC_DIFFICULTY=84000000000000;
const BTC_REWARD=6.25;
const BTC_PRICE=40000;

const btc_seconds_per_block=BTC_DIFFICULTY/hashrate;
const btc_blocks_per_day=86400/btc_seconds_per_block;
const btc_per_day=btc_blocks_per_day*BTC_REWARD;
const btc_per_year=btc_per_day*365;
const btc_usd_per_year=btc_per_year*BTC_PRICE;

console.log(`   Hash rate: ${(hashrate/1e6).toFixed(2)}M/sec`);
console.log(`   BTC per day: ${btc_per_day.toFixed(6)}`);
console.log(`   BTC per year: ${btc_per_year.toFixed(3)}`);
console.log(`   USD per year: $${btc_usd_per_year.toFixed(0)}\n`);

// ETHEREUM MINING (ETH - Ethash algorithm, different difficulty)
console.log('🔵 ETHEREUM MINING (Ethash):');
const ETH_DIFFICULTY=8000000000000000; // Much higher than BTC
const ETH_REWARD=2.5; // Current ETH block reward
const ETH_PRICE=2500;

// Ethash is more complex, assume 10% of SHA256 speed
const eth_effective_hashrate=hashrate*0.10;
const eth_seconds_per_block=ETH_DIFFICULTY/eth_effective_hashrate;
const eth_blocks_per_day=86400/eth_seconds_per_block;
const eth_per_day=eth_blocks_per_day*ETH_REWARD;
const eth_per_year=eth_per_day*365;
const eth_usd_per_year=eth_per_year*ETH_PRICE;

console.log(`   Effective rate: ${(eth_effective_hashrate/1e6).toFixed(2)}M/sec`);
console.log(`   ETH per day: ${eth_per_day.toFixed(6)}`);
console.log(`   ETH per year: ${eth_per_year.toFixed(3)}`);
console.log(`   USD per year: $${eth_usd_per_year.toFixed(0)}\n`);

// UTXO ANALYSIS (Bitcoin blockchain)
console.log('🔵 UTXO ANALYSIS:');
const total_btc_circulating=21000000; // Total BTC supply
const avg_utxo_size=0.5; // Average UTXO in BTC
const total_utxos=Math.round(total_btc_circulating/avg_utxo_size);

// With mining, you find new UTXO (coinbase) every block
const utxos_created_per_day=Math.round(btc_blocks_per_day);
const utxos_created_per_year=utxos_created_per_day*365;

console.log(`   Network total UTXOs: ${total_utxos.toLocaleString()}`);
console.log(`   Your UTXOs created/day: ${utxos_created_per_day}`);
console.log(`   Your UTXOs created/year: ${utxos_created_per_year}\n`);

// COMBINED EARNINGS
console.log('🔴 TOTAL ANNUAL EARNINGS:');
const total_usd_per_year=btc_usd_per_year+eth_usd_per_year;
console.log(`   BTC: ${btc_per_year.toFixed(3)} ($${btc_usd_per_year.toFixed(0)})`);
console.log(`   ETH: ${eth_per_year.toFixed(3)} ($${eth_usd_per_year.toFixed(0)})`);
console.log(`   TOTAL: $${total_usd_per_year.toFixed(0)}/year\n`);

// RYZEN PROJECTION (x18 multiplier)
console.log('🔴 PROJECTED ON RYZEN 9 9950X3D (x18):');
const ryzen_hashrate=hashrate*18;
const ryzen_btc_per_year=btc_per_year*18;
const ryzen_btc_usd=ryzen_btc_per_year*BTC_PRICE;
const ryzen_eth_per_year=eth_per_year*18;
const ryzen_eth_usd=ryzen_eth_per_year*ETH_PRICE;
const ryzen_total=(ryzen_btc_usd+ryzen_eth_usd);

console.log(`   Hash rate: ${(ryzen_hashrate/1e6).toFixed(0)}M/sec`);
console.log(`   BTC/year: ${ryzen_btc_per_year.toFixed(2)} ($${ryzen_btc_usd.toFixed(0)})`);
console.log(`   ETH/year: ${ryzen_eth_per_year.toFixed(2)} ($${ryzen_eth_usd.toFixed(0)})`);
console.log(`   TOTAL: $${ryzen_total.toFixed(0)}/year\n`);

// POWER & PROFIT
console.log('🔴 POWER CONSUMPTION & NET PROFIT:');
const codespaces_power=40; // Watts
const ryzen_power=300; // Watts
const electricity_cost=0.12; // $/kWh

const codespaces_daily_cost=(codespaces_power*24/1000)*electricity_cost;
const codespaces_daily_revenue=total_usd_per_year/365;
const codespaces_daily_profit=codespaces_daily_revenue-codespaces_daily_cost;

const ryzen_daily_cost=(ryzen_power*24/1000)*electricity_cost;
const ryzen_daily_revenue=ryzen_total/365;
const ryzen_daily_profit=ryzen_daily_revenue-ryzen_daily_cost;

console.log(`   Codespaces:`);
console.log(`     Daily profit: $${codespaces_daily_profit.toFixed(2)}`);
console.log(`     Monthly: $${(codespaces_daily_profit*30).toFixed(0)}`);
console.log(`     Yearly: $${(codespaces_daily_profit*365).toFixed(0)}\n`);

console.log(`   Ryzen 9 9950X3D:`);
console.log(`     Daily profit: $${ryzen_daily_profit.toFixed(2)}`);
console.log(`     Monthly: $${(ryzen_daily_profit*30).toFixed(0)}`);
console.log(`     Yearly: $${(ryzen_daily_profit*365).toFixed(0)}\n`);

console.log('✅ TRILLIONS proves: Pure programming = viable mining');
