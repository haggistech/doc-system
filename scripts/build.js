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

      // Parse enhanced syntax: language title="filename" {1,3-5}
      // Examples:
      //   javascript title="config.js"
      //   python {1,3-5}
      //   typescript title="app.ts" {2,4-6}
      let title = null;
      let highlightLines = [];
      let cleanLang = lang;

      // Extract title: title="filename.js"
      const titleMatch = lang.match(/title="([^"]+)"/);
      if (titleMatch) {
        title = titleMatch[1];
        cleanLang = cleanLang.replace(/title="[^"]+"/, '').trim();
      }

      // Extract line highlights: {1,3-5,7}
      const highlightMatch = lang.match(/\{([^}]+)\}/);
      if (highlightMatch) {
        const ranges = highlightMatch[1].split(',');
        ranges.forEach(range => {
          if (range.includes('-')) {
            // Range: 3-5
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              highlightLines.push(i);
            }
          } else {
            // Single line: 1
            highlightLines.push(parseInt(range.trim()));
          }
        });
        cleanLang = cleanLang.replace(/\{[^}]+\}/, '').trim();
      }

      // Get the actual language for highlighting
      const language = hljs.getLanguage(cleanLang) ? cleanLang : 'plaintext';
      const highlighted = hljs.highlight(code, { language }).value;

      // Format language name for display (capitalize first letter)
      const displayLang = cleanLang.charAt(0).toUpperCase() + cleanLang.slice(1);

      // Split code into lines for line highlighting and line numbers
      const lines = highlighted.split('\n');
      const numberedLines = lines.map((line, index) => {
        const lineNum = index + 1;
        const isHighlighted = highlightLines.includes(lineNum);
        const highlightClass = isHighlighted ? ' highlighted-line' : '';
        return `<span class="code-line${highlightClass}" data-line="${lineNum}">${line}</span>`;
      }).join('\n');

      // Build header content
      let headerContent = `<span class="code-block-language">${displayLang}</span>`;
      if (title) {
        headerContent = `<span class="code-block-title">${title}</span>`;
      }

      return `<div class="code-block-container" data-language="${cleanLang}">
  <div class="code-block-header">
    ${headerContent}
    <button class="toggle-line-numbers" aria-label="Toggle line numbers" title="Toggle line numbers">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="4" y1="3" x2="14" y2="3"></line>
        <line x1="4" y1="8" x2="14" y2="8"></line>
        <line x1="4" y1="13" x2="14" y2="13"></line>
        <text x="1" y="5" font-size="6" fill="currentColor">1</text>
        <text x="1" y="10" font-size="6" fill="currentColor">2</text>
        <text x="1" y="15" font-size="6" fill="currentColor">3</text>
      </svg>
    </button>
  </div>
  <pre class="show-line-numbers"><code class="hljs language-${cleanLang}">${numberedLines}</code></pre>
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

// Extract image references from markdown content
function extractImageReferences(content) {
  const images = [];

  // Match markdown image syntax: ![alt](path)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const imagePath = match[2];
    // Only include local images (not URLs)
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      images.push({
        alt: match[1],
        path: imagePath.split('?')[0].split('#')[0] // Remove query params and anchors
      });
    }
  }

  // Also match HTML img tags: <img src="path">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const imagePath = match[1];
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      images.push({
        alt: '',
        path: imagePath.split('?')[0].split('#')[0]
      });
    }
  }

  return images;
}

// Copy images and validate image references
async function processImages(docs, docsDir, outputDir) {
  const imageSet = new Set();
  const brokenImages = [];
  const copiedImages = [];

  // Create images directory in output
  const imagesOutputDir = path.join(outputDir, 'images');
  await fs.mkdir(imagesOutputDir, { recursive: true });

  // Process each document
  for (const doc of docs) {
    const content = await fs.readFile(doc.filePath, 'utf-8');
    const { body } = fm(content);
    const images = extractImageReferences(body);

    for (const image of images) {
      const docDir = path.dirname(doc.filePath);
      let imagePath;

      // Handle absolute paths from docs root (e.g., /images/foo.png)
      if (image.path.startsWith('/')) {
        imagePath = path.join(docsDir, '..', image.path);
      } else {
        // Handle relative paths
        imagePath = path.resolve(docDir, image.path);
      }

      imagePath = imagePath.replace(/\\/g, '/');

      // Check if image exists
      try {
        await fs.access(imagePath);

        // Add to set for copying
        const imageRelativePath = path.relative(path.join(docsDir, '..'), imagePath);
        imageSet.add(JSON.stringify({
          source: imagePath,
          relative: imageRelativePath.replace(/\\/g, '/')
        }));
      } catch (err) {
        // Image doesn't exist
        brokenImages.push({
          file: path.relative(docsDir, doc.filePath),
          image: image.path,
          alt: image.alt
        });
      }
    }
  }

  // Copy all unique images
  for (const imageJson of imageSet) {
    const { source, relative } = JSON.parse(imageJson);
    const targetPath = path.join(outputDir, relative);

    // Create directory if needed
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    try {
      await fs.copyFile(source, targetPath);
      copiedImages.push(relative);
    } catch (err) {
      console.warn(`⚠ Warning: Failed to copy image ${relative}: ${err.message}`);
    }
  }

  return { copiedImages, brokenImages };
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

// Generate Table of Contents from HTML headings
function generateTableOfContents(html) {
  const headings = [];
  const headingRegex = /<h([2-3])[^>]*>(.+?)<\/h\1>/g;
  let match;
  let idCounter = 0;

  // Extract all h2 and h3 headings
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2]
      .replace(/<[^>]+>/g, '') // Strip HTML tags
      .trim();

    // Generate ID from heading text
    const id = `heading-${idCounter++}`;

    headings.push({
      level,
      text,
      id
    });
  }

  // If no headings, return empty TOC
  if (headings.length === 0) {
    return { tocHtml: '', processedHtml: html };
  }

  // Add IDs to the actual HTML headings
  let processedHtml = html;
  let currentId = 0;
  processedHtml = processedHtml.replace(/<h([2-3])([^>]*)>(.+?)<\/h\1>/g, (match, level, attrs, text) => {
    const id = `heading-${currentId++}`;
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });

  // Generate TOC HTML
  let tocHtml = '<nav class="toc">\n';
  tocHtml += '  <div class="toc-header">On This Page</div>\n';
  tocHtml += '  <ul class="toc-list">\n';

  for (const heading of headings) {
    const className = heading.level === 2 ? 'toc-item toc-h2' : 'toc-item toc-h3';
    tocHtml += `    <li class="${className}"><a href="#${heading.id}">${heading.text}</a></li>\n`;
  }

  tocHtml += '  </ul>\n';
  tocHtml += '</nav>';

  return { tocHtml, processedHtml };
}

// Generate HTML page
function generatePage(doc, allDocs, sidebar) {
  // Generate TOC from document HTML
  const { tocHtml, processedHtml } = generateTableOfContents(doc.html);

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} | ${config.title}</title>
  <meta name="description" content="${doc.description || config.description}">
  <link rel="stylesheet" href="${config.baseUrl}styles.css">
  <link rel="stylesheet" href="${config.baseUrl}highlight.css">
  <script src="${config.baseUrl}dark-mode.js"></script>
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
        <button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="moon-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
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
        ${processedHtml}
      </article>

      <div class="pagination">
        ${generatePagination(doc, allDocs, sidebar)}
      </div>
    </main>

    ${tocHtml ? `<aside class="toc-sidebar">${tocHtml}</aside>` : ''}
  </div>

  <footer class="footer">
    <p>${config.footer.copyright}</p>
  </footer>

  <script src="${config.baseUrl}search.js"></script>
  <script src="${config.baseUrl}copy-code.js"></script>
  <script src="${config.baseUrl}toc.js"></script>
  <script src="${config.baseUrl}line-numbers.js"></script>
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

  // Copy TOC script
  const tocSource = path.join(rootDir, 'theme', 'toc.js');
  const tocTarget = path.join(outputDir, 'toc.js');
  await fs.copyFile(tocSource, tocTarget);

  // Copy dark mode script
  const darkModeSource = path.join(rootDir, 'theme', 'dark-mode.js');
  const darkModeTarget = path.join(outputDir, 'dark-mode.js');
  await fs.copyFile(darkModeSource, darkModeTarget);

  // Copy line numbers script
  const lineNumbersSource = path.join(rootDir, 'theme', 'line-numbers.js');
  const lineNumbersTarget = path.join(outputDir, 'line-numbers.js');
  await fs.copyFile(lineNumbersSource, lineNumbersTarget);

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

  // Generate search index with full content
  const searchIndex = await Promise.all(docs.map(async doc => {
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
