import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import fm from 'front-matter';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configure marked with syntax highlighting and language labels
marked.use({
  renderer: {
    code(code, infostring) {
      const lang = infostring || 'plaintext';
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(code, { language }).value;

      // Format language name for display (capitalize first letter)
      const displayLang = lang.charAt(0).toUpperCase() + lang.slice(1);

      return `<div class="code-block-container">
  <div class="code-block-header">
    <span class="code-block-language">${displayLang}</span>
  </div>
  <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
</div>`;
    }
  }
});

// Configure marked with admonitions extension
marked.use({
  extensions: [{
    name: 'admonition',
    level: 'block',
    start(src) {
      return src.match(/^:::/)?.index;
    },
    tokenizer(src) {
      const rule = /^:::(note|tip|info|warning|danger|caution)(?: +(.+?))?\n([\s\S]*?)\n:::/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'admonition',
          raw: match[0],
          admonitionType: match[1],
          title: match[2]?.trim() || null,
          text: match[3].trim()
        };
      }
    },
    renderer(token) {
      const types = {
        note: { icon: 'ℹ️', label: 'Note' },
        tip: { icon: '💡', label: 'Tip' },
        info: { icon: 'ℹ️', label: 'Info' },
        warning: { icon: '⚠️', label: 'Warning' },
        danger: { icon: '🚫', label: 'Danger' },
        caution: { icon: '⚠️', label: 'Caution' }
      };

      const config = types[token.admonitionType] || types.note;
      const title = token.title || config.label;
      const content = marked.parse(token.text);

      return `<div class="admonition admonition-${token.admonitionType}">
        <div class="admonition-heading">
          <span class="admonition-icon">${config.icon}</span>
          <span class="admonition-title">${title}</span>
        </div>
        <div class="admonition-content">
          ${content}
        </div>
      </div>`;
    }
  }]
});

// Load configuration
const config = JSON.parse(await fs.readFile(path.join(rootDir, 'config.json'), 'utf-8'));

// Create output directory
const outputDir = path.join(rootDir, config.outputDir);
await fs.mkdir(outputDir, { recursive: true });

// Read all markdown files from docs directory
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

// Get Git metadata for a file
function getGitMetadata(filePath) {
  try {
    // Get last updated info (most recent commit)
    const lastCommit = execSync(
      `git log -1 --format="%at|%an|%ae" "${filePath}"`,
      { encoding: 'utf-8', cwd: rootDir, shell: '/bin/bash' }
    ).trim();

    // Get creation info (first commit)
    const firstCommit = execSync(
      `git log --diff-filter=A --follow --format="%at|%an|%ae" -- "${filePath}"`,
      { encoding: 'utf-8', cwd: rootDir, shell: '/bin/bash' }
    ).trim().split('\n').pop(); // Get last line (oldest commit)

    if (!lastCommit) {
      return null;
    }

    const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const [lastTimestamp, lastAuthor, lastEmail] = lastCommit.split('|');
    const lastUpdated = formatDate(lastTimestamp);

    let created = null;
    let createdBy = null;

    if (firstCommit) {
      const [firstTimestamp, firstAuthor] = firstCommit.split('|');
      created = formatDate(firstTimestamp);
      createdBy = firstAuthor;
    }

    return {
      lastUpdated,
      lastUpdatedBy: lastAuthor,
      created,
      createdBy
    };
  } catch (err) {
    // Not a git repo or file not tracked
    return null;
  }
}

// Extract internal links from markdown content
function extractInternalLinks(content) {
  const links = [];
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only capture relative links (internal links)
    // Ignore external URLs, anchors, and absolute paths starting with http/https
    if (!url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('#') &&
        !url.startsWith('mailto:')) {
      links.push({
        text: match[1],
        url: url,
        position: match.index
      });
    }
  }

  return links;
}

// Validate internal links in a markdown file
async function validateInternalLinks(filePath, baseDir, allFiles) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { body } = fm(content);
  const links = extractInternalLinks(body);
  const brokenLinks = [];

  for (const link of links) {
    // Resolve the link relative to the current file
    const fileDir = path.dirname(filePath);
    let targetPath = path.resolve(fileDir, link.url);

    // Normalize path for cross-platform compatibility
    targetPath = targetPath.replace(/\\/g, '/');

    // Check if target file exists in our markdown files list
    const exists = allFiles.some(file => {
      const normalizedFile = file.replace(/\\/g, '/');
      return normalizedFile === targetPath;
    });

    if (!exists) {
      brokenLinks.push({
        file: path.relative(baseDir, filePath),
        link: link.url,
        text: link.text
      });
    }
  }

  return brokenLinks;
}

// Process markdown file
async function processMarkdown(filePath, baseDir) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { attributes, body } = fm(content);
  const html = marked(body);

  const relativePath = path.relative(baseDir, filePath);
  const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

  // Get Git metadata
  const gitMetadata = getGitMetadata(filePath);

  return {
    slug,
    title: attributes.title || slug,
    description: attributes.description || '',
    html,
    attributes,
    filePath, // Add filePath for link validation
    metadata: {
      author: attributes.author || null,
      created: gitMetadata?.created || null,
      createdBy: gitMetadata?.createdBy || null,
      lastUpdated: gitMetadata?.lastUpdated || null,
      lastUpdatedBy: gitMetadata?.lastUpdatedBy || null
    }
  };
}

// Generate HTML page
function generatePage(doc, allDocs, sidebar) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} | ${config.title}</title>
  <meta name="description" content="${doc.description || config.description}">
  <link rel="stylesheet" href="${config.baseUrl}styles.css">
  <link rel="stylesheet" href="${config.baseUrl}highlight.css">
</head>
<body>
  <nav class="navbar">
    <div class="navbar-inner">
      <button class="mobile-sidebar-toggle" aria-label="Toggle sidebar">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <a href="${config.baseUrl}" class="navbar-brand">${config.navbar.title}</a>
      <div class="search-container">
        <input type="text" id="search-input" class="search-input" placeholder="Search docs..." autocomplete="off">
        <div id="search-results" class="search-results"></div>
      </div>
      <div class="navbar-links">
        ${config.navbar.links.map(link => {
          if (link.href) {
            return `<a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.label}</a>`;
          }
          return `<a href="${config.baseUrl}${link.to.replace(/^\//, '')}.html">${link.label}</a>`;
        }).join('')}
      </div>
    </div>
  </nav>

  <div class="container">
    <aside class="sidebar">
      ${generateSidebar(sidebar, doc.slug, allDocs)}
    </aside>

    <main class="content">
      ${generateBreadcrumbs(sidebar, doc.slug, doc)}
      ${generateMetadataTable(doc.metadata)}
      <article>
        ${doc.html}
      </article>

      <div class="pagination">
        ${generatePagination(doc, allDocs, sidebar)}
      </div>
    </main>
  </div>

  <footer class="footer">
    <p>${config.footer.copyright}</p>
  </footer>

  <script src="${config.baseUrl}search.js"></script>
  <script src="${config.baseUrl}copy-code.js"></script>
  <script>
    // Mobile sidebar toggle
    document.addEventListener('DOMContentLoaded', function() {
      const sidebarToggle = document.querySelector('.mobile-sidebar-toggle');
      const sidebar = document.querySelector('.sidebar');
      const body = document.body;

      if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
          sidebar.classList.toggle('open');
          body.classList.toggle('sidebar-open');
          this.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
          if (window.innerWidth <= 996 &&
              !sidebar.contains(e.target) &&
              !sidebarToggle.contains(e.target) &&
              sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            body.classList.remove('sidebar-open');
            sidebarToggle.classList.remove('active');
          }
        });

        // Close sidebar when clicking a link
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(function(link) {
          link.addEventListener('click', function() {
            if (window.innerWidth <= 996) {
              sidebar.classList.remove('open');
              body.classList.remove('sidebar-open');
              sidebarToggle.classList.remove('active');
            }
          });
        });
      }
    });
  </script>
</body>
</html>`;

  return template;
}


// Generate metadata table
function generateMetadataTable(metadata) {
  // Check if we have any metadata to display
  const hasMetadata = metadata.author || metadata.created || metadata.lastUpdated;

  if (!hasMetadata) {
    return '';
  }

  const rows = [];

  if (metadata.author) {
    rows.push(`
      <tr>
        <td class="metadata-label">Author</td>
        <td class="metadata-value">${metadata.author}</td>
      </tr>
    `);
  }

  if (metadata.created) {
    const createdText = metadata.createdBy
      ? `${metadata.created} by ${metadata.createdBy}`
      : metadata.created;
    rows.push(`
      <tr>
        <td class="metadata-label">Created</td>
        <td class="metadata-value">${createdText}</td>
      </tr>
    `);
  }

  if (metadata.lastUpdated) {
    const lastUpdatedText = metadata.lastUpdatedBy
      ? `${metadata.lastUpdated} by ${metadata.lastUpdatedBy}`
      : metadata.lastUpdated;
    rows.push(`
      <tr>
        <td class="metadata-label">Last Updated</td>
        <td class="metadata-value">${lastUpdatedText}</td>
      </tr>
    `);
  }

  return `
    <div class="metadata-table-wrapper">
      <table class="metadata-table">
        ${rows.join('')}
      </table>
    </div>
  `;
}

// Generate breadcrumb navigation
function generateBreadcrumbs(sidebar, currentSlug, currentDoc) {
  const breadcrumbs = [{ label: 'Home', href: config.baseUrl }];

  for (const item of sidebar) {
    if (item.type === 'category') {
      for (const subItem of item.items) {
        if (subItem === currentSlug) {
          breadcrumbs.push({ label: item.label, href: null });
          // Use document title from frontmatter
          breadcrumbs.push({ label: currentDoc.title, href: null });
          break;
        }
      }
    }
  }

  if (breadcrumbs.length === 1) {
    return ''; // No breadcrumbs for home
  }

  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      ${breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        if (isLast) {
          return `<span class="breadcrumb-item active" aria-current="page">${crumb.label}</span>`;
        } else if (crumb.href) {
          return `<a href="${crumb.href}" class="breadcrumb-item">${crumb.label}</a>`;
        } else {
          return `<span class="breadcrumb-item">${crumb.label}</span>`;
        }
      }).join('<span class="breadcrumb-separator">/</span>')}
    </nav>
  `;
}

// Generate sidebar HTML
function generateSidebar(items, currentSlug, allDocs) {
  let html = '<ul class="sidebar-nav">';

  // Create a map of slugs to doc titles for quick lookup
  const docTitleMap = {};
  for (const doc of allDocs) {
    docTitleMap[doc.slug] = doc.title;
  }

  for (const item of items) {
    if (item.type === 'category') {
      // Check if any item in this category is active
      const hasActiveChild = item.items.some(subItem => currentSlug === subItem);

      html += `<li class="sidebar-category ${hasActiveChild ? 'active' : ''}">
        <div class="sidebar-category-label">${item.label}</div>
        <ul class="sidebar-category-items">`;

      for (const subItem of item.items) {
        const isActive = currentSlug === subItem;
        const title = docTitleMap[subItem] || subItem.split('/').pop();
        html += `<li><a href="${config.baseUrl}docs/${subItem}.html" class="${isActive ? 'active' : ''}">${title}</a></li>`;
      }

      html += '</ul></li>';
    }
  }

  html += '</ul>';
  return html;
}

// Generate pagination links
function generatePagination(currentDoc, allDocs, sidebar) {
  const flatDocs = [];
  for (const item of sidebar) {
    if (item.type === 'category') {
      flatDocs.push(...item.items);
    }
  }

  const currentIndex = flatDocs.indexOf(currentDoc.slug);
  let html = '';

  if (currentIndex > 0) {
    const prev = flatDocs[currentIndex - 1];
    html += `<a href="${config.baseUrl}docs/${prev}.html" class="pagination-prev">← Previous</a>`;
  }

  if (currentIndex < flatDocs.length - 1) {
    const next = flatDocs[currentIndex + 1];
    html += `<a href="${config.baseUrl}docs/${next}.html" class="pagination-next">Next →</a>`;
  }

  return html;
}

// Generate sidebar structure from folder/file structure
function generateSidebarFromFiles(docs, docsDir) {
  const sidebar = [];
  const rootDocs = [];
  const categories = {};

  // Organize docs by directory
  for (const doc of docs) {
    const parts = doc.slug.split('/');

    if (parts.length === 1) {
      // Root level document
      rootDocs.push(doc.slug);
    } else {
      // Document in a subdirectory
      const category = parts[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(doc.slug);
    }
  }

  // Add root level docs as a category if they exist
  if (rootDocs.length > 0) {
    sidebar.push({
      type: 'category',
      label: 'Getting Started',
      items: rootDocs.sort()
    });
  }

  // Add each subdirectory as a category
  for (const [categoryName, items] of Object.entries(categories).sort()) {
    // Capitalize and format category name (e.g., 'guides' -> 'Guides')
    const label = categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    sidebar.push({
      type: 'category',
      label,
      items: items.sort()
    });
  }

  return sidebar;
}

// Build the site
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
    const doc = await processMarkdown(file, docsDir);
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
    const html = generatePage(doc, docs, sidebar);
    const outputFilePath = path.join(docsOutputDir, `${doc.slug}.html`);

    // Create subdirectories if needed
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, html);
  }

  console.log(`✓ Built ${docs.length} pages`);

  // Copy CSS
  const cssSource = path.join(rootDir, 'theme', 'styles.css');
  const cssTarget = path.join(outputDir, 'styles.css');
  await fs.copyFile(cssSource, cssTarget);

  // Copy highlight.js CSS
  const highlightCssSource = path.join(rootDir, 'node_modules', 'highlight.js', 'styles', 'github-dark.css');
  const highlightCssTarget = path.join(outputDir, 'highlight.css');
  await fs.copyFile(highlightCssSource, highlightCssTarget);

  // Copy search script
  const searchSource = path.join(rootDir, 'theme', 'search.js');
  const searchTarget = path.join(outputDir, 'search.js');
  await fs.copyFile(searchSource, searchTarget);

  // Copy copy-code script
  const copyCodeSource = path.join(rootDir, 'theme', 'copy-code.js');
  const copyCodeTarget = path.join(outputDir, 'copy-code.js');
  await fs.copyFile(copyCodeSource, copyCodeTarget);

  // Generate search index
  const searchIndex = docs.map(doc => ({
    title: doc.title,
    slug: doc.slug,
    description: doc.description
  }));

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
