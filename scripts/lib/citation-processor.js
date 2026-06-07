/**
 * Parse citations from markdown content
 * Citations format: [citation:author_year] or [citation:key]
 * @param {string} content - Markdown content
 * @returns {Object} { citations: [], content: string }
 */
export function extractCitations(content) {
  const citations = [];
  const citationPattern = /\[citation:([^\]]+)\]/g;
  const uniqueCitations = new Set();

  let match;
  while ((match = citationPattern.exec(content)) !== null) {
    const key = match[1];
    if (!uniqueCitations.has(key)) {
      citations.push(key);
      uniqueCitations.add(key);
    }
  }

  // Replace [citation:key] with numbered references [1], [2], etc.
  let processedContent = content;
  const citationMap = {};

  for (let i = 0; i < citations.length; i++) {
    citationMap[citations[i]] = i + 1;
    processedContent = processedContent.replace(
      new RegExp(`\\[citation:${citations[i]}\\]`, 'g'),
      `<sup><a href="#citation-${i + 1}" class="citation-link">[${i + 1}]</a></sup>`
    );
  }

  return { citations, citationMap, content: processedContent };
}

/**
 * Parse bibliography from frontmatter YAML
 * @param {Object} attributes - Frontmatter attributes
 * @returns {Array} Bibliography entries
 */
export function parseBibliography(attributes) {
  if (!attributes.bibliography) return [];

  const bib = attributes.bibliography;

  // Support array format
  if (Array.isArray(bib)) {
    return bib;
  }

  // Support object format
  if (typeof bib === 'object') {
    return Object.entries(bib).map(([key, value]) => ({
      key,
      ...value
    }));
  }

  return [];
}

/**
 * Format a single bibliography entry
 * @param {Object} entry - Bibliography entry
 * @param {number} index - Entry index (for numbering)
 * @returns {string} Formatted HTML
 */
export function formatBibliographyEntry(entry, index) {
  const { key, author, title, year, url, doi, publication, volume, pages } = entry;

  let html = `<li id="citation-${index}" class="bibliography-entry">`;
  html += `<span class="bibliography-number">[${index}]</span> `;

  // Author
  if (author) {
    const authors = Array.isArray(author) ? author.join(', ') : author;
    html += `<span class="bibliography-author"><strong>${escapeHtml(authors)}</strong></span>`;
    if (year) {
      html += ` (${year})`;
    }
    html += '. ';
  }

  // Title
  if (title) {
    html += `<span class="bibliography-title">"${escapeHtml(title)}"</span>. `;
  }

  // Publication
  if (publication) {
    html += `<span class="bibliography-publication"><em>${escapeHtml(publication)}</em></span>`;
    if (volume) {
      html += `, ${escapeHtml(volume)}`;
    }
    if (pages) {
      html += `, pp. ${escapeHtml(pages)}`;
    }
    html += '. ';
  }

  // DOI
  if (doi) {
    html += `<a href="https://doi.org/${escapeHtml(doi)}" class="bibliography-doi" title="Digital Object Identifier">DOI: ${escapeHtml(doi)}</a>. `;
  }

  // URL
  if (url) {
    html += `<a href="${escapeHtml(url)}" class="bibliography-url" target="_blank" rel="noopener noreferrer" title="External link">View source</a>`;
  }

  html += '</li>';
  return html;
}

/**
 * Generate bibliography HTML
 * @param {Array} bibliography - Bibliography entries
 * @returns {string} HTML for bibliography section
 */
export function generateBibliographyHTML(bibliography) {
  if (!bibliography || bibliography.length === 0) {
    return '';
  }

  let html = '<section class="bibliography" role="doc-bibliography">\n';
  html += '<h2 id="bibliography">References</h2>\n';
  html += '<ol class="bibliography-list">\n';

  for (let i = 0; i < bibliography.length; i++) {
    html += formatBibliographyEntry(bibliography[i], i + 1);
    html += '\n';
  }

  html += '</ol>\n';
  html += '</section>\n';

  return html;
}

/**
 * HTML escape helper
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
