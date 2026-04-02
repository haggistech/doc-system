import { generateTableOfContents } from './markdown-processor.js';
import { generateSidebar, generateBreadcrumbs, generatePagination } from './navigation-builder.js';

/**
 * Generate metadata table HTML
 * @param {Object} metadata - Document metadata
 * @returns {string} Metadata table HTML
 */
export function generateMetadataTable(metadata) {
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

/**
 * Generate HTML page for a document
 * @param {Object} doc - Document object
 * @param {Array} allDocs - All document objects
 * @param {Array} sidebar - Sidebar structure
 * @param {Object} config - Site configuration
 * @returns {string} Complete HTML page
 */
export function generatePage(doc, allDocs, sidebar, config, assetManifest = {}) {
  // Resolve a filename to its fingerprinted version (falls back to original name)
  const asset = name => config.baseUrl + (assetManifest[name] || name);

  // Generate TOC from document HTML
  const { tocHtml, processedHtml } = generateTableOfContents(doc.html);

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} | ${config.title}</title>
  <meta name="description" content="${doc.description || config.description}">
  <link rel="stylesheet" href="${asset('styles.css')}">
  <link rel="stylesheet" href="${asset('highlight.css')}">
  <script src="${asset('dark-mode.js')}"></script>
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
      ${generateSidebar(sidebar, doc.slug, allDocs, config)}
    </aside>

    <main class="content">
      ${generateBreadcrumbs(sidebar, doc.slug, doc, config)}
      ${generateMetadataTable(doc.metadata)}
      ${doc.readingTime ? `<p class="reading-time">${doc.readingTime} min read</p>` : ''}
      <article>
        ${processedHtml}
      </article>

      ${config.repoUrl && doc.attributes.edit !== false ? `<div class="edit-page">
        <a href="${config.repoUrl}/edit/master/${config.docsDir || 'docs'}/${doc.slug}.md" target="_blank" rel="noopener noreferrer" class="edit-page-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit this page
        </a>
      </div>` : ''}

      <div class="pagination">
        ${generatePagination(doc, allDocs, sidebar, config)}
      </div>
    </main>

    ${tocHtml && doc.attributes.toc !== false ? `<aside class="toc-sidebar">${tocHtml}</aside>` : ''}
  </div>

  <footer class="footer">
    <p>${config.footer.copyright}</p>
  </footer>

  <script src="${asset('fuse.min.js')}"></script>
  <script src="${asset('search.js')}"></script>
  <script src="${asset('copy-code.js')}"></script>
  <script src="${asset('toc.js')}"></script>
  <script src="${asset('line-numbers.js')}"></script>
  <script src="${asset('tabs.js')}"></script>
  <script src="${asset('lightbox.js')}"></script>
  ${processedHtml.includes('class="mermaid"') ? `<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
    });
  </script>` : ''}
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

/**
 * Generate a custom 404 page
 * @param {Object} config - Site configuration
 * @param {Object} assetManifest - Fingerprinted asset filenames
 * @returns {string} Complete 404 HTML page
 */
export function generate404Page(config, assetManifest = {}) {
  const asset = name => config.baseUrl + (assetManifest[name] || name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | ${config.title}</title>
  <link rel="stylesheet" href="${asset('styles.css')}">
  <script src="${asset('dark-mode.js')}"></script>
</head>
<body>
  <nav class="navbar">
    <div class="navbar-inner">
      <a href="${config.baseUrl}" class="navbar-brand">${config.navbar.title}</a>
      <div class="search-container">
        <input type="text" id="search-input" class="search-input" placeholder="Search docs..." autocomplete="off">
        <div id="search-results" class="search-results"></div>
      </div>
      <div class="navbar-links">
        <button class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="moon-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <div class="not-found">
    <div class="not-found-code">404</div>
    <h1 class="not-found-title">Page not found</h1>
    <p class="not-found-message">The page you're looking for doesn't exist or has been moved.</p>
    <a href="${config.baseUrl}" class="not-found-home">Go to home</a>
  </div>

  <script src="${asset('fuse.min.js')}"></script>
  <script src="${asset('search.js')}"></script>
</body>
</html>`;
}
