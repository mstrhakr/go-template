import { execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

let healthy = false;
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    execFileSync('docker', ['exec', 'smoke', '/server', '-healthcheck'], { stdio: 'pipe' });
    healthy = true;
    break;
  } catch {
    await setTimeout(1000);
  }
}
if (!healthy) throw new Error('Container failed its liveness probe');