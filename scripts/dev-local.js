import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
  info: (msg) => console.log(`${colors.cyan}[kivo:local]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[kivo:local] ✔${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[kivo:local] ⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[kivo:local] ✖${colors.reset} ${msg}`),
};

function prepareSqliteDatabase() {
  const sqliteSchema = path.join(rootDir, 'prisma', 'schema.sqlite.prisma');
  const activeSchema = path.join(rootDir, 'prisma', 'schema.prisma');
  const dbFile = path.join(rootDir, 'prisma', 'dev.db');

  log.info('Configuring local database (zero-Docker mode)...');

  // Copy SQLite schema as active schema
  if (fs.existsSync(sqliteSchema)) {
    fs.copyFileSync(sqliteSchema, activeSchema);
  }

  // Update .env DATABASE_URL
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('DATABASE_URL="file:./dev.db"')) {
      envContent = envContent.replace(
        /DATABASE_URL=.*/g,
        'DATABASE_URL="file:./dev.db"'
      );
      fs.writeFileSync(envPath, envContent);
    }
  }

  // Generate Prisma client only if not present or provider changed
  const clientPath = path.join(rootDir, 'node_modules', '.prisma', 'client');
  if (!fs.existsSync(clientPath)) {
    log.info('Generating Prisma Client for local database...');
    try {
      execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });
    } catch (err) {
      log.error('Prisma generate failed: ' + err.message);
    }
  } else {
    log.success('Prisma Client already generated.');
  }

  // If dev.db doesn't exist, push and seed
  if (!fs.existsSync(dbFile)) {
    log.info('Initializing and seeding new local database...');
    try {
      execSync('npx prisma db push', { cwd: rootDir, stdio: 'inherit' });
      execSync('node prisma/seed.js', { cwd: rootDir, stdio: 'inherit' });
      log.success('Local database seeded with products, categories, and accounts.');
    } catch (err) {
      log.error('Database setup failed: ' + err.message);
    }
  } else {
    log.success('Existing local database (dev.db) ready.');
  }
}

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
  ${colors.bold}  🚀 KIVO LOCAL DEVELOPMENT (ZERO-DOCKER MODE)${colors.reset}
  ${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}
  `);

  prepareSqliteDatabase();

  log.info('Launching Express backend and Vite frontend development servers...');

  const backend = spawnService('api', 'npm', ['run', 'dev', '--prefix', 'server'], colors.cyan);
  const frontend = spawnService('client', 'npm', ['run', 'dev', '--prefix', 'client'], colors.magenta);

  const cleanup = () => {
    log.info('Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
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
  log.error(`Local dev failed: ${err.message}`);
  process.exit(1);
});
