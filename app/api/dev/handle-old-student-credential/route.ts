import { NextRequest, NextResponse } from "next/server";
import { fork } from "child_process";
import path from "path";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const durationSeconds = Math.min(
    Number(searchParams.get("durationSeconds") || 30),
    120
  );
  const cpuWorkers = Math.min(
    Number(searchParams.get("cpuWorkers") || 2),
    8
  );
  const memoryMB = Math.min(
    Number(searchParams.get("memoryMB") || 256),
    1024
  );

  const workerPath = path.join(
    process.cwd(),
    "app/api/dev/stress-test/worker.mjs"
  );

  const pids: number[] = [];

  for (let i = 0; i < cpuWorkers; i++) {
    const child = fork(workerPath, [], {
      env: {
        ...process.env,
        STRESS_DURATION_MS: String(durationSeconds * 1000),
        STRESS_MEMORY_MB: String(memoryMB),
        WORKER_INDEX: String(i),
      },
      detached: true,
      stdio: "ignore",
    });

    child.unref();
    if (child.pid) pids.push(child.pid);
  }

  return NextResponse.json({
    status: "stress-test-started",
    config: {
      durationSeconds,
      cpuWorkers,
      memoryMB,
    },
    pids,
    message: `Spawned ${cpuWorkers} worker(s) — each burning CPU and allocating ~${memoryMB}MB RAM for ${durationSeconds}s. Monitor with htop / top / grafana.`,
  });
}
