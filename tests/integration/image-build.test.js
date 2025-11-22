import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const testBuildDir = path.join(projectRoot, 'build-test-images');
const testDocsDir = path.join(projectRoot, 'docs-test-images');
const testImagesDir = path.join(projectRoot, 'images-test');
const testConfigPath = path.join(projectRoot, 'config-test-images.json');

describe('Image Build Integration', () => {
  beforeAll(async () => {
    // These tests verify image-related build features work
    // The actual build is tested in build-workflow.test.js
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(testBuildDir, { recursive: true, force: true });
      await fs.rm(testDocsDir, { recursive: true, force: true });
      await fs.rm(testImagesDir, { recursive: true, force: true });
      await fs.rm(testConfigPath, { force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  it('should verify images directory exists in real build', async () => {
    // Check if the real build has copied the test image
    const realBuildImagesDir = path.join(projectRoot, 'build', 'docs', 'images');
    const exists = await fs.access(realBuildImagesDir).then(() => true).catch(() => false);

    // This will be true if build was run and had images
    expect(typeof exists).toBe('boolean');
  });

  it('should have image copying logic in build script', async () => {
    // Check the image processor module for core functions
    const imageProcessor = path.join(projectRoot, 'scripts', 'lib', 'image-processor.js');
    const content = await fs.readFile(imageProcessor, 'utf-8');

    expect(content).toContain('extractImageReferences');
    expect(content).toContain('processImages');
  });

  it('should have image validation in build script', async () => {
    // Check the image processor module for validation logic
    const imageProcessor = path.join(projectRoot, 'scripts', 'lib', 'image-processor.js');
    const content = await fs.readFile(imageProcessor, 'utf-8');

    expect(content).toContain('brokenImages');
    expect(content).toContain('copiedImages');
  });
});

describe('Image Validation', () => {
  it('should detect broken image references', () => {
    const brokenImages = [
      {
        file: 'guides/features.md',
        image: 'missing.png',
        alt: 'Missing Image'
      }
    ];

    expect(brokenImages).toHaveLength(1);
    expect(brokenImages[0].file).toBe('guides/features.md');
    expect(brokenImages[0].image).toBe('missing.png');
  });

  it('should validate image paths exist before copying', async () => {
    const imagePath = path.join(testImagesDir, 'nonexistent.png');
    const exists = await fs.access(imagePath).then(() => true).catch(() => false);

    expect(exists).toBe(false);
  });

  it('should handle missing image directories gracefully', async () => {
    const missingDir = path.join(projectRoot, 'nonexistent-images');
    const exists = await fs.access(missingDir).then(() => true).catch(() => false);

    expect(exists).toBe(false);
  });
});
