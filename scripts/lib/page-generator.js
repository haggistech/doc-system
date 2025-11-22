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
export function generatePage(doc, allDocs, sidebar, config) {
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
      ${generateSidebar(sidebar, doc.slug, allDocs, config)}
    </aside>

    <main class="content">
      ${generateBreadcrumbs(sidebar, doc.slug, doc, config)}
      ${generateMetadataTable(doc.metadata)}
      <article>
        ${processedHtml}
      </article>

      <div class="pagination">
        ${generatePagination(doc, allDocs, sidebar, config)}
      </div>
    </main>

    ${tocHtml ? `<aside class="toc-sidebar">${tocHtml}</aside>` : ''}
  </div>

  <footer class="footer">
    <p>${config.footer.copyright}</p>
  </footer>

  <script src="${config.baseUrl}fuse.min.js"></script>
  <script src="${config.baseUrl}search.js"></script>
  <script src="${config.baseUrl}copy-code.js"></script>
  <script src="${config.baseUrl}toc.js"></script>
  <script src="${config.baseUrl}line-numbers.js"></script>
  <script src="${config.baseUrl}tabs.js"></script>
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
