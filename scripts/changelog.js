import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGitTags, generateChangelog } from './lib/changelog-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function main() {
  const outputPath = process.argv[2] || path.join(rootDir, 'docs', 'CHANGELOG.md');

  console.log('Generating changelog from git history...\n');

  const tags = getGitTags(rootDir);

  if (tags.length === 0) {
    console.log('No git tags found. Create tags to generate a changelog:');
    console.log('  git tag v1.0.0');
    console.log('  git tag v1.1.0');
    return;
  }

  console.log(`Found ${tags.length} tag(s):\n`);
  tags.forEach(t => console.log(`  - ${t.tag} (${t.date})`));
  console.log();

  const changelog = generateChangelog(tags, rootDir);

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, changelog);

  console.log(`✓ Changelog generated: ${path.relative(rootDir, outputPath)}`);
  console.log(`  Contains ${tags.length} release(s)`);
}

main().catch(err => {
  console.error('Error generating changelog:', err.message);
  process.exit(1);
});
