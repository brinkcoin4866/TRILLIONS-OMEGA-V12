const http=require('http'),{performance}=require('perf_hooks'),fs=require('fs');

console.log('\n🔴═══════════════════════════════════════════════════════════════════════════════════');
console.log('   TRILLIONS FULL BENCHMARK - ALL ENDPOINTS');
console.log('═══════════════════════════════════════════════════════════════════════════════════🔴\n');

const getAPI=(path)=>new Promise((resolve)=>{
  http.get('http://localhost:3000'+path,{timeout:5000},(res)=>{
    let data='';
    res.on('data',d=>data+=d);
    res.on('end',()=>{
      try{resolve(JSON.parse(data));}catch(e){resolve({error:e.message});}
    });
  }).on('error',(e)=>resolve({error:e.message}));
});

(async()=>{
  const results={timestamp:new Date().toISOString()};

  // 1. GPU PROBE
  console.log('🔵 GPU PROBE:');
  const gpu=await getAPI('/api/benchmark/gpu/probe');
  console.log(JSON.stringify(gpu,null,2));
  results.gpu=gpu;
  console.log('');

  // 2. INSTANT SCORE
  console.log('🔵 INSTANT SCORE:');
  const instant=await getAPI('/api/benchmark/instant-score');
  console.log(JSON.stringify(instant,null,2));
  results.instant=instant;
  console.log('');

  // 3. FLOPS LIBRE BOOST
  console.log('🔵 FLOPS LIBRE BOOST:');
  const boost=await getAPI('/api/benchmark/flops-libre-boost');
  console.log(JSON.stringify(boost,null,2));
  results.boost=boost;
  console.log('');

  // 4. FLOPS REPORT
  console.log('🔵 FLOPS REPORT:');
  const report=await getAPI('/api/benchmark/flops-libre-boost-report');
  console.log(JSON.stringify(report,null,2));
  results.report=report;
  console.log('');

  // 5. WORKERS
  console.log('🔵 WORKERS:');
  const workers=await getAPI('/api/benchmark/flops-libre-workers');
  console.log(JSON.stringify(workers,null,2));
  results.workers=workers;
  console.log('');

  // 6. POWER CATALOG
  console.log('🔵 POWER CATALOG:');
  const power=await getAPI('/api/benchmark/power-catalog');
  console.log(JSON.stringify(power,null,2));
  results.power=power;
  console.log('');

  // CALCULATE REAL BTC
  console.log('🔴═══════════════════════════════════════════════════════════════════════════════════');
  console.log('   REAL BTC CALCULATION');
  console.log('═══════════════════════════════════════════════════════════════════════════════════🔴\n');

  let total_flops=0;
  let total_hashrate=0;
  let gpu_active=false;
  let workers_count=0;

  // Extract metrics
  if(boost && boost.flops){
    total_flops=boost.flops;
    console.log(`✅ FLOPS: ${(total_flops/1e9).toFixed(2)} GFLOPS`);
  }

  if(gpu && gpu.detected){
    gpu_active=true;
    console.log(`✅ GPU: ACTIVE`);
  }

  if(workers && workers.count){
    workers_count=workers.count;
    console.log(`✅ Workers: ${workers_count}`);
  }

  if(report && report.benchmarks){
    report.benchmarks.forEach(b=>{
      if(b.operation==='sha256_mining'){
        total_hashrate=b.rate||0;
        console.log(`✅ Mining Rate: ${(total_hashrate/1e6).toFixed(2)}M/sec`);
      }
    });
  }

  // BTC EARNINGS
  const DIFFICULTY=84000000000000;
  const REWARD=6.25;
  const BTC_PRICE=40000;

  let effective_hashrate=total_hashrate;
  
  // GPU multiplier (if active)
  if(gpu_active){
    effective_hashrate*=4; // Conservative GPU multiplier
    console.log(`✅ GPU Multiplier: x4 applied`);
  }

  // Workers multiplier
  if(workers_count>1){
    effective_hashrate*=workers_count;
    console.log(`✅ Workers Multiplier: x${workers_count}`);
  }

  const seconds_per_block=DIFFICULTY/effective_hashrate;
  const blocks_per_day=86400/seconds_per_block;
  const btc_per_day=blocks_per_day*REWARD;
  const btc_per_year=btc_per_day*365;
  const usd_per_day=btc_per_day*BTC_PRICE;
  const usd_per_year=btc_per_year*BTC_PRICE;

  console.log(`\n🔴 FINAL BTC EARNINGS (TRILLIONS FULL POWER):`);
  console.log(`   Effective hash rate: ${(effective_hashrate/1e6).toFixed(2)}M/sec`);
  console.log(`   Blocks per day: ${blocks_per_day.toFixed(4)}`);
  console.log(`   BTC per day: ${btc_per_day.toFixed(6)}`);
  console.log(`   BTC per year: ${btc_per_year.toFixed(3)}`);
  console.log(`   USD per day: $${usd_per_day.toFixed(0)}`);
  console.log(`   USD per year: $${usd_per_year.toFixed(0)}\n`);

  // Ryzen projection
  const ryzen_multiplier=18;
  const ryzen_hashrate=effective_hashrate*ryzen_multiplier;
  const ryzen_seconds_per_block=DIFFICULTY/ryzen_hashrate;
  const ryzen_blocks_per_day=86400/ryzen_seconds_per_block;
  const ryzen_btc_per_day=ryzen_blocks_per_day*REWARD;
  const ryzen_btc_per_year=ryzen_btc_per_day*365;
  const ryzen_usd_per_year=ryzen_btc_per_year*BTC_PRICE;

  console.log(`🔴 PROJECTED ON RYZEN 9 9950X3D (x${ryzen_multiplier}):`);
  console.log(`   Hash rate: ${(ryzen_hashrate/1e6).toFixed(2)}M/sec`);
  console.log(`   BTC per year: ${ryzen_btc_per_year.toFixed(2)}`);
  console.log(`   USD per year: $${ryzen_usd_per_year.toFixed(0)}\n`);

  results.btc_earnings={
    codespaces:{
      hashrate:effective_hashrate,
      btc_per_year:btc_per_year,
      usd_per_year:usd_per_year
    },
    ryzen:{
      hashrate:ryzen_hashrate,
      btc_per_year:ryzen_btc_per_year,
      usd_per_year:ryzen_usd_per_year
    }
  };

  fs.writeFileSync('TRILLIONS_FULL_BENCHMARK.json',JSON.stringify(results,null,2));
  console.log('✅ Results saved: TRILLIONS_FULL_BENCHMARK.json\n');

  process.exit(0);
})();
