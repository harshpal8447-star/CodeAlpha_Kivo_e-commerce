import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m[kivo:stop]\x1b[0m Stopping Kivo PostgreSQL Docker container...');

try {
  execSync('docker compose down', { cwd: rootDir, stdio: 'inherit' });
  console.log('\x1b[32m[kivo:stop] ✔ PostgreSQL container stopped and cleaned up.\x1b[0m');
} catch (err) {
  console.log('\x1b[33m[kivo:stop] ⚠ Docker Compose down encountered notice:\x1b[0m', err.message);
}
