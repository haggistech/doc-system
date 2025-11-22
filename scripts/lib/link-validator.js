import fs from 'fs/promises';
import path from 'path';
import fm from 'front-matter';

/**
 * Extract internal links from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} Array of link objects with text, url, and position
 */
export function extractInternalLinks(content) {
  const links = [];
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only capture relative links (internal links)
    // Ignore external URLs, anchors, and absolute paths starting with http/https
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

/**
 * Validate internal links in a markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {string} baseDir - Base docs directory
 * @param {Array} allFiles - Array of all markdown file paths
 * @returns {Promise<Array>} Array of broken link objects
 */
export async function validateInternalLinks(filePath, baseDir, allFiles) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { body } = fm(content);
  const links = extractInternalLinks(body);
  const brokenLinks = [];

  for (const link of links) {
    // Resolve the link relative to the current file
    const fileDir = path.dirname(filePath);
    let targetPath = path.resolve(fileDir, link.url);

    // Normalize path for cross-platform compatibility
    targetPath = targetPath.replace(/\\/g, '/');

    // Check if target file exists in our markdown files list
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
