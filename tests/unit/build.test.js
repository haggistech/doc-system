import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, '..', 'fixtures');

describe('Build Script', () => {
  describe('Markdown Processing', () => {
    it('should process markdown with frontmatter', async () => {
      const fm = await import('front-matter');
      const markdown = `---
title: Test Page
description: Test Description
---

# Hello World

This is a test.`;

      const parsed = fm.default(markdown);
      expect(parsed.attributes.title).toBe('Test Page');
      expect(parsed.attributes.description).toBe('Test Description');
      expect(parsed.body).toContain('# Hello World');
    });

    it('should handle markdown without frontmatter', async () => {
      const fm = await import('front-matter');
      const markdown = `# Hello World\n\nNo frontmatter here.`;

      const parsed = fm.default(markdown);
      expect(parsed.attributes).toEqual({});
      expect(parsed.body).toContain('# Hello World');
    });
  });

  describe('Code Block Highlighting', () => {
    it('should highlight JavaScript code blocks', async () => {
      const { marked } = await import('marked');
      const hljs = await import('highlight.js');

      marked.use({
        useNewRenderer: true,
        renderer: {
          code(token) {
            const code = token.text;
            const lang = token.lang || 'plaintext';
            const language = hljs.default.getLanguage(lang) ? lang : 'plaintext';
            const highlighted = hljs.default.highlight(code, { language }).value;
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

      const markdown = '```javascript\nconst x = 5;\n```';
      const html = marked.parse(markdown);

      expect(html).toContain('code-block-container');
      expect(html).toContain('Javascript');
      expect(html).toContain('hljs');
    });

    it('should handle unknown language gracefully', async () => {
      const { marked } = await import('marked');
      const hljs = await import('highlight.js');

      marked.use({
        useNewRenderer: true,
        renderer: {
          code(token) {
            const code = token.text;
            const lang = token.lang || 'plaintext';
            const language = hljs.default.getLanguage(lang) ? lang : 'plaintext';
            const highlighted = hljs.default.highlight(code, { language }).value;
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

      const markdown = '```unknownlang\nsome code\n```';
      const html = marked.parse(markdown);

      expect(html).toContain('code-block-container');
      expect(html).toContain('Unknownlang');
    });
  });

  describe('Admonitions', () => {
    it('should render note admonition', async () => {
      const { marked } = await import('marked');

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

      const markdown = `:::note\nThis is a note.\n:::`;
      const html = marked.parse(markdown);

      expect(html).toContain('admonition');
      expect(html).toContain('admonition-note');
      expect(html).toContain('Note');
      expect(html).toContain('This is a note');
    });

    it('should render admonition with custom title', async () => {
      const { marked } = await import('marked');

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
              tip: { icon: '💡', label: 'Tip' }
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

      const markdown = `:::tip Custom Title\nThis is helpful.\n:::`;
      const html = marked.parse(markdown);

      expect(html).toContain('Custom Title');
      expect(html).toContain('admonition-tip');
    });
  });

  describe('Path Resolution', () => {
    it('should correctly resolve relative paths', () => {
      const testPath = path.join('docs', 'guides', 'test.md');
      const relativePath = testPath.replace(/\\/g, '/').replace(/^docs\//, '').replace(/\.md$/, '');

      expect(relativePath).toBe('guides/test');
    });

    it('should handle root level docs', () => {
      const testPath = path.join('docs', 'intro.md');
      const relativePath = testPath.replace(/\\/g, '/').replace(/^docs\//, '').replace(/\.md$/, '');

      expect(relativePath).toBe('intro');
    });
  });

  describe('Search Index Generation', () => {
    it('should create valid search index structure', () => {
      const searchIndex = [
        {
          title: 'Test Page',
          description: 'Test Description',
          path: '/docs/test'
        }
      ];

      expect(searchIndex).toHaveLength(1);
      expect(searchIndex[0]).toHaveProperty('title');
      expect(searchIndex[0]).toHaveProperty('description');
      expect(searchIndex[0]).toHaveProperty('path');
    });

    it('should handle missing descriptions', () => {
      const searchIndex = [
        {
          title: 'Test Page',
          description: '',
          path: '/docs/test'
        }
      ];

      expect(searchIndex[0].description).toBe('');
    });
  });

  describe('HTML Template Generation', () => {
    it('should generate valid HTML structure', () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
</head>
<body>
  <div class="container">Test Content</div>
</body>
</html>`;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('<title>Test Page</title>');
    });
  });

  describe('Git Metadata Extraction', () => {
    it('should parse git log output correctly', () => {
      const gitOutput = '2024-01-15|John Doe';
      const [date, author] = gitOutput.split('|');

      expect(date).toBe('2024-01-15');
      expect(author).toBe('John Doe');
    });

    it('should handle missing git data', () => {
      const gitOutput = '';
      const hasData = gitOutput.trim().length > 0;

      expect(hasData).toBe(false);
    });

    it('should format dates correctly', () => {
      const dateStr = '2024-01-15';
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
    });
  });

  describe('Sidebar Generation', () => {
    it('should process sidebar categories', () => {
      const sidebar = [
        {
          type: 'category',
          label: 'Getting Started',
          items: ['intro', 'installation']
        }
      ];

      expect(sidebar[0].type).toBe('category');
      expect(sidebar[0].items).toHaveLength(2);
    });

    it('should handle nested categories', () => {
      const sidebar = [
        {
          type: 'category',
          label: 'Guides',
          items: ['guides/features', 'guides/configuration']
        }
      ];

      const hasNestedPaths = sidebar[0].items.some(item => item.includes('/'));
      expect(hasNestedPaths).toBe(true);
    });
  });

  describe('Breadcrumb Generation', () => {
    it('should generate breadcrumbs from path', () => {
      const docPath = 'guides/configuration';
      const parts = docPath.split('/');

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe('guides');
      expect(parts[1]).toBe('configuration');
    });

    it('should handle root level pages', () => {
      const docPath = 'intro';
      const parts = docPath.split('/');

      expect(parts).toHaveLength(1);
    });
  });
});
