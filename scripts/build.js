import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import fm from 'front-matter';
import { fileURLToPath } from 'url';

// Import modular components
import { processMarkdown } from './lib/markdown-processor.js';
import { validateInternalLinks } from './lib/link-validator.js';
import { processImages } from './lib/image-processor.js';
import { generateSidebarFromFiles } from './lib/navigation-builder.js';
import { generatePage, generate404Page } from './lib/page-generator.js';

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
 * Copy theme assets to output directory with content-hash fingerprinting.
 * Returns a manifest mapping original filename → hashed filename.
 * @param {string} rootDir - Root project directory
 * @param {string} outputDir - Output directory
 * @param {Object} config - Site configuration
 * @returns {Promise<Object>} Asset manifest
 */
async function copyAssets(rootDir, outputDir, config) {
  const manifest = {};

  async function copyHashed(src, name) {
    const content = await fs.readFile(src);
    const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    const hashedName = `${base}.${hash}${ext}`;
    await fs.copyFile(src, path.join(outputDir, hashedName));
    manifest[name] = hashedName;
  }

  await copyHashed(path.join(rootDir, 'theme', 'styles.css'), 'styles.css');
  await copyHashed(
    path.join(rootDir, 'node_modules', 'highlight.js', 'styles', 'github-dark.css'),
    'highlight.css'
  );
  await copyHashed(
    path.join(rootDir, 'node_modules', 'fuse.js', 'dist', 'fuse.basic.min.js'),
    'fuse.min.js'
  );

  const jsFiles = ['search.js', 'copy-code.js', 'toc.js', 'dark-mode.js', 'line-numbers.js', 'tabs.js', 'lightbox.js'];
  for (const jsFile of jsFiles) {
    await copyHashed(path.join(rootDir, 'theme', jsFile), jsFile);
  }

  // Search config and index are fetched by name from search.js — not fingerprinted
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

  return manifest;
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

  // Copy theme assets first to get fingerprinted manifest
  const assetManifest = await copyAssets(rootDir, outputDir, config);

  // Create docs output directory
  const docsOutputDir = path.join(outputDir, 'docs');
  await fs.mkdir(docsOutputDir, { recursive: true });

  // Generate HTML for each doc
  for (const doc of docs) {
    const html = generatePage(doc, docs, sidebar, config, assetManifest);
    const outputFilePath = path.join(docsOutputDir, `${doc.slug}.html`);

    // Create subdirectories if needed
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, html);
  }

  console.log(`✓ Built ${docs.length} pages`);

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

  // Generate custom 404 page
  await fs.writeFile(path.join(outputDir, '404.html'), generate404Page(config, assetManifest));
  console.log('✓ Generated 404.html');

  // Generate sitemap.xml
  const siteUrl = (config.siteUrl || '').replace(/\/$/, '');
  const base = (config.baseUrl || '/').replace(/\/$/, '');
  const sitemapUrls = docs.map(doc =>
    `  <url>\n    <loc>${siteUrl}${base}/docs/${doc.slug}.html</loc>\n  </url>`
  );
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>`;
  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemapXml);
  console.log('✓ Generated sitemap.xml');

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
