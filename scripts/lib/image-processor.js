import fs from 'fs/promises';
import path from 'path';
import fm from 'front-matter';

/**
 * Extract image references from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} Array of image objects with alt and path
 */
export function extractImageReferences(content) {
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

/**
 * Copy images and validate image references
 * @param {Array} docs - Array of document objects with filePath
 * @param {string} docsDir - Docs source directory
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Object with copiedImages and brokenImages arrays
 */
export async function processImages(docs, docsDir, outputDir) {
  const imageSet = new Set();
  const brokenImages = [];
  const copiedImages = [];

  // Create images directory in output
  const imagesOutputDir = path.join(outputDir, 'images');
  await fs.mkdir(imagesOutputDir, { recursive: true });

  // Process each document
  for (const doc of docs) {
    const content = await fs.readFile(doc.filePath, 'utf-8');
    const { body } = fm(content);
    const images = extractImageReferences(body);

    for (const image of images) {
      const docDir = path.dirname(doc.filePath);
      let imagePath;

      // Handle absolute paths from docs root (e.g., /images/foo.png)
      if (image.path.startsWith('/')) {
        imagePath = path.join(docsDir, '..', image.path);
      } else {
        // Handle relative paths
        imagePath = path.resolve(docDir, image.path);
      }

      imagePath = imagePath.replace(/\\/g, '/');

      // Check if image exists
      try {
        await fs.access(imagePath);

        // Add to set for copying
        const imageRelativePath = path.relative(path.join(docsDir, '..'), imagePath);
        imageSet.add(JSON.stringify({
          source: imagePath,
          relative: imageRelativePath.replace(/\\/g, '/')
        }));
      } catch (err) {
        // Image doesn't exist
        brokenImages.push({
          file: path.relative(docsDir, doc.filePath),
          image: image.path,
          alt: image.alt
        });
      }
    }
  }

  // Copy all unique images
  for (const imageJson of imageSet) {
    const { source, relative } = JSON.parse(imageJson);
    const targetPath = path.join(outputDir, relative);

    // Create directory if needed
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    try {
      await fs.copyFile(source, targetPath);
      copiedImages.push(relative);
    } catch (err) {
      console.warn(`⚠ Warning: Failed to copy image ${relative}: ${err.message}`);
    }
  }

  return { copiedImages, brokenImages };
}
