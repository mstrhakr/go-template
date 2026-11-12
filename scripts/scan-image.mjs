import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'go-template-scan-'));
try {
  execFileSync('docker', ['save', '-o', join(directory, 'image.tar'), process.argv[2] ?? 'go-template:ci'], { stdio: 'inherit' });
  execFileSync('docker', [
    'run', '--rm', '-i', '--read-only', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--tmpfs', '/tmp:rw,nosuid,nodev',
    '--env', 'TRIVY_CACHE_DIR=/tmp/trivy',
    '--entrypoint', '/bin/sh',
    'aquasec/trivy:0.76.2@sha256:6fa071ef8daa2e58b90cbf1710bedca91adbb3bf98693533226f442035b836a6',
    '-c', 'cat > /tmp/image.tar && exec trivy image --input /tmp/image.tar --scanners vuln --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL --timeout 10m --no-progress',
  ], { input: readFileSync(join(directory, 'image.tar')), stdio: ['pipe', 'inherit', 'inherit'] });
} finally {
  rmSync(directory, { recursive: true, force: true });
}