import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { marked } from 'marked';
import hljs from 'highlight.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

describe('Tabs Component', () => {
  beforeEach(() => {
    // Configure marked with enhanced code renderer
    marked.use({
      renderer: {
        code(code, infostring) {
          const lang = infostring || 'plaintext';

          let title = null;
          let highlightLines = [];
          let cleanLang = lang;

          // Extract title
          const titleMatch = lang.match(/title="([^"]+)"/);
          if (titleMatch) {
            title = titleMatch[1];
            cleanLang = cleanLang.replace(/title="[^"]+"/, '').trim();
          }

          // Extract line highlights
          const highlightMatch = lang.match(/\{([^}]+)\}/);
          if (highlightMatch) {
            const ranges = highlightMatch[1].split(',');
            ranges.forEach(range => {
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(n => parseInt(n.trim()));
                for (let i = start; i <= end; i++) {
                  highlightLines.push(i);
                }
              } else {
                highlightLines.push(parseInt(range.trim()));
              }
            });
            cleanLang = cleanLang.replace(/\{[^}]+\}/, '').trim();
          }

          const language = hljs.getLanguage(cleanLang) ? cleanLang : 'plaintext';
          const highlighted = hljs.highlight(code, { language }).value;
          const displayLang = cleanLang.charAt(0).toUpperCase() + cleanLang.slice(1);

          const lines = highlighted.split('\n');
          const numberedLines = lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            const highlightClass = isHighlighted ? ' highlighted-line' : '';
            return `<span class="code-line${highlightClass}" data-line="${lineNum}">${line}</span>`;
          }).join('');

          let headerContent = `<span class="code-block-language">${displayLang}</span>`;
          if (title) {
            headerContent = `<span class="code-block-title">${title}</span>`;
          }

          return `<div class="code-block-container" data-language="${cleanLang}">
  <div class="code-block-header">
    ${headerContent}
    <button class="toggle-line-numbers" aria-label="Toggle line numbers">
      <svg width="16" height="16"></svg>
    </button>
  </div>
  <pre class="show-line-numbers"><code class="hljs language-${cleanLang}">${numberedLines}</code></pre>
</div>`;
        }
      }
    });

    // Configure marked with tabs extension
    marked.use({
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
          const tabId = `tabs-${Math.random().toString(36).substr(2, 9)}`;

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
  });

  afterEach(() => {
    // Reset marked configuration
    marked.setOptions(marked.getDefaults());
  });

  it('should parse basic tabs syntax', () => {
    const markdown = `:::tabs
== JavaScript
\`\`\`javascript
console.log('Hello');
\`\`\`

== Python
\`\`\`python
print('Hello')
\`\`\`
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('tabs-container');
    expect(html).toContain('tabs-header');
    expect(html).toContain('tabs-content');
    expect(html).toContain('tab-button');
    expect(html).toContain('tab-panel');
  });

  it('should create correct number of tabs', () => {
    const markdown = `:::tabs
== Tab 1
Content 1

== Tab 2
Content 2

== Tab 3
Content 3
:::`;

    const html = marked.parse(markdown);

    // Count tab buttons
    const buttonMatches = html.match(/class="tab-button/g);
    expect(buttonMatches).toHaveLength(3);

    // Count tab panels
    const panelMatches = html.match(/class="tab-panel/g);
    expect(panelMatches).toHaveLength(3);
  });

  it('should set first tab as active', () => {
    const markdown = `:::tabs
== First
Content

== Second
Content
:::`;

    const html = marked.parse(markdown);

    // First button should have active class
    expect(html).toMatch(/<button class="tab-button active"/);

    // First panel should have active class
    expect(html).toMatch(/<div class="tab-panel active"/);
  });

  it('should handle tabs with code blocks', () => {
    const markdown = `:::tabs
== JavaScript
\`\`\`javascript
const x = 1;
\`\`\`

== Python
\`\`\`python
x = 1
\`\`\`
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('code-block-container');
    expect(html).toContain('language-javascript');
    expect(html).toContain('language-python');
  });

  it('should handle tab names with spaces and special characters', () => {
    const markdown = `:::tabs
== Node.js (v20+)
Content

== Python 3.11+
Content
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('Node.js (v20+)');
    expect(html).toContain('Python 3.11+');
  });

  it('should generate unique IDs for multiple tab groups', () => {
    const markdown = `:::tabs
== Tab 1
Content
:::

:::tabs
== Tab 2
Content
:::`;

    const html = marked.parse(markdown);

    // Should have two different data-tabs-id attributes
    const tabsIdMatches = html.match(/data-tabs-id="tabs-[a-z0-9]+"/g);
    expect(tabsIdMatches).toHaveLength(2);

    // IDs should be different
    expect(tabsIdMatches[0]).not.toBe(tabsIdMatches[1]);
  });

  it('should handle tabs with markdown content', () => {
    const markdown = `:::tabs
== Overview
This is **bold** and *italic* text.

- List item 1
- List item 2

== Details
More content here.
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<li>List item 1</li>');
  });

  it('should handle empty tabs gracefully', () => {
    const markdown = `:::tabs
:::`;

    const html = marked.parse(markdown);

    // Should not create tabs-container for empty tabs
    expect(html).not.toContain('tabs-container');
  });

  it('should match tab buttons to panels with data-tab attribute', () => {
    const markdown = `:::tabs
== First
Content 1

== Second
Content 2
:::`;

    const html = marked.parse(markdown);

    // Extract tab IDs from buttons
    const buttonTabIds = [...html.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);

    // Should have 4 total: 2 buttons + 2 panels
    expect(buttonTabIds).toHaveLength(4);

    // First button and first panel should have same ID
    expect(buttonTabIds[0]).toBe(buttonTabIds[2]);

    // Second button and second panel should have same ID
    expect(buttonTabIds[1]).toBe(buttonTabIds[3]);
  });

  it('should handle tabs with enhanced code blocks', () => {
    const markdown = `:::tabs
== JavaScript
\`\`\`javascript title="app.js" {2}
function test() {
  console.log('highlighted');
}
\`\`\`

== Python
\`\`\`python title="app.py" {1}
def test():
    print('highlighted')
\`\`\`
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('code-block-title');
    expect(html).toContain('app.js');
    expect(html).toContain('app.py');
    expect(html).toContain('highlighted-line');
  });

  it('should preserve whitespace in code blocks inside tabs', () => {
    const markdown = `:::tabs
== Code
\`\`\`javascript
function test() {
    const x = 1;
    return x;
}
\`\`\`
:::`;

    const html = marked.parse(markdown);

    // Should contain the code with the variable
    expect(html).toContain('const');
    expect(html).toContain('hljs-keyword');
  });

  it('should handle multiple paragraphs in tab content', () => {
    const markdown = `:::tabs
== Info
First paragraph.

Second paragraph.

Third paragraph.
:::`;

    const html = marked.parse(markdown);

    // Should have multiple paragraph tags
    const pMatches = html.match(/<p>/g);
    expect(pMatches.length).toBeGreaterThanOrEqual(3);
  });

  it('should not interfere with other markdown features', () => {
    const markdown = `# Heading

:::tabs
== Tab 1
Content
:::

Regular paragraph.`;

    const html = marked.parse(markdown);

    expect(html).toContain('<h1');
    expect(html).toContain('tabs-container');
    expect(html).toContain('Regular paragraph');
  });

  it('should handle tabs with links', () => {
    const markdown = `:::tabs
== Resources
Check out [the docs](https://example.com)

== Tutorial
Follow [this guide](https://example.com/guide)
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('<a href="https://example.com/guide"');
  });

  it('should handle tabs with headings', () => {
    const markdown = `:::tabs
== Section 1
### Subsection A
Content here

== Section 2
### Subsection B
More content
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('<h3');
    expect(html).toContain('Subsection A');
    expect(html).toContain('Subsection B');
  });

  it('should handle single tab', () => {
    const markdown = `:::tabs
== Only Tab
This is the only content
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('tab-button active');
    expect(html).toContain('tab-panel active');
    expect(html).toContain('Only Tab');
  });

  it('should trim whitespace from tab names', () => {
    const markdown = `:::tabs
==   JavaScript
Content

==  Python
Content
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('>JavaScript<');
    expect(html).toContain('>Python<');
  });

  it('should handle tabs with blockquotes', () => {
    const markdown = `:::tabs
== Quote
> This is a blockquote
> With multiple lines
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('<blockquote');
  });

  it('should handle tabs with inline code', () => {
    const markdown = `:::tabs
== Example
Use the \`console.log()\` function to print.
:::`;

    const html = marked.parse(markdown);

    expect(html).toContain('<code>console.log()</code>');
  });
});
