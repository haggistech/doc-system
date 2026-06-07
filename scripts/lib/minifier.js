/**
 * Minify HTML by removing unnecessary whitespace and comments
 * @param {string} html - HTML content
 * @returns {string} Minified HTML
 */
export function minifyHTML(html) {
  return html
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove whitespace inside tags
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    // Clean up the result
    .trim();
}

/**
 * Minify CSS by removing unnecessary whitespace and comments
 * @param {string} css - CSS content
 * @returns {string} Minified CSS
 */
export function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around special characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Minify JavaScript by removing comments and unnecessary whitespace
 * Note: This is a simple minifier. For production, use a proper JS minifier.
 * @param {string} js - JavaScript content
 * @returns {string} Minified JavaScript
 */
export function minifyJS(js) {
  return js
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove excessive whitespace but preserve strings
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(';')
    // Final cleanup
    .replace(/;+/g, ';')
    .trim();
}

/**
 * Extract critical CSS (styles for above-the-fold content)
 * @param {string} css - Full CSS content
 * @returns {string} Critical CSS (first 20KB of styles)
 */
export function extractCriticalCSS(css) {
  const minified = minifyCSS(css);
  // Return first 20KB of CSS as critical
  // This includes most common styles (fonts, layout, navbar, etc.)
  const critical = minified.substring(0, 20000);
  return critical;
}

/**
 * Calculate compression stats
 * @param {string} original - Original content
 * @param {string} minified - Minified content
 * @returns {Object} Compression stats
 */
export function getCompressionStats(original, minified) {
  const originalSize = Buffer.byteLength(original, 'utf8');
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const savedBytes = originalSize - minifiedSize;
  const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

  return {
    originalSize,
    minifiedSize,
    savedBytes,
    savedPercent
  };
}

/**
 * Format bytes for display
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted size
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Inline critical CSS into HTML head
 * @param {string} html - HTML content
 * @param {string} criticalCSS - Critical CSS to inline
 * @returns {string} HTML with inlined critical CSS
 */
export function inlineCriticalCSS(html, criticalCSS) {
  const criticalStyle = `<style>${criticalCSS}</style>`;
  // Insert after the first <meta> or before first <link>
  return html.replace(
    /(<head[^>]*>)/i,
    `$1${criticalStyle}`
  );
}

/**
 * Defer non-critical scripts
 * @param {string} html - HTML content
 * @returns {string} HTML with deferred scripts
 */
export function deferNonCriticalScripts(html) {
  // Don't defer critical scripts (dark-mode, search, feedback)
  const criticalScripts = ['dark-mode', 'feedback'];

  return html.replace(
    /<script src="([^"]+)">/g,
    (match, src) => {
      const isCritical = criticalScripts.some(critical => src.includes(critical));
      if (isCritical) {
        return match;
      }
      // Add defer attribute for non-critical scripts
      return `<script src="${src}" defer>`;
    }
  );
}

/**
 * Add async attribute to external scripts
 * @param {string} html - HTML content
 * @returns {string} HTML with async scripts
 */
export function makeScriptsAsync(html) {
  const externalScripts = ['fuse.min', 'search.js', 'copy-code', 'toc', 'line-numbers', 'tabs', 'lightbox'];

  return html.replace(
    /<script src="([^"]+)">/g,
    (match, src) => {
      const isExternal = externalScripts.some(ext => src.includes(ext));
      if (isExternal && !src.includes('defer')) {
        return `<script src="${src}" async>`;
      }
      return match;
    }
  );
}
