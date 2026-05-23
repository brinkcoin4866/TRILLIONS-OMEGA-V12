const fs=require("fs");

try{
 const txt=fs.readFileSync("/proc/cpuinfo","utf8");
 const flags=(txt.match(/^flags\s*:\s*(.*)$/m)||[])[1]||"";

 console.log("");
 console.log("=================================================");
 console.log(" SIMD FLAGS");
 console.log("=================================================");
 console.log("AVX  =>",flags.includes("avx"));
 console.log("AVX2 =>",flags.includes("avx2"));
 console.log("AES  =>",flags.includes("aes"));
 console.log("FMA  =>",flags.includes("fma"));
 console.log("SSE4 =>",flags.includes("sse4_2"));
 console.log("=================================================");
}catch(e){
 console.log(e.message);
}
