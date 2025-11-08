import { spawn } from 'child_process';
import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('Starting development server...');

// Initial build
function runBuild() {
  console.log('\nRebuilding...');
  const build = spawn('node', ['scripts/build.js'], {
    cwd: rootDir,
    stdio: 'inherit'
  });

  build.on('close', (code) => {
    if (code === 0) {
      console.log('Build completed successfully');
    } else {
      console.error(`Build failed with code ${code}`);
    }
  });
}

// Run initial build
runBuild();

// Start the server
const server = spawn('node', ['scripts/serve.js'], {
  cwd: rootDir,
  stdio: 'inherit'
});

// Watch for changes
const watcher = chokidar.watch([
  path.join(rootDir, 'docs/**/*.md'),
  path.join(rootDir, 'theme/**/*'),
  path.join(rootDir, 'config.json')
], {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

let buildTimeout;
watcher.on('change', (filePath) => {
  console.log(`\nFile changed: ${path.relative(rootDir, filePath)}`);

  // Debounce builds
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(runBuild, 300);
});

console.log('\nWatching for changes...');
console.log('Press Ctrl+C to stop\n');

// Handle exit
process.on('SIGINT', () => {
  console.log('\nStopping development server...');
  watcher.close();
  server.kill();
  process.exit(0);
});
