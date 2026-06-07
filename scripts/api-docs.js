import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAPIDocsFromFiles } from './lib/api-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Recursively find all source files matching patterns
 * @param {string} dir - Directory to search
 * @param {Array} patterns - File patterns to match (e.g., ['*.js', '*.ts'])
 * @returns {Promise<Array>} Array of matching file paths
 */
async function findSourceFiles(dir, patterns = ['*.js', '*.ts']) {
  const files = [];

  async function walk(currentDir) {
    try {
      const items = await fs.readdir(currentDir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);

        // Skip node_modules and hidden directories
        if (item.isDirectory()) {
          if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'build') {
            await walk(fullPath);
          }
        } else {
          for (const pattern of patterns) {
            if (item.name.match(new RegExp(pattern.replace('*', '.*')))) {
              files.push(fullPath);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }

  await walk(dir);
  return files;
}

async function main() {
  const srcDir = process.argv[2] || path.join(rootDir, 'src');
  const outputDir = process.argv[3] || path.join(rootDir, 'docs', 'api');

  console.log(`Scanning for source files in: ${srcDir}`);
  console.log(`Output directory: ${outputDir}\n`);

  try {
    const sourceFiles = await findSourceFiles(srcDir);

    if (sourceFiles.length === 0) {
      console.log(`No source files found in ${srcDir}`);
      return;
    }

    console.log(`Found ${sourceFiles.length} source file(s):\n`);
    sourceFiles.forEach(f => console.log(`  - ${path.relative(rootDir, f)}`));
    console.log();

    const generated = await generateAPIDocsFromFiles(sourceFiles, outputDir);

    if (generated.length === 0) {
      console.log('No JSDoc comments found in source files.');
      return;
    }

    console.log(`\n✓ Generated ${generated.length} API documentation file(s)`);
    console.log(`\nAPI docs have been generated in: ${path.relative(rootDir, outputDir)}`);
    console.log('These markdown files will be automatically included in your documentation build.');
  } catch (err) {
    console.error('Error generating API docs:', err);
    process.exit(1);
  }
}

main();
