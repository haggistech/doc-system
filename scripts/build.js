import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import fm from 'front-matter';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configure marked with syntax highlighting
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

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

// Get last updated date from git
function getLastUpdated(filePath) {
  try {
    const timestamp = execSync(
      `git log -1 --format=%at "${filePath}"`,
      { encoding: 'utf-8', cwd: rootDir }
    ).trim();

    if (timestamp) {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (err) {
    // Not a git repo or file not tracked
    return null;
  }
  return null;
}

// Process markdown file
async function processMarkdown(filePath, baseDir) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { attributes, body } = fm(content);
  const html = marked(body);

  const relativePath = path.relative(baseDir, filePath);
  const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

  return {
    slug,
    title: attributes.title || slug,
    description: attributes.description || '',
    html,
    attributes,
    lastUpdated: getLastUpdated(filePath)
  };
}

// Generate HTML page
function generatePage(doc, allDocs, sidebar, version = null) {
  const versionPath = version ? `${version}/` : '';
  const versionLabel = version || 'current';

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
      ${generateVersionDropdown(versionLabel)}
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
      ${generateSidebar(sidebar, doc.slug, versionPath)}
    </aside>

    <main class="content">
      ${version ? `<div class="version-banner">${version === config.versions.latest ? 'Latest version' : `Version ${version}`}</div>` : ''}
      ${generateBreadcrumbs(sidebar, doc.slug)}
      <article>
        ${doc.html}
      </article>
      ${doc.lastUpdated ? `<div class="last-updated">Last updated: ${doc.lastUpdated}</div>` : ''}

      <div class="pagination">
        ${generatePagination(doc, allDocs, sidebar, versionPath)}
      </div>
    </main>
  </div>

  <footer class="footer">
    <p>${config.footer.copyright}</p>
  </footer>

  <script src="${config.baseUrl}search.js"></script>
  <script src="${config.baseUrl}copy-code.js"></script>
  <script>
    // Version dropdown toggle
    document.addEventListener('DOMContentLoaded', function() {
      const dropdown = document.querySelector('.version-dropdown');
      if (dropdown) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          this.classList.toggle('open');
        });
        document.addEventListener('click', function() {
          dropdown.classList.remove('open');
        });
      }

      // Mobile sidebar toggle
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

// Generate version dropdown
function generateVersionDropdown(currentVersion) {
  if (!config.versions || !config.versions.available || config.versions.available.length === 0) {
    return '';
  }

  const versions = config.versions.available;

  return `
    <div class="version-dropdown">
      <button class="version-button">v${currentVersion}</button>
      <div class="version-menu">
        ${versions.map(v => `
          <a href="${config.baseUrl}${v === config.versions.current ? 'docs' : v}/intro.html"
             class="${v === currentVersion ? 'active' : ''}">
            v${v}${v === config.versions.latest ? ' (latest)' : ''}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// Generate breadcrumb navigation
function generateBreadcrumbs(sidebar, currentSlug) {
  const breadcrumbs = [{ label: 'Home', href: config.baseUrl }];

  for (const item of sidebar) {
    if (item.type === 'category') {
      for (const subItem of item.items) {
        if (subItem === currentSlug) {
          breadcrumbs.push({ label: item.label, href: null });
          // Use slug's last part as page name if no frontmatter title
          const pageName = currentSlug.split('/').pop();
          breadcrumbs.push({ label: pageName, href: null });
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
function generateSidebar(items, currentSlug, versionPath = '') {
  let html = '<ul class="sidebar-nav">';

  for (const item of items) {
    if (item.type === 'category') {
      html += `<li class="sidebar-category">
        <div class="sidebar-category-label">${item.label}</div>
        <ul class="sidebar-category-items">`;

      for (const subItem of item.items) {
        const isActive = currentSlug === subItem;
        html += `<li><a href="${config.baseUrl}${versionPath}docs/${subItem}.html" class="${isActive ? 'active' : ''}">${subItem.split('/').pop()}</a></li>`;
      }

      html += '</ul></li>';
    }
  }

  html += '</ul>';
  return html;
}

// Generate pagination links
function generatePagination(currentDoc, allDocs, sidebar, versionPath = '') {
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
    html += `<a href="${config.baseUrl}${versionPath}docs/${prev}.html" class="pagination-prev">← Previous</a>`;
  }

  if (currentIndex < flatDocs.length - 1) {
    const next = flatDocs[currentIndex + 1];
    html += `<a href="${config.baseUrl}${versionPath}docs/${next}.html" class="pagination-next">Next →</a>`;
  }

  return html;
}

// Build a specific version
async function buildVersion(version = null) {
  let docsDir, sidebar;
  let versionLabel = 'current';
  let outputPath = '';

  if (version) {
    // Build versioned docs
    const versionsDir = path.join(rootDir, config.versionsDir || 'versioned_docs');
    docsDir = path.join(versionsDir, `version-${version}`);

    // Load versioned sidebar
    const sidebarPath = path.join(rootDir, 'versioned_sidebars', `version-${version}-sidebars.json`);
    try {
      sidebar = JSON.parse(await fs.readFile(sidebarPath, 'utf-8'));
    } catch {
      console.warn(`Warning: Sidebar not found for version ${version}, using default`);
      sidebar = config.sidebar;
    }

    versionLabel = version;
    outputPath = version;
    console.log(`Building version ${version}...`);
  } else {
    // Build current docs
    docsDir = path.join(rootDir, config.docsDir);
    sidebar = config.sidebar;
    console.log('Building current version...');
  }

  const markdownFiles = await getMarkdownFiles(docsDir);

  if (markdownFiles.length === 0) {
    console.log(`No markdown files found in ${docsDir}`);
    return [];
  }

  const docs = [];
  for (const file of markdownFiles) {
    const doc = await processMarkdown(file, docsDir);
    docs.push(doc);
  }

  // Create docs output directory
  const docsOutputDir = path.join(outputDir, outputPath, 'docs');
  await fs.mkdir(docsOutputDir, { recursive: true });

  // Generate HTML for each doc
  for (const doc of docs) {
    const html = generatePage(doc, docs, sidebar, outputPath);
    const outputFilePath = path.join(docsOutputDir, `${doc.slug}.html`);

    // Create subdirectories if needed
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, html);
  }

  console.log(`✓ Built ${docs.length} pages for ${versionLabel}`);

  return docs;
}

// Build the site
async function build() {
  console.log('Building documentation site...');

  // Build current version
  const currentDocs = await buildVersion();

  // Build versioned docs
  if (config.versions && config.versions.available) {
    for (const version of config.versions.available) {
      if (version !== config.versions.current) {
        await buildVersion(version);
      }
    }
  }

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

  // Generate search index for current version
  const searchIndex = currentDocs.map(doc => ({
    title: doc.title,
    slug: doc.slug,
    description: doc.description
  }));

  await fs.writeFile(
    path.join(outputDir, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );

  // Create index.html that redirects to first doc
  if (currentDocs.length > 0) {
    const firstDoc = config.sidebar[0].items[0];
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
