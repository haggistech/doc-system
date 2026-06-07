import fs from 'fs/promises';
import path from 'path';

/**
 * Get all available versions from config
 * @param {Object} config - Site configuration
 * @returns {Array} Array of version strings
 */
export function getAvailableVersions(config) {
  return config.versions?.available || ['1.0.0'];
}

/**
 * Get current version from config
 * @param {Object} config - Site configuration
 * @returns {string} Current version
 */
export function getCurrentVersion(config) {
  return config.versions?.current || 'latest';
}

/**
 * Check if version-specific docs directory exists
 * @param {string} rootDir - Root directory
 * @param {string} version - Version string
 * @param {string} docsDir - Docs directory name
 * @returns {Promise<boolean>}
 */
export async function hasVersionDocs(rootDir, version, docsDir = 'docs') {
  try {
    const versionDocsPath = path.join(rootDir, `${docsDir}-${version}`);
    await fs.access(versionDocsPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the docs path for a specific version
 * @param {string} rootDir - Root directory
 * @param {string} version - Version string
 * @param {string} docsDir - Default docs directory
 * @returns {Promise<string>} Path to version docs
 */
export async function getVersionDocsPath(rootDir, version, docsDir = 'docs') {
  const hasVersion = await hasVersionDocs(rootDir, version, docsDir);
  if (hasVersion) {
    return path.join(rootDir, `${docsDir}-${version}`);
  }
  // Fall back to main docs directory
  return path.join(rootDir, docsDir);
}

/**
 * Get the output path for a specific version
 * @param {string} baseOutputDir - Base output directory
 * @param {string} version - Version string
 * @returns {string} Output path for version
 */
export function getVersionOutputPath(baseOutputDir, version) {
  return path.join(baseOutputDir, version);
}

/**
 * Build config overrides for a specific version
 * @param {Object} baseConfig - Base configuration
 * @param {string} version - Version string
 * @returns {Object} Config with version-specific overrides
 */
export function buildVersionConfig(baseConfig, version) {
  const config = JSON.parse(JSON.stringify(baseConfig)); // Deep copy

  // Update title and paths to reflect version
  config.versions = {
    ...config.versions,
    current: version
  };

  // Update base URL to include version
  if (config.baseUrl) {
    // Remove trailing slash if present
    const base = config.baseUrl.replace(/\/$/, '');
    // Add version to path
    config.baseUrl = `${base}/${version}/`;
  }

  return config;
}

/**
 * Generate version selector HTML
 * @param {Array} versions - All available versions
 * @param {string} currentVersion - Current version
 * @param {string} baseUrl - Base URL for site
 * @returns {string} HTML for version selector
 */
export function generateVersionSelector(versions, currentVersion, baseUrl) {
  if (!versions || versions.length <= 1) {
    return '';
  }

  const base = baseUrl.replace(/\/$/, '').replace(/\/[^/]+\/$/, '/');

  return `
    <div class="version-selector">
      <select aria-label="Select documentation version" onchange="window.location.href = '${base}/' + this.value + '/'">
        ${versions.map(v => `<option value="${v}" ${v === currentVersion ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
      <span class="version-badge">${currentVersion}</span>
    </div>
  `;
}
