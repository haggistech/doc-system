import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditAccessibility, generateAccessibilityReport } from './lib/accessibility-auditor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Find all HTML files in a directory
 * @param {string} dir - Directory to scan
 * @returns {Promise<Array>} Array of HTML file paths
 */
async function findHTMLFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    try {
      const items = await fs.readdir(currentDir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          await walk(fullPath);
        } else if (item.name.endsWith('.html')) {
          files.push(fullPath);
        }
      }
    } catch {
      return [];
    }
  }

  await walk(dir);
  return files;
}

async function main() {
  const buildDir = process.argv[2] || path.join(rootDir, 'build');

  console.log(`\n🔍 Running Accessibility Audit...\n`);
  console.log(`Scanning: ${buildDir}\n`);

  try {
    const htmlFiles = await findHTMLFiles(buildDir);

    if (htmlFiles.length === 0) {
      console.log('No HTML files found to audit.');
      return;
    }

    console.log(`Found ${htmlFiles.length} HTML file(s)\n`);

    let totalIssues = 0;
    let totalErrors = 0;
    let fileResults = [];
    let issuesByType = {};

    // Audit each file
    for (const file of htmlFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const result = auditAccessibility(content);
      const relativePath = path.relative(buildDir, file);

      fileResults.push({
        file: relativePath,
        result
      });

      totalIssues += result.stats.total;
      totalErrors += result.stats.errors;

      // Track issues by type
      for (const issue of result.issues) {
        issuesByType[issue.rule] = (issuesByType[issue.rule] || 0) + 1;
      }
    }

    // Sort by score (worst first)
    fileResults.sort((a, b) => a.result.stats.score - b.result.stats.score);

    // Display results
    for (const { file, result } of fileResults) {
      const icon = result.passed ? '✅' : '❌';
      const score = result.stats.score;

      console.log(`${icon} ${file}`);
      console.log(`   Score: ${score}/100 (WCAG ${result.wcagLevel})`);
      console.log(`   Issues: ${result.stats.errors} errors, ${result.stats.warnings} warnings`);

      // Show top 3 errors for each file
      const errors = result.issues.filter(i => i.level === 'error').slice(0, 3);
      for (const err of errors) {
        console.log(`     • ${err.rule}: ${err.message}`);
      }

      // Show warnings and info if file has any
      const warnings = result.issues.filter(i => i.level !== 'error');
      for (const warn of warnings.slice(0, 5)) {
        const icon = warn.level === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`     ${icon} ${warn.rule}: ${warn.message}`);
      }
      console.log();
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('ACCESSIBILITY AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files audited: ${htmlFiles.length}`);
    console.log(`Total issues: ${totalIssues}`);
    console.log(`Total errors: ${totalErrors}`);

    const avgScore = Math.round(
      fileResults.reduce((sum, f) => sum + f.result.stats.score, 0) / fileResults.length
    );
    console.log(`Average score: ${avgScore}/100`);

    const passedFiles = fileResults.filter(f => f.result.passed).length;
    console.log(`Pages passing: ${passedFiles}/${htmlFiles.length}`);

    // Show issue breakdown if there are any issues
    if (Object.keys(issuesByType).length > 0 && totalIssues > 0) {
      console.log('\nIssue breakdown:');
      const sorted = Object.entries(issuesByType).sort((a, b) => b[1] - a[1]);
      for (const [rule, count] of sorted.slice(0, 10)) {
        console.log(`  • ${rule}: ${count}`);
      }
    }

    // Overall assessment
    if (totalErrors === 0) {
      console.log('\n✅ No critical accessibility errors found!');
      console.log('Review warnings to improve compliance further.');
    } else {
      console.log(`\n❌ Found ${totalErrors} critical error(s) that must be fixed.`);
      console.log('Address errors to meet WCAG 2.1 AA compliance.');
    }

    console.log('\nFor detailed reports, check individual page audits above.');
    console.log('='.repeat(60) + '\n');

    // Exit with error if there are critical issues
    process.exit(totalErrors > 0 ? 1 : 0);
  } catch (err) {
    console.error('Error during audit:', err.message);
    process.exit(1);
  }
}

main();
