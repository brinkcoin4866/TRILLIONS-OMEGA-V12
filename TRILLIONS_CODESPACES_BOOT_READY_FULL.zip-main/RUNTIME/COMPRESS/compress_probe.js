const zlib=require("zlib");

const DATA=Buffer.alloc(1024*1024,"TRILLIONS_OMEGA");

const gz=zlib.gzipSync(DATA);
const br=zlib.brotliCompressSync(DATA);
const df=zlib.deflateSync(DATA);

console.log("");
console.log("=================================================");
console.log(" COMPRESSION FABRIC");
console.log("=================================================");
console.log("RAW MB =>",(DATA.length/1048576).toFixed(2));
console.log("GZIP MB =>",(gz.length/1048576).toFixed(4));
console.log("BROTLI MB =>",(br.length/1048576).toFixed(4));
console.log("DEFLATE MB =>",(df.length/1048576).toFixed(4));
console.log("=================================================");
