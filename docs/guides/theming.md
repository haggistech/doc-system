---
title: Theming Guide
description: Detailed guide to customizing the visual appearance of your documentation site
---

# Theming Guide

This guide covers how to customize the visual appearance of your documentation system, from simple color changes to complete theme overhauls.

## Quick Start

All theming is done through the `theme/styles.css` file. The system uses CSS custom properties (CSS variables) for easy customization.

```bash
# Edit the theme file
vim theme/styles.css

# Preview changes
npm run dev
```

## CSS Variables

### Color Palette

The color system uses CSS custom properties defined in `:root`:

```css
:root {
  --primary-color: #2563eb;      /* Brand color for links, buttons */
  --text-color: #1f2937;          /* Main text color */
  --bg-color: #ffffff;            /* Page background */
  --sidebar-bg: #f9fafb;          /* Sidebar background */
  --border-color: #e5e7eb;        /* Borders and dividers */
  --code-bg: #f3f4f6;             /* Inline code background */
  --heading-color: #111827;       /* Heading text color */
  --link-hover: #1d4ed8;          /* Link hover color */
}
```

### Dark Mode Colors

Dark mode colors are defined in `[data-theme="dark"]`:

```css
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --text-color: #e5e7eb;
  --bg-color: #0f172a;
  --sidebar-bg: #1e293b;
  --border-color: #334155;
  --code-bg: #1e293b;
  --heading-color: #f1f5f9;
  --link-hover: #93c5fd;
}
```

### Layout Variables

```css
:root {
  --navbar-height: 60px;          /* Top navigation bar height */
  --sidebar-width: 280px;         /* Left sidebar width */
}
```

## Common Customizations

### Change Brand Color

Replace the primary blue with your brand color:

```css
:root {
  --primary-color: #059669;       /* Green theme */
  --link-hover: #047857;
}

[data-theme="dark"] {
  --primary-color: #34d399;
  --link-hover: #6ee7b7;
}
```

**Popular color schemes:**

**Purple:**
```css
--primary-color: #7c3aed;
--link-hover: #6d28d9;
```

**Orange:**
```css
--primary-color: #ea580c;
--link-hover: #c2410c;
```

**Pink:**
```css
--primary-color: #db2777;
--link-hover: #be185d;
```

**Teal:**
```css
--primary-color: #0d9488;
--link-hover: #0f766e;
```

### Change Fonts

#### System Font Stack (Default)

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
```

#### Use Google Fonts

1. **Add font link to build script** (`scripts/build.js`):

```javascript
// In generateHTML function, add to <head>:
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. **Update CSS:**

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

#### Monospace Font for Code

```css
article code,
pre {
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

### Adjust Layout Dimensions

#### Wider Sidebar

```css
:root {
  --sidebar-width: 320px;  /* Default: 280px */
}
```

#### Taller Navbar

```css
:root {
  --navbar-height: 70px;  /* Default: 60px */
}
```

#### Wider Content Area

```css
@media (min-width: 1400px) {
  .content {
    max-width: 900px;  /* Adjust max content width */
  }
}
```

### Change Code Block Theme

Code blocks use Highlight.js. Change the theme in `scripts/build.js`:

```javascript
// Available themes:
// - github.css (light)
// - github-dark.css (dark)
// - monokai.css
// - atom-one-dark.css
// - vs2015.css
// - dracula.css
// - nord.css
// - tokyo-night-dark.css

const highlightCssSource = path.join(
  rootDir,
  'node_modules',
  'highlight.js',
  'styles',
  'atom-one-dark.css'  // Change this line
);
```

Browse all themes: [Highlight.js Demo](https://highlightjs.org/static/demo/)

### Rounded Corners

Make the design more rounded:

```css
/* More rounded corners */
.search-input,
.navbar,
article pre,
.code-block-container,
.admonition {
  border-radius: 12px;  /* Default: 6px */
}

.copy-code-button,
.pagination a {
  border-radius: 8px;
}
```

Or remove rounded corners entirely:

```css
* {
  border-radius: 0 !important;
}
```

### Shadow Effects

Add shadows for depth:

```css
.navbar {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.code-block-container {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## Component Customization

### Navbar

#### Change Navbar Background

```css
.navbar {
  background: linear-gradient(to right, #667eea, #764ba2);
  border-bottom: none;
}

.navbar-brand,
.navbar-links a {
  color: white;
}
```

#### Transparent Navbar

```css
.navbar {
  background: transparent;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Center Logo/Title

```css
.navbar-inner {
  justify-content: center;
}

.navbar-brand {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

### Sidebar

#### Different Sidebar Background

```css
.sidebar {
  background: linear-gradient(to bottom, #f0f4f8, #d9e2ec);
}
```

#### Hide Sidebar Category Labels

```css
.sidebar-category-label {
  display: none;
}
```

#### Larger Sidebar Text

```css
.sidebar-category-items a {
  font-size: 1rem;       /* Default: inherit */
  padding: 0.75rem 1.5rem;  /* More padding */
}
```

#### Colored Category Labels

```css
.sidebar-category:nth-child(1) .sidebar-category-label {
  color: #2563eb;
}

.sidebar-category:nth-child(2) .sidebar-category-label {
  color: #059669;
}

.sidebar-category:nth-child(3) .sidebar-category-label {
  color: #dc2626;
}
```

### Content Area

#### Wider Line Length

```css
article {
  max-width: 900px;  /* Default: auto */
  margin: 0 auto;
}
```

#### Larger Base Font Size

```css
body {
  font-size: 18px;  /* Default: 16px */
}
```

#### More Line Height (Readability)

```css
article p {
  line-height: 1.9;  /* Default: 1.7 */
}
```

### Headings

#### Colored Headings

```css
article h2 {
  color: var(--primary-color);
}

article h3 {
  color: #6b7280;
}
```

#### Heading Underlines

```css
article h2 {
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}
```

#### Heading Anchors (Hover Links)

```css
article h2:hover::before,
article h3:hover::before {
  content: '# ';
  color: var(--primary-color);
  margin-left: -1.5rem;
  position: absolute;
}
```

### Code Blocks

#### Different Code Background

```css
.code-block-container {
  background: #282c34;  /* Atom One Dark background */
}

.code-block-container pre {
  background: transparent;
}
```

#### Show Line Numbers

Currently not built-in. To add:

```css
.code-block-container pre {
  counter-reset: line;
}

.code-block-container pre code {
  counter-increment: line;
}

.code-block-container pre code::before {
  content: counter(line);
  display: inline-block;
  width: 2em;
  padding-right: 1em;
  margin-right: 1em;
  text-align: right;
  color: #6b7280;
  border-right: 1px solid var(--border-color);
}
```

#### Remove Copy Button

```css
.copy-code-button {
  display: none !important;
}
```

### Search

#### Styled Search Bar

```css
.search-input {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
```

#### Larger Search Results

```css
.search-result-item {
  padding: 1rem 1.5rem;
}

.search-result-title {
  font-size: 1rem;
}
```

### Table of Contents

#### Different TOC Position

```css
.toc-sidebar {
  position: fixed;
  right: 0;
  top: var(--navbar-height);
  width: 200px;
}
```

#### Colored TOC Active Item

```css
.toc-item a.active {
  background: rgba(37, 99, 235, 0.1);
  padding-left: 1rem;
  border-radius: 4px;
}
```

## Advanced Theming

### Custom Logo

Add a logo to the navbar by editing `scripts/build.js`:

```javascript
// In generateHTML function, replace navbar-brand:
<a class="navbar-brand" href="${config.baseUrl}">
  <img src="${config.baseUrl}theme/logo.svg" alt="${config.title}" class="navbar-logo">
  <span>${config.navbar.title}</span>
</a>
```

Then add CSS:

```css
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navbar-logo {
  height: 32px;
  width: auto;
}
```

### Custom Dark Mode Toggle Icons

Edit `scripts/build.js` to customize the SVG icons in the theme toggle button.

### Animations

#### Smooth Page Transitions

```css
article {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Animated Sidebar Links

```css
.sidebar-category-items a {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-category-items a:hover {
  transform: translateX(5px);
}
```

#### Hover Effects

```css
.navbar-links a {
  position: relative;
  transition: color 0.3s;
}

.navbar-links a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s;
}

.navbar-links a:hover::after {
  width: 100%;
}
```

### Custom Admonitions

Add a new "success" admonition type:

```css
.admonition-success {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.admonition-success .admonition-heading {
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}
```

Then use in markdown:

```markdown
> **✅ Success:** Your operation completed successfully!
```

### Print Styles

Optimize for printing:

```css
@media print {
  .navbar,
  .sidebar,
  .toc-sidebar,
  .copy-code-button,
  .theme-toggle {
    display: none !important;
  }

  .content {
    margin-left: 0;
    max-width: 100%;
  }

  article {
    color: black;
    background: white;
  }
}
```

## Theme Presets

### Minimal Theme

```css
:root {
  --primary-color: #000000;
  --text-color: #000000;
  --bg-color: #ffffff;
  --sidebar-bg: #ffffff;
  --border-color: #e5e7eb;
}

* {
  border-radius: 0 !important;
}

.navbar {
  border-bottom: 2px solid #000000;
}

.sidebar {
  border-right: 2px solid #000000;
}
```

### Colorful Theme

```css
:root {
  --primary-color: #ec4899;
  --text-color: #1f2937;
  --bg-color: #fef3c7;
  --sidebar-bg: #fde68a;
  --border-color: #fbbf24;
}

.navbar {
  background: linear-gradient(to right, #ec4899, #8b5cf6);
}

.sidebar {
  background: linear-gradient(to bottom, #fde68a, #fcd34d);
}
```

### High Contrast Theme

```css
:root {
  --primary-color: #0000ff;
  --text-color: #000000;
  --bg-color: #ffffff;
  --sidebar-bg: #f0f0f0;
  --border-color: #000000;
}

a {
  text-decoration: underline;
}

button {
  border: 2px solid #000000;
}
```

## Responsive Design

The theme is mobile-first. Customize breakpoints:

```css
/* Mobile (default) */
/* Styles apply to all screen sizes */

/* Tablet and up */
@media (min-width: 768px) {
  .content {
    padding: 3rem;
  }
}

/* Desktop and up */
@media (min-width: 996px) {
  .sidebar {
    display: block;
  }
}

/* Large desktop */
@media (min-width: 1400px) {
  .toc-sidebar {
    display: block;
  }
}
```

### Mobile-Specific Styles

```css
@media (max-width: 640px) {
  /* Larger touch targets */
  .navbar-links a,
  .sidebar-category-items a {
    padding: 1rem;
    font-size: 1.125rem;
  }

  /* Stack search */
  .search-container {
    width: 100%;
    margin: 1rem 0;
  }
}
```

## Browser Compatibility

The theme uses modern CSS features. For older browsers, add fallbacks:

```css
/* CSS Variables fallback */
.navbar {
  background: #ffffff;  /* Fallback */
  background: var(--bg-color);
}

/* Grid fallback */
.container {
  display: flex;  /* Fallback */
  display: grid;
}
```

## Testing Your Theme

### Check All Pages

```bash
# Build and serve
npm run build
npm run serve

# Visit http://localhost:3000
# Test all pages, dark mode, mobile view
```

### Dark Mode Testing

1. Toggle dark mode button
2. Check all components render correctly
3. Verify contrast ratios (use browser DevTools)
4. Test system preference detection

### Responsive Testing

```bash
# Chrome DevTools
# Press F12 → Toggle device toolbar (Ctrl+Shift+M)
# Test: Mobile, Tablet, Desktop sizes
```

### Color Contrast

Use tools to verify accessibility:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse audit
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

**WCAG AA Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

## Tips & Best Practices

1. **Use CSS variables** - Makes theme switching easy
2. **Test dark mode** - Always test both light and dark themes
3. **Mobile-first** - Design for mobile, enhance for desktop
4. **Accessibility** - Maintain good color contrast
5. **Performance** - Avoid heavy animations on mobile
6. **Consistency** - Use the same spacing, colors throughout
7. **Documentation** - Comment your custom styles

## Troubleshooting

### Changes Not Showing

```bash
# Clear browser cache (Ctrl+Shift+R)
# Rebuild the site
rm -rf build/
npm run build
```

### Dark Mode Not Working

Check that CSS variables are defined in both `:root` and `[data-theme="dark"]`.

### Layout Breaking

Verify you're using CSS grid/flexbox fallbacks for older browsers.

### Colors Look Wrong

Check that you're using CSS variables, not hard-coded colors.

## Examples

See these files for theming examples:

- `theme/styles.css` - Main theme file
- `scripts/build.js` - HTML template generation

## Need Help?

For theming questions:

1. Check the [Troubleshooting Guide](troubleshooting)
2. Search [GitHub Issues](https://github.com/haggistech/doc-system/issues)
3. Create a new issue with your custom CSS
