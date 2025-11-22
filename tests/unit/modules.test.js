import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const libDir = path.join(projectRoot, 'scripts', 'lib');

describe('Module Structure', () => {
  describe('lib/ Directory', () => {
    it('should have all required modules', async () => {
      const expectedModules = [
        'git-metadata.js',
        'link-validator.js',
        'image-processor.js',
        'markdown-processor.js',
        'navigation-builder.js',
        'page-generator.js'
      ];

      for (const module of expectedModules) {
        const modulePath = path.join(libDir, module);
        const exists = await fs.access(modulePath).then(() => true).catch(() => false);
        expect(exists, `Module ${module} should exist`).toBe(true);
      }
    });
  });

  describe('git-metadata.js', () => {
    it('should export getGitMetadata function', async () => {
      const content = await fs.readFile(path.join(libDir, 'git-metadata.js'), 'utf-8');

      expect(content).toContain('export function getGitMetadata');
      expect(content).toContain('git log');
      expect(content).toContain('lastUpdated');
      expect(content).toContain('created');
    });
  });

  describe('link-validator.js', () => {
    it('should export link validation functions', async () => {
      const content = await fs.readFile(path.join(libDir, 'link-validator.js'), 'utf-8');

      expect(content).toContain('export function extractInternalLinks');
      expect(content).toContain('export async function validateInternalLinks');
      expect(content).toContain('brokenLinks');
    });

    it('should handle markdown link regex correctly', async () => {
      const content = await fs.readFile(path.join(libDir, 'link-validator.js'), 'utf-8');

      // Should have regex for markdown links
      expect(content).toContain('[^\\]]+');
      expect(content).toContain('[^)]+');
    });
  });

  describe('image-processor.js', () => {
    it('should export image processing functions', async () => {
      const content = await fs.readFile(path.join(libDir, 'image-processor.js'), 'utf-8');

      expect(content).toContain('export function extractImageReferences');
      expect(content).toContain('export async function processImages');
      expect(content).toContain('brokenImages');
      expect(content).toContain('copiedImages');
    });

    it('should handle both markdown and HTML images', async () => {
      const content = await fs.readFile(path.join(libDir, 'image-processor.js'), 'utf-8');

      // Markdown images: ![alt](path)
      expect(content).toContain('markdownImageRegex');
      // HTML images: <img src="path">
      expect(content).toContain('htmlImageRegex');
    });
  });

  describe('markdown-processor.js', () => {
    it('should export markdown processing functions', async () => {
      const content = await fs.readFile(path.join(libDir, 'markdown-processor.js'), 'utf-8');

      expect(content).toContain('export function generateTableOfContents');
      expect(content).toContain('export async function processMarkdown');
      expect(content).toContain('export { marked }');
    });

    it('should configure marked with extensions', async () => {
      const content = await fs.readFile(path.join(libDir, 'markdown-processor.js'), 'utf-8');

      // Should have admonition extension
      expect(content).toContain("name: 'admonition'");
      // Should have tabs extension
      expect(content).toContain("name: 'tabs'");
      // Should have code block rendering
      expect(content).toContain('code-block-container');
    });

    it('should support line highlighting in code blocks', async () => {
      const content = await fs.readFile(path.join(libDir, 'markdown-processor.js'), 'utf-8');

      expect(content).toContain('highlightLines');
      expect(content).toContain('highlighted-line');
    });
  });

  describe('navigation-builder.js', () => {
    it('should export navigation functions', async () => {
      const content = await fs.readFile(path.join(libDir, 'navigation-builder.js'), 'utf-8');

      expect(content).toContain('export function generateSidebarFromFiles');
      expect(content).toContain('export function generateSidebar');
      expect(content).toContain('export function generateBreadcrumbs');
      expect(content).toContain('export function generatePagination');
    });

    it('should categorize docs correctly', async () => {
      const content = await fs.readFile(path.join(libDir, 'navigation-builder.js'), 'utf-8');

      expect(content).toContain('Getting Started');
      expect(content).toContain("type: 'category'");
    });
  });

  describe('page-generator.js', () => {
    it('should export page generation functions', async () => {
      const content = await fs.readFile(path.join(libDir, 'page-generator.js'), 'utf-8');

      expect(content).toContain('export function generateMetadataTable');
      expect(content).toContain('export function generatePage');
    });

    it('should include all required scripts in HTML template', async () => {
      const content = await fs.readFile(path.join(libDir, 'page-generator.js'), 'utf-8');

      expect(content).toContain('fuse.min.js');
      expect(content).toContain('search.js');
      expect(content).toContain('copy-code.js');
      expect(content).toContain('toc.js');
      expect(content).toContain('dark-mode.js');
      expect(content).toContain('line-numbers.js');
      expect(content).toContain('tabs.js');
    });

    it('should include metadata table generation', async () => {
      const content = await fs.readFile(path.join(libDir, 'page-generator.js'), 'utf-8');

      expect(content).toContain('metadata-table');
      expect(content).toContain('Author');
      expect(content).toContain('Created');
      expect(content).toContain('Last Updated');
    });
  });
});

describe('Module Imports in build.js', () => {
  it('should import all lib modules', async () => {
    const buildPath = path.join(projectRoot, 'scripts', 'build.js');
    const content = await fs.readFile(buildPath, 'utf-8');

    expect(content).toContain("from './lib/markdown-processor.js'");
    expect(content).toContain("from './lib/link-validator.js'");
    expect(content).toContain("from './lib/image-processor.js'");
    expect(content).toContain("from './lib/navigation-builder.js'");
    expect(content).toContain("from './lib/page-generator.js'");
  });

  it('should use imported functions correctly', async () => {
    const buildPath = path.join(projectRoot, 'scripts', 'build.js');
    const content = await fs.readFile(buildPath, 'utf-8');

    expect(content).toContain('processMarkdown');
    expect(content).toContain('validateInternalLinks');
    expect(content).toContain('processImages');
    expect(content).toContain('generateSidebarFromFiles');
    expect(content).toContain('generatePage');
  });
});

describe('Module Dependencies', () => {
  it('markdown-processor should import git-metadata', async () => {
    const content = await fs.readFile(path.join(libDir, 'markdown-processor.js'), 'utf-8');

    expect(content).toContain("from './git-metadata.js'");
  });

  it('page-generator should import from markdown-processor and navigation-builder', async () => {
    const content = await fs.readFile(path.join(libDir, 'page-generator.js'), 'utf-8');

    expect(content).toContain("from './markdown-processor.js'");
    expect(content).toContain("from './navigation-builder.js'");
  });
});
