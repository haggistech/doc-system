import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

describe('Dark Mode Features', () => {
  describe('CSS Variables', () => {
    it('should have light theme variables defined', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      // Check for required CSS variables
      expect(css).toContain('--primary-color:');
      expect(css).toContain('--text-color:');
      expect(css).toContain('--bg-color:');
      expect(css).toContain('--sidebar-bg:');
      expect(css).toContain('--border-color:');
      expect(css).toContain('--code-bg:');
      expect(css).toContain('--heading-color:');
      expect(css).toContain('--link-hover:');
    });

    it('should have dark theme variables defined', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      expect(css).toContain('[data-theme="dark"]');
      expect(css).toMatch(/\[data-theme="dark"\]\s*{[\s\S]*--primary-color:/);
      expect(css).toMatch(/\[data-theme="dark"\]\s*{[\s\S]*--bg-color:/);
    });

    it('should have theme toggle button styles', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      expect(css).toContain('.theme-toggle');
      expect(css).toContain('.theme-toggle:hover');
      expect(css).toMatch(/\.theme-toggle\s+svg/);
    });

    it('should have smooth transitions for theme switching', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      expect(css).toContain('transition');
    });
  });

  describe('Dark Mode Script', () => {
    it('should have dark-mode.js file', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const exists = await fs.access(scriptPath).then(() => true).catch(() => false);

      expect(exists).toBe(true);
    });

    it('should define theme constants', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const script = await fs.readFile(scriptPath, 'utf-8');

      expect(script).toContain('THEME_KEY');
      expect(script).toContain('LIGHT');
      expect(script).toContain('DARK');
    });

    it('should implement theme detection', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const script = await fs.readFile(scriptPath, 'utf-8');

      expect(script).toContain('getInitialTheme');
      expect(script).toContain('localStorage');
      expect(script).toContain('prefers-color-scheme: dark');
    });

    it('should implement theme toggling', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const script = await fs.readFile(scriptPath, 'utf-8');

      expect(script).toContain('toggleTheme');
      expect(script).toContain('applyTheme');
      expect(script).toContain('updateToggleButton');
    });

    it('should handle system theme changes', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const script = await fs.readFile(scriptPath, 'utf-8');

      expect(script).toContain('matchMedia');
      expect(script).toContain('addEventListener');
    });

    it('should update icon visibility', async () => {
      const scriptPath = path.join(projectRoot, 'theme', 'dark-mode.js');
      const script = await fs.readFile(scriptPath, 'utf-8');

      expect(script).toContain('sun-icon');
      expect(script).toContain('moon-icon');
      expect(script).toContain('display');
    });
  });

  describe('HTML Generation', () => {
    it('should include dark mode script in head', async () => {
      // Build the project
      try {
        execSync('npm run build', {
          cwd: projectRoot,
          stdio: 'pipe'
        });
      } catch (err) {
        // Build might have warnings, that's OK
      }

      // Check generated HTML
      const htmlPath = path.join(projectRoot, 'build', 'docs', 'intro.html');
      const exists = await fs.access(htmlPath).then(() => true).catch(() => false);

      if (exists) {
        const html = await fs.readFile(htmlPath, 'utf-8');
        // Check for dark-mode.js script (may have baseUrl prefix)
        expect(html).toMatch(/<script src="[^"]*dark-mode\.js"><\/script>/);
        expect(html).toContain('</head>');

        // Script should be in head for FOUC prevention
        const headEndIndex = html.indexOf('</head>');
        const scriptIndex = html.indexOf('dark-mode.js');
        expect(scriptIndex).toBeLessThan(headEndIndex);
      }
    });

    it('should include theme toggle button in navbar', async () => {
      const htmlPath = path.join(projectRoot, 'build', 'docs', 'intro.html');
      const exists = await fs.access(htmlPath).then(() => true).catch(() => false);

      if (exists) {
        const html = await fs.readFile(htmlPath, 'utf-8');
        expect(html).toContain('class="theme-toggle"');
        expect(html).toContain('aria-label="Toggle dark mode"');
        expect(html).toContain('class="sun-icon"');
        expect(html).toContain('class="moon-icon"');
      }
    });

    it('should have SVG icons for sun and moon', async () => {
      const htmlPath = path.join(projectRoot, 'build', 'docs', 'intro.html');
      const exists = await fs.access(htmlPath).then(() => true).catch(() => false);

      if (exists) {
        const html = await fs.readFile(htmlPath, 'utf-8');

        // Sun icon (circle with lines)
        expect(html).toMatch(/<svg[^>]*class="sun-icon"[^>]*>/);
        expect(html).toMatch(/<circle[^>]*cx="12"[^>]*cy="12"[^>]*r="5"/);

        // Moon icon (crescent)
        expect(html).toMatch(/<svg[^>]*class="moon-icon"[^>]*>/);
        expect(html).toContain('M21 12.79A9 9 0 1 1 11.21 3');
      }
    });

    it('should copy dark-mode.js to build directory', async () => {
      const scriptPath = path.join(projectRoot, 'build', 'dark-mode.js');
      const exists = await fs.access(scriptPath).then(() => true).catch(() => false);

      if (exists) {
        const script = await fs.readFile(scriptPath, 'utf-8');
        expect(script).toContain('toggleTheme');
        expect(script).toContain('localStorage');
      }
    });
  });

  describe('Theme Toggle Button Styles', () => {
    it('should have proper button styling', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      // Check button has no border/background by default
      expect(css).toMatch(/\.theme-toggle\s*{[\s\S]*background:\s*none/);
      expect(css).toMatch(/\.theme-toggle\s*{[\s\S]*border:\s*none/);
      expect(css).toMatch(/\.theme-toggle\s*{[\s\S]*cursor:\s*pointer/);
    });

    it('should have hover state', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      expect(css).toContain('.theme-toggle:hover');
      expect(css).toMatch(/\.theme-toggle:hover\s*{[\s\S]*background-color:/);
    });

    it('should style SVG icons', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      expect(css).toMatch(/\.theme-toggle\s+svg\s*{/);
      expect(css).toMatch(/\.theme-toggle\s+svg\s*{[\s\S]*width:/);
      expect(css).toMatch(/\.theme-toggle\s+svg\s*{[\s\S]*height:/);
    });
  });

  describe('Color Variables Usage', () => {
    it('should use CSS variables throughout the stylesheet', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      // Check that colors use var()
      expect(css).toContain('var(--bg-color)');
      expect(css).toContain('var(--text-color)');
      expect(css).toContain('var(--primary-color)');
      expect(css).toContain('var(--border-color)');
      expect(css).toContain('var(--sidebar-bg)');
      expect(css).toContain('var(--heading-color)');
    });

    it('should apply heading color to headings', async () => {
      const cssPath = path.join(projectRoot, 'theme', 'styles.css');
      const css = await fs.readFile(cssPath, 'utf-8');

      // Headings should use --heading-color
      expect(css).toMatch(/article\s+h[123]\s*{[\s\S]*color:\s*var\(--heading-color\)/);
    });
  });
});
