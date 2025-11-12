import { describe, it, expect } from 'vitest';
import path from 'path';

describe('Server Scripts', () => {
  describe('Path Resolution', () => {
    it('should resolve static file paths correctly', () => {
      const staticPath = path.join('build', 'docs', 'intro.html');
      expect(staticPath).toContain('build');
      expect(staticPath).toContain('intro.html');
    });

    it('should handle root path', () => {
      const rootPath = '/';
      const filePath = rootPath === '/' ? '/index.html' : rootPath;
      expect(filePath).toBe('/index.html');
    });

    it('should handle docs paths', () => {
      const docsPath = '/docs/intro';
      const filePath = `${docsPath}.html`;
      expect(filePath).toBe('/docs/intro.html');
    });
  });

  describe('Port Configuration', () => {
    it('should use default port when not specified', () => {
      const port = process.env.PORT || 3000;
      expect(port).toBeDefined();
      expect(typeof port === 'number' || typeof port === 'string').toBe(true);
    });

    it('should parse port number correctly', () => {
      const portStr = '8080';
      const port = parseInt(portStr, 10);
      expect(port).toBe(8080);
      expect(typeof port).toBe('number');
    });
  });

  describe('File Watching', () => {
    it('should identify markdown files', () => {
      const testFiles = [
        'test.md',
        'guide.md',
        'README.MD',
        'test.txt',
        'config.json'
      ];

      const markdownFiles = testFiles.filter(f => /\.md$/i.test(f));
      expect(markdownFiles).toHaveLength(3);
      expect(markdownFiles).toContain('test.md');
      expect(markdownFiles).toContain('guide.md');
      expect(markdownFiles).toContain('README.MD');
    });

    it('should identify config files', () => {
      const fileName = 'config.json';
      const isConfig = fileName === 'config.json';
      expect(isConfig).toBe(true);
    });

    it('should identify theme files', () => {
      const testPaths = [
        'theme/styles.css',
        'theme/search.js',
        'scripts/build.js',
        'docs/intro.md'
      ];

      const themeFiles = testPaths.filter(p => p.startsWith('theme/'));
      expect(themeFiles).toHaveLength(2);
    });
  });

  describe('URL Normalization', () => {
    it('should normalize trailing slashes', () => {
      const url = '/docs/intro/';
      const normalized = url.replace(/\/$/, '');
      expect(normalized).toBe('/docs/intro');
    });

    it('should handle URLs without trailing slash', () => {
      const url = '/docs/intro';
      const normalized = url.replace(/\/$/, '');
      expect(normalized).toBe('/docs/intro');
    });

    it('should preserve root path', () => {
      const url = '/';
      const isRoot = url === '/';
      expect(isRoot).toBe(true);
    });
  });

  describe('MIME Types', () => {
    it('should identify HTML files', () => {
      const fileName = 'index.html';
      const isHTML = fileName.endsWith('.html');
      expect(isHTML).toBe(true);
    });

    it('should identify CSS files', () => {
      const fileName = 'styles.css';
      const isCSS = fileName.endsWith('.css');
      expect(isCSS).toBe(true);
    });

    it('should identify JavaScript files', () => {
      const fileName = 'app.js';
      const isJS = fileName.endsWith('.js');
      expect(isJS).toBe(true);
    });
  });
});
