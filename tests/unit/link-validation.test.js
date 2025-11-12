import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fm from 'front-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, '..', 'fixtures');

// Extract internal links from markdown content (copied from build.js for testing)
function extractInternalLinks(content) {
  const links = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    if (!url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('#') &&
        !url.startsWith('mailto:')) {
      links.push({
        text: match[1],
        url: url,
        position: match.index
      });
    }
  }

  return links;
}

// Validate internal links in a markdown file (copied from build.js for testing)
async function validateInternalLinks(filePath, baseDir, allFiles) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { body } = fm(content);
  const links = extractInternalLinks(body);
  const brokenLinks = [];

  for (const link of links) {
    const fileDir = path.dirname(filePath);
    let targetPath = path.resolve(fileDir, link.url);
    targetPath = targetPath.replace(/\\/g, '/');

    const exists = allFiles.some(file => {
      const normalizedFile = file.replace(/\\/g, '/');
      return normalizedFile === targetPath;
    });

    if (!exists) {
      brokenLinks.push({
        file: path.relative(baseDir, filePath),
        link: link.url,
        text: link.text
      });
    }
  }

  return brokenLinks;
}

describe('Link Validation', () => {
  describe('extractInternalLinks', () => {
    it('should extract relative links from markdown', () => {
      const markdown = `
# Test Document

Check out [this link](./other-doc.md) and [that link](../parent-doc.md).

External link [GitHub](https://github.com) should be ignored.
      `;

      const links = extractInternalLinks(markdown);

      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('./other-doc.md');
      expect(links[0].text).toBe('this link');
      expect(links[1].url).toBe('../parent-doc.md');
      expect(links[1].text).toBe('that link');
    });

    it('should ignore external URLs', () => {
      const markdown = `
[GitHub](https://github.com)
[Google](http://google.com)
      `;

      const links = extractInternalLinks(markdown);
      expect(links).toHaveLength(0);
    });

    it('should ignore anchor links', () => {
      const markdown = `
[Jump to section](#section-name)
      `;

      const links = extractInternalLinks(markdown);
      expect(links).toHaveLength(0);
    });

    it('should ignore mailto links', () => {
      const markdown = `
[Email me](mailto:test@example.com)
      `;

      const links = extractInternalLinks(markdown);
      expect(links).toHaveLength(0);
    });

    it('should handle multiple links on same line', () => {
      const markdown = `See [file1](./file1.md) and [file2](./file2.md) for details.`;

      const links = extractInternalLinks(markdown);
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('./file1.md');
      expect(links[1].url).toBe('./file2.md');
    });
  });

  describe('validateInternalLinks', () => {
    it('should detect valid links', async () => {
      const testFile = path.join(fixturesDir, 'test-doc.md');
      const simpleFile = path.join(fixturesDir, 'simple-doc.md');

      // Create a markdown file with a link to simple-doc
      const tempFile = path.join(fixturesDir, 'temp-test.md');
      await fs.writeFile(tempFile, `
# Test
[Link to simple doc](./simple-doc.md)
      `);

      const allFiles = [testFile, simpleFile, tempFile];
      const brokenLinks = await validateInternalLinks(tempFile, fixturesDir, allFiles);

      expect(brokenLinks).toHaveLength(0);

      // Clean up
      await fs.unlink(tempFile);
    });

    it('should detect broken links', async () => {
      const brokenLinksFile = path.join(fixturesDir, 'broken-links.md');
      const testFile = path.join(fixturesDir, 'test-doc.md');

      const allFiles = [brokenLinksFile, testFile];
      const brokenLinks = await validateInternalLinks(brokenLinksFile, fixturesDir, allFiles);

      // Should find at least 2 broken links (nonexistent-file.md and missing-page.md)
      expect(brokenLinks.length).toBeGreaterThan(0);

      // Check that broken links contain expected information
      const hasNonexistent = brokenLinks.some(link => link.link.includes('nonexistent-file.md'));
      expect(hasNonexistent).toBe(true);
    });

    it('should handle relative paths correctly', async () => {
      // Test that ../parent.md style links are resolved correctly
      const tempDir = path.join(fixturesDir, 'subdir');
      await fs.mkdir(tempDir, { recursive: true });

      const parentFile = path.join(fixturesDir, 'parent.md');
      const childFile = path.join(tempDir, 'child.md');

      await fs.writeFile(parentFile, '# Parent');
      await fs.writeFile(childFile, '[Parent](../parent.md)');

      const allFiles = [parentFile, childFile];
      const brokenLinks = await validateInternalLinks(childFile, fixturesDir, allFiles);

      expect(brokenLinks).toHaveLength(0);

      // Clean up
      await fs.rm(tempDir, { recursive: true });
      await fs.unlink(parentFile);
    });

    it('should ignore links in frontmatter', async () => {
      const tempFile = path.join(fixturesDir, 'frontmatter-test.md');
      await fs.writeFile(tempFile, `---
title: Test
link: ./broken-in-frontmatter.md
---

# Content

[Valid internal link](./test-doc.md)
[Broken link in body](./broken-in-body.md)
      `);

      const testFile = path.join(fixturesDir, 'test-doc.md');
      const allFiles = [tempFile, testFile];
      const brokenLinks = await validateInternalLinks(tempFile, fixturesDir, allFiles);

      // Should only find broken link in body, not in frontmatter
      expect(brokenLinks).toHaveLength(1);
      expect(brokenLinks[0].link).toBe('./broken-in-body.md');

      // Clean up
      await fs.unlink(tempFile);
    });

    it('should provide helpful error information', async () => {
      const brokenLinksFile = path.join(fixturesDir, 'broken-links.md');
      const testFile = path.join(fixturesDir, 'test-doc.md');

      const allFiles = [brokenLinksFile, testFile];
      const brokenLinks = await validateInternalLinks(brokenLinksFile, fixturesDir, allFiles);

      // Each broken link should have file, link, and text properties
      for (const broken of brokenLinks) {
        expect(broken).toHaveProperty('file');
        expect(broken).toHaveProperty('link');
        expect(broken).toHaveProperty('text');
        expect(typeof broken.file).toBe('string');
        expect(typeof broken.link).toBe('string');
        expect(typeof broken.text).toBe('string');
      }
    });
  });

  describe('Link validation edge cases', () => {
    it('should handle files with no links', async () => {
      const tempFile = path.join(fixturesDir, 'no-links.md');
      await fs.writeFile(tempFile, `# No Links\n\nJust plain text.`);

      const allFiles = [tempFile];
      const brokenLinks = await validateInternalLinks(tempFile, fixturesDir, allFiles);

      expect(brokenLinks).toHaveLength(0);

      // Clean up
      await fs.unlink(tempFile);
    });

    it('should handle empty markdown files', async () => {
      const tempFile = path.join(fixturesDir, 'empty.md');
      await fs.writeFile(tempFile, '');

      const allFiles = [tempFile];
      const brokenLinks = await validateInternalLinks(tempFile, fixturesDir, allFiles);

      expect(brokenLinks).toHaveLength(0);

      // Clean up
      await fs.unlink(tempFile);
    });

    it('should handle links with special characters', async () => {
      const tempFile = path.join(fixturesDir, 'special-chars.md');
      await fs.writeFile(tempFile, '[Link with spaces](./file%20with%20spaces.md)');

      const allFiles = [tempFile];
      const brokenLinks = await validateInternalLinks(tempFile, fixturesDir, allFiles);

      // Should detect as broken since the file doesn't exist
      expect(brokenLinks.length).toBeGreaterThan(0);

      // Clean up
      await fs.unlink(tempFile);
    });
  });
});
