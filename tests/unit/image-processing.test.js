import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, '..', 'fixtures');

// Extract image references from markdown content (copied from build.js for testing)
function extractImageReferences(content) {
  const images = [];

  // Match markdown image syntax: ![alt](path)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const imagePath = match[2];
    // Only include local images (not URLs)
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      images.push({
        alt: match[1],
        path: imagePath.split('?')[0].split('#')[0] // Remove query params and anchors
      });
    }
  }

  // Also match HTML img tags: <img src="path">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const imagePath = match[1];
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      images.push({
        alt: '',
        path: imagePath.split('?')[0].split('#')[0]
      });
    }
  }

  return images;
}

describe('Image Processing', () => {
  describe('extractImageReferences', () => {
    it('should extract markdown image syntax', () => {
      const content = '![Alt text](images/test.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0]).toEqual({
        alt: 'Alt text',
        path: 'images/test.png'
      });
    });

    it('should extract multiple images', () => {
      const content = `
![First](images/first.png)
Some text here
![Second](images/second.jpg)
      `;
      const images = extractImageReferences(content);

      expect(images).toHaveLength(2);
      expect(images[0].path).toBe('images/first.png');
      expect(images[1].path).toBe('images/second.jpg');
    });

    it('should extract HTML img tags', () => {
      const content = '<img src="images/test.png" alt="Test">';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].path).toBe('images/test.png');
    });

    it('should ignore external URLs', () => {
      const content = `
![External](https://example.com/image.png)
![Internal](images/local.png)
      `;
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].path).toBe('images/local.png');
    });

    it('should handle relative paths', () => {
      const content = '![Test](../images/test.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].path).toBe('../images/test.png');
    });

    it('should handle absolute paths from docs root', () => {
      const content = '![Test](/images/test.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].path).toBe('/images/test.png');
    });

    it('should strip query parameters and anchors', () => {
      const content = `
![Test1](images/test.png?v=123)
![Test2](images/test2.png#anchor)
      `;
      const images = extractImageReferences(content);

      expect(images).toHaveLength(2);
      expect(images[0].path).toBe('images/test.png');
      expect(images[1].path).toBe('images/test2.png');
    });

    it('should handle empty alt text', () => {
      const content = '![](images/test.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].alt).toBe('');
      expect(images[0].path).toBe('images/test.png');
    });

    it('should handle mixed markdown and HTML images', () => {
      const content = `
![Markdown](images/md.png)
<img src="images/html.png">
      `;
      const images = extractImageReferences(content);

      expect(images).toHaveLength(2);
      expect(images[0].path).toBe('images/md.png');
      expect(images[1].path).toBe('images/html.png');
    });

    it('should handle images with various extensions', () => {
      const content = `
![PNG](images/test.png)
![JPG](images/test.jpg)
![JPEG](images/test.jpeg)
![GIF](images/test.gif)
![SVG](images/test.svg)
![WEBP](images/test.webp)
      `;
      const images = extractImageReferences(content);

      expect(images).toHaveLength(6);
      expect(images.map(img => img.path)).toEqual([
        'images/test.png',
        'images/test.jpg',
        'images/test.jpeg',
        'images/test.gif',
        'images/test.svg',
        'images/test.webp'
      ]);
    });

    it('should handle no images in content', () => {
      const content = 'Just plain text with no images';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(0);
    });

    it('should handle special characters in alt text', () => {
      const content = '![Test "quoted" & special](images/test.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].alt).toBe('Test "quoted" & special');
    });

    it('should handle spaces in image paths', () => {
      const content = '![Test](images/test%20image.png)';
      const images = extractImageReferences(content);

      expect(images).toHaveLength(1);
      expect(images[0].path).toBe('images/test%20image.png');
    });
  });

  describe('Image Path Resolution', () => {
    it('should resolve relative paths correctly', () => {
      const docDir = '/project/docs/guides';
      const imagePath = '../images/test.png';
      const resolved = path.resolve(docDir, imagePath);

      expect(resolved).toContain('docs/images/test.png');
    });

    it('should resolve absolute paths from project root', () => {
      const projectRoot = '/project';
      const imagePath = '/images/test.png';
      const resolved = path.join(projectRoot, imagePath);

      expect(resolved).toContain('images/test.png');
    });

    it('should normalize path separators', () => {
      const imagePath = 'images\\test.png';
      const normalized = imagePath.replace(/\\/g, '/');

      expect(normalized).toBe('images/test.png');
    });
  });
});
