/**
 * Generate sidebar structure from folder/file structure
 * @param {Array} docs - Array of document objects
 * @param {string} docsDir - Docs directory path
 * @returns {Array} Sidebar structure
 */
export function generateSidebarFromFiles(docs, docsDir) {
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

/**
 * Generate sidebar HTML
 * @param {Array} items - Sidebar items
 * @param {string} currentSlug - Current page slug
 * @param {Array} allDocs - All document objects
 * @param {Object} config - Site configuration
 * @returns {string} Sidebar HTML
 */
export function generateSidebar(items, currentSlug, allDocs, config) {
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

/**
 * Generate breadcrumb navigation
 * @param {Array} sidebar - Sidebar structure
 * @param {string} currentSlug - Current page slug
 * @param {Object} currentDoc - Current document object
 * @param {Object} config - Site configuration
 * @returns {string} Breadcrumb HTML
 */
export function generateBreadcrumbs(sidebar, currentSlug, currentDoc, config) {
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

/**
 * Generate pagination links
 * @param {Object} currentDoc - Current document object
 * @param {Array} allDocs - All document objects
 * @param {Array} sidebar - Sidebar structure
 * @param {Object} config - Site configuration
 * @returns {string} Pagination HTML
 */
export function generatePagination(currentDoc, allDocs, sidebar, config) {
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
