import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Get version from command line argument
const version = process.argv[2];

if (!version) {
  console.error('Error: Please provide a version number');
  console.log('Usage: npm run version <version-number>');
  console.log('Example: npm run version 1.0.0');
  process.exit(1);
}

// Validate version format (simple semver check)
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Error: Version must be in semver format (e.g., 1.0.0)');
  process.exit(1);
}

async function createVersion() {
  console.log(`Creating version ${version}...`);

  // Load config
  const configPath = path.join(rootDir, 'config.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

  // Check if version already exists
  if (config.versions && config.versions.available.includes(version)) {
    console.error(`Error: Version ${version} already exists`);
    process.exit(1);
  }

  // Create versioned_docs directory if it doesn't exist
  const versionsDir = path.join(rootDir, config.versionsDir || 'versioned_docs');
  await fs.mkdir(versionsDir, { recursive: true });

  // Create version-specific directory
  const versionDir = path.join(versionsDir, `version-${version}`);
  await fs.mkdir(versionDir, { recursive: true });

  // Copy current docs to versioned directory
  const docsDir = path.join(rootDir, config.docsDir);
  await copyDirectory(docsDir, versionDir);

  // Create versioned sidebar
  const versionedSidebarsDir = path.join(rootDir, 'versioned_sidebars');
  await fs.mkdir(versionedSidebarsDir, { recursive: true });

  const sidebarPath = path.join(versionedSidebarsDir, `version-${version}-sidebars.json`);
  await fs.writeFile(
    sidebarPath,
    JSON.stringify(config.sidebar, null, 2)
  );

  // Update config.json
  if (!config.versions) {
    config.versions = {
      current: version,
      latest: version,
      available: [version]
    };
  } else {
    // Add new version to the beginning of available versions
    config.versions.available.unshift(version);
    config.versions.latest = version;
  }

  if (!config.versionsDir) {
    config.versionsDir = 'versioned_docs';
  }

  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  console.log(`✓ Version ${version} created successfully!`);
  console.log(`✓ Docs copied to: ${versionDir}`);
  console.log(`✓ Sidebar saved to: ${sidebarPath}`);
  console.log(`✓ Config updated`);
  console.log('\nNext steps:');
  console.log('1. Continue editing docs/ for the next version');
  console.log('2. Run "npm run build" to build all versions');
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

createVersion().catch(console.error);
