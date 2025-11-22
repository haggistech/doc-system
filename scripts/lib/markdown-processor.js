import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import fm from 'front-matter';
import { getGitMetadata } from './git-metadata.js';

// Configure marked with syntax highlighting and language labels
marked.use({
  useNewRenderer: true,
  renderer: {
    code(token) {
      const code = token.text;
      const lang = token.lang || 'plaintext';

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
      }).join('');

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
  useNewRenderer: true,
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

// Configure marked with tabs extension
marked.use({
  useNewRenderer: true,
  extensions: [{
    name: 'tabs',
    level: 'block',
    start(src) {
      const match = src.match(/^:::tabs/);
      return match?.index;
    },
    tokenizer(src) {
      const rule = /^:::tabs\n([\s\S]*?)\n:::/;
      const match = rule.exec(src);
      if (match) {
        const content = match[1];
        const tabs = [];

        // Parse tabs: == TabName followed by content until next == or end
        const tabPattern = /^== (.+)$/gm;
        let lastIndex = 0;
        let lastTabName = null;
        let tabMatch;

        while ((tabMatch = tabPattern.exec(content)) !== null) {
          // Save previous tab's content if it exists
          if (lastTabName) {
            const tabContent = content.substring(lastIndex, tabMatch.index).trim();
            tabs.push({ name: lastTabName, content: tabContent });
          }

          lastTabName = tabMatch[1].trim();
          lastIndex = tabMatch.index + tabMatch[0].length;
        }

        // Add the last tab
        if (lastTabName) {
          const tabContent = content.substring(lastIndex).trim();
          tabs.push({ name: lastTabName, content: tabContent });
        }

        return {
          type: 'tabs',
          raw: match[0],
          tabs: tabs
        };
      }
    },
    renderer(token) {
      if (!token.tabs || token.tabs.length === 0) {
        return '';
      }

      // Generate unique ID for this tab group
      const tabId = `tabs-${Math.random().toString(36).substring(2, 11)}`;

      // Generate tab buttons
      const tabButtons = token.tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        return `<button class="tab-button${activeClass}" data-tab="${tabId}-${index}">${tab.name}</button>`;
      }).join('\n');

      // Generate tab content panels
      const tabPanels = token.tabs.map((tab, index) => {
        const activeClass = index === 0 ? ' active' : '';
        const content = marked.parse(tab.content);
        return `<div class="tab-panel${activeClass}" data-tab="${tabId}-${index}">${content}</div>`;
      }).join('\n');

      return `<div class="tabs-container" data-tabs-id="${tabId}">
        <div class="tabs-header">
          ${tabButtons}
        </div>
        <div class="tabs-content">
          ${tabPanels}
        </div>
      </div>`;
    }
  }]
});

/**
 * Generate Table of Contents from HTML headings
 * @param {string} html - HTML content
 * @returns {Object} Object with tocHtml and processedHtml
 */
export function generateTableOfContents(html) {
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

/**
 * Process a markdown file and return document object
 * @param {string} filePath - Path to the markdown file
 * @param {string} baseDir - Base docs directory
 * @param {string} rootDir - Root project directory
 * @returns {Promise<Object>} Document object with slug, title, html, etc.
 */
export async function processMarkdown(filePath, baseDir, rootDir) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { attributes, body } = fm(content);
  const html = marked(body);

  const relativePath = path.relative(baseDir, filePath);
  const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

  // Get Git metadata
  const gitMetadata = getGitMetadata(filePath, rootDir);

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

// Export marked for use in other modules if needed
export { marked };
