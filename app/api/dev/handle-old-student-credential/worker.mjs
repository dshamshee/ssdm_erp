

const DURATION_MS = Number(process.env.STRESS_DURATION_MS || 30000);
const MEMORY_MB = Number(process.env.STRESS_MEMORY_MB || 256);
const WORKER_INDEX = process.env.WORKER_INDEX || "0";

console.log(
  `[Worker ${WORKER_INDEX}] Starting — CPU burn + ${MEMORY_MB}MB RAM for ${DURATION_MS}ms`
);


const buffers = [];
const chunkSize = 64; 
const totalChunks = Math.ceil(MEMORY_MB / chunkSize);

for (let i = 0; i < totalChunks; i++) {
  const sizeBytes = Math.min(chunkSize, MEMORY_MB - i * chunkSize) * 1024 * 1024;
  const buf = Buffer.alloc(sizeBytes);

  
  for (let j = 0; j < buf.length; j += 4096) {
    buf[j] = Math.floor(Math.random() * 256);
  }

  buffers.push(buf);
}

console.log(
  `[Worker ${WORKER_INDEX}] Allocated ~${MEMORY_MB}MB across ${totalChunks} chunk(s)`
);

const MATRIX_SIZE = 150; 

function createMatrix(size) {
  const m = new Array(size);
  for (let i = 0; i < size; i++) {
    m[i] = new Float64Array(size);
    for (let j = 0; j < size; j++) {
      m[i][j] = Math.random();
    }
  }
  return m;
}

function multiplyMatrices(a, b, size) {
  const result = new Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = new Float64Array(size);
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

const matA = createMatrix(MATRIX_SIZE);
const matB = createMatrix(MATRIX_SIZE);

const startTime = Date.now();
let iterations = 0;

while (Date.now() - startTime < DURATION_MS) {
  multiplyMatrices(matA, matB, MATRIX_SIZE);
  iterations++;

  for (const buf of buffers) {
    const idx = Math.floor(Math.random() * (buf.length - 1));
    buf[idx] = buf[idx] ^ 0xff;
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(
  `[Worker ${WORKER_INDEX}] Done — ${iterations} matrix multiplications in ${elapsed}s`
);

buffers.length = 0;

process.exit(0);
