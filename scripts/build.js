import fs from 'fs/promises';
import path from 'path';
import fm from 'front-matter';
import { fileURLToPath } from 'url';

// Import modular components
import { processMarkdown } from './lib/markdown-processor.js';
import { validateInternalLinks } from './lib/link-validator.js';
import { processImages } from './lib/image-processor.js';
import { generateSidebarFromFiles } from './lib/navigation-builder.js';
import { generatePage } from './lib/page-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load configuration
const config = JSON.parse(await fs.readFile(path.join(rootDir, 'config.json'), 'utf-8'));

// Create output directory
const outputDir = path.join(rootDir, config.outputDir);
await fs.mkdir(outputDir, { recursive: true });

/**
 * Read all markdown files from docs directory recursively
 * @param {string} dir - Directory to scan
 * @returns {Promise<Array>} Array of file paths
 */
async function getMarkdownFiles(dir) {
  const files = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...await getMarkdownFiles(fullPath));
      } else if (item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Directory doesn't exist
    return [];
  }

  return files;
}

/**
 * Copy theme assets to output directory
 * @param {string} rootDir - Root project directory
 * @param {string} outputDir - Output directory
 * @param {Object} config - Site configuration
 */
async function copyAssets(rootDir, outputDir, config) {
  // Copy CSS
  const cssSource = path.join(rootDir, 'theme', 'styles.css');
  const cssTarget = path.join(outputDir, 'styles.css');
  await fs.copyFile(cssSource, cssTarget);

  // Copy highlight.js CSS
  const highlightCssSource = path.join(rootDir, 'node_modules', 'highlight.js', 'styles', 'github-dark.css');
  const highlightCssTarget = path.join(outputDir, 'highlight.css');
  await fs.copyFile(highlightCssSource, highlightCssTarget);

  // Copy Fuse.js for fuzzy search
  const fuseSource = path.join(rootDir, 'node_modules', 'fuse.js', 'dist', 'fuse.basic.min.js');
  const fuseTarget = path.join(outputDir, 'fuse.min.js');
  await fs.copyFile(fuseSource, fuseTarget);

  // Copy JavaScript files
  const jsFiles = ['search.js', 'copy-code.js', 'toc.js', 'dark-mode.js', 'line-numbers.js', 'tabs.js'];
  for (const jsFile of jsFiles) {
    const source = path.join(rootDir, 'theme', jsFile);
    const target = path.join(outputDir, jsFile);
    await fs.copyFile(source, target);
  }

  // Generate search config file
  const searchConfig = {
    maxResults: config.search?.maxResults || 10,
    fuzzyThreshold: config.search?.fuzzyThreshold || 0.3,
    minMatchLength: config.search?.minMatchLength || 2,
    baseUrl: config.baseUrl
  };
  await fs.writeFile(
    path.join(outputDir, 'search-config.json'),
    JSON.stringify(searchConfig, null, 2)
  );
}

/**
 * Generate search index from documents
 * @param {Array} docs - Array of document objects
 * @returns {Promise<Array>} Search index entries
 */
async function generateSearchIndex(docs) {
  return Promise.all(docs.map(async doc => {
    // Read the original markdown content for full-text search
    const content = await fs.readFile(doc.filePath, 'utf-8');
    const { body } = fm(content);

    // Strip markdown formatting for cleaner search
    const plainText = body
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/[*_~]/g, '') // Remove emphasis markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return {
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      content: plainText
    };
  }));
}

/**
 * Main build function
 */
async function build() {
  console.log('Building documentation site...');

  // Get all markdown files
  const docsDir = path.join(rootDir, config.docsDir);
  const markdownFiles = await getMarkdownFiles(docsDir);

  if (markdownFiles.length === 0) {
    console.log(`No markdown files found in ${docsDir}`);
    return;
  }

  // Process all markdown files
  const docs = [];
  for (const file of markdownFiles) {
    const doc = await processMarkdown(file, docsDir, rootDir);
    docs.push(doc);
  }

  // Validate internal links
  console.log('Validating internal links...');
  let allBrokenLinks = [];
  for (const file of markdownFiles) {
    const brokenLinks = await validateInternalLinks(file, docsDir, markdownFiles);
    allBrokenLinks.push(...brokenLinks);
  }

  if (allBrokenLinks.length > 0) {
    console.warn('\n⚠️  Warning: Found broken internal links:');
    for (const broken of allBrokenLinks) {
      console.warn(`  - ${broken.file}: "${broken.text}" -> ${broken.link}`);
    }
    console.warn(`\nTotal broken links: ${allBrokenLinks.length}\n`);
  } else {
    console.log('✓ All internal links are valid');
  }

  // Generate sidebar from file structure
  const sidebar = generateSidebarFromFiles(docs, docsDir);
  console.log('✓ Generated sidebar from folder structure');

  // Create docs output directory
  const docsOutputDir = path.join(outputDir, 'docs');
  await fs.mkdir(docsOutputDir, { recursive: true });

  // Generate HTML for each doc
  for (const doc of docs) {
    const html = generatePage(doc, docs, sidebar, config);
    const outputFilePath = path.join(docsOutputDir, `${doc.slug}.html`);

    // Create subdirectories if needed
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, html);
  }

  console.log(`✓ Built ${docs.length} pages`);

  // Copy theme assets
  await copyAssets(rootDir, outputDir, config);

  // Process and copy images
  console.log('\nProcessing images...');
  const { copiedImages, brokenImages } = await processImages(docs, docsDir, outputDir);

  if (copiedImages.length > 0) {
    console.log(`✓ Copied ${copiedImages.length} images`);
  }

  if (brokenImages.length > 0) {
    console.log('\n⚠ Broken image references found:');
    for (const broken of brokenImages) {
      console.log(`  - ${broken.file}: ${broken.image}`);
    }
  }

  // Generate search index
  const searchIndex = await generateSearchIndex(docs);
  await fs.writeFile(
    path.join(outputDir, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );

  // Create index.html that redirects to first doc
  if (docs.length > 0 && sidebar.length > 0) {
    const firstDoc = sidebar[0].items[0];
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${config.baseUrl}docs/${firstDoc}.html">
</head>
<body>
  <p>Redirecting to <a href="${config.baseUrl}docs/${firstDoc}.html">documentation</a>...</p>
</body>
</html>`;
    await fs.writeFile(path.join(outputDir, 'index.html'), indexHtml);
  }

  console.log(`✓ Build complete!`);
  console.log(`✓ Output directory: ${outputDir}`);
}

build().catch(console.error);
