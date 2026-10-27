import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[kivo:orchestrator]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[kivo:orchestrator] ✔${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[kivo:orchestrator] ⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[kivo:orchestrator] ✖${colors.reset} ${msg}`),
};

// Ensure .env exists
function ensureEnvFile() {
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    log.info('Creating .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    log.success('.env initialized with default development values.');
  }

  // Also ensure server/.env exists
  const serverEnvPath = path.join(rootDir, 'server', '.env');
  if (!fs.existsSync(serverEnvPath) && fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, serverEnvPath);
  }
}

// Check Docker availability and daemon state
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch {
    return { installed: false, running: false };
  }

  try {
    execSync('docker info', { stdio: 'ignore' });
    return { installed: true, running: true };
  } catch {
    return { installed: true, running: false };
  }
}

// Start PostgreSQL via Docker Compose
async function startPostgres() {
  log.info('Starting PostgreSQL container via Docker Compose...');
  try {
    execSync('docker compose up -d postgres', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    throw new Error(`Failed to start Docker Compose: ${err.message}`);
  }

  log.info('Waiting for PostgreSQL healthcheck (pg_isready)...');
  const maxAttempts = 30; // 30 attempts * 1.5s = 45s timeout
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const inspect = execSync(
        'docker inspect --format="{{json .State.Health.Status}}" kivo-postgres',
        { cwd: rootDir, encoding: 'utf8' }
      ).trim();

      const status = inspect.replace(/^"|"$/g, '');
      if (status === 'healthy') {
        log.success('PostgreSQL container is healthy and ready for connections on port 5432.');
        return;
      }
    } catch {
      // Container starting up, wait
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  throw new Error('PostgreSQL container healthcheck timed out after 45 seconds.');
}

// Run Prisma migrations and seed if needed
function initializeDatabase() {
  log.info('Applying Prisma schema migrations to PostgreSQL...');
  try {
    execSync('npx prisma migrate deploy', { cwd: rootDir, stdio: 'inherit' });
    log.success('Prisma migrations applied cleanly.');
  } catch (err) {
    log.error('Migration failed. Stopping startup.');
    throw err;
  }
}

// Spawn child process with tagged output
function spawnService(name, command, args, color) {
  const isWindows = process.platform === 'win32';
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  const prefix = `${color}[${name}]${colors.reset} `;

  const pipeOutput = (stream) => {
    stream.on('data', (data) => {
      const lines = data.toString().split(/\r?\n/);
      lines.forEach((line) => {
        if (line.trim().length > 0) {
          console.log(`${prefix}${line}`);
        }
      });
    });
  };

  pipeOutput(child.stdout);
  pipeOutput(child.stderr);

  return child;
}

async function main() {
  console.log(`
  ${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}
  ${colors.bold}  🚀 KIVO ONE-COMMAND DEVELOPMENT ORCHESTRATOR${colors.reset}
  ${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}
  `);

  ensureEnvFile();

  const dockerStatus = checkDocker();

  if (!dockerStatus.installed) {
    console.log(`
  ${colors.red}${colors.bold}✖ DOCKER IS NOT DETECTED ON YOUR SYSTEM${colors.reset}
  
  Kivo requires Docker Desktop on Windows to launch the PostgreSQL database.
  
  ${colors.bold}One-Time Setup Instructions:${colors.reset}
  1. Download Docker Desktop for Windows:
     ${colors.cyan}https://www.docker.com/products/docker-desktop${colors.reset}
  2. Complete installation and launch Docker Desktop.
  3. Ensure the bottom-left whale icon shows "Engine running".
  4. Run again: ${colors.bold}npm run dev${colors.reset}
  
  ${colors.dim}(To stop development at any time, run: npm run dev:stop)${colors.reset}
    `);
    process.exit(1);
  }

  if (!dockerStatus.running) {
    console.log(`
  ${colors.yellow}${colors.bold}⚠ DOCKER DESKTOP IS INSTALLED BUT NOT CURRENTLY RUNNING${colors.reset}
  
  Please start the Docker Desktop application from your Windows Start Menu.
  Once Docker Desktop displays "Engine running", re-run:
    ${colors.bold}npm run dev${colors.reset}
    `);
    process.exit(1);
  }

  // 1. Start PostgreSQL & Wait for Health
  await startPostgres();

  // 2. Initialize Database & Run Migrations
  initializeDatabase();

  // 3. Launch Frontend and Backend Concurrently
  log.info('Launching Express backend and Vite frontend development servers...');

  const backend = spawnService('api', 'npm', ['run', 'dev', '--prefix', 'server'], colors.cyan);
  const frontend = spawnService('client', 'npm', ['run', 'dev', '--prefix', 'client'], colors.magenta);

  const cleanup = () => {
    log.info('Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    log.info('To also shut down the PostgreSQL container, run: npm run dev:stop');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  backend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log.error(`Backend process exited with code ${code}. Terminating frontend.`);
      frontend.kill('SIGINT');
      process.exit(code);
    }
  });

  frontend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log.error(`Frontend process exited with code ${code}. Terminating backend.`);
      backend.kill('SIGINT');
      process.exit(code);
    }
  });
}

main().catch((err) => {
  log.error(`Orchestrator failed: ${err.message}`);
  process.exit(1);
});
