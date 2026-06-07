# Documentation System

[![CI](https://github.com/haggistech/doc-system/actions/workflows/ci.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/ci.yml)
[![Deploy](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-141%20passing-brightgreen.svg)](https://github.com/haggistech/doc-system)
[![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Built with](https://img.shields.io/badge/built%20with-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/haggistech/doc-system/pulls)

A lightweight, Docusaurus-like static site generator for creating beautiful, accessible documentation sites. **100% WCAG 2.1 AA compliant** with support for multiple versions, citations, API docs, and more. Deploy to GitHub/GitLab Pages with zero additional dependencies.

## ✨ Highlights

- ✅ **WCAG 2.1 AA Compliant**: 100/100 accessibility score across all pages
- 🚀 **Blazing Fast**: 7-27% smaller files with automatic minification and fingerprinting
- 📚 **Multi-Version Docs**: Support documentation for multiple versions of your project
- 🔬 **API Docs**: Auto-generate API reference documentation from JSDoc comments
- 📖 **Citations & Bibliography**: Full citation support with bibliography generation
- 📝 **Automatic Changelog**: Generate changelogs from git tags and conventional commits
- 💬 **User Feedback**: Built-in feedback widget for reader engagement
- 🎨 **Custom Branding**: Logo, favicon, and complete theming control
- 📊 **Zero Dependencies**: All core features built without external npm packages

## Features

### 🎨 Modern UI/UX
- **Dark Mode**: Automatic theme detection with manual toggle, smooth transitions, and localStorage persistence
- **Responsive Design**: Mobile-first design that works beautifully on all devices
- **Mobile Sidebar Toggle**: Hamburger menu with smooth slide-in animation
- **Table of Contents**: Auto-generated TOC with scroll spy and heading anchor links
- **Image Lightbox**: Click images to view in full screen with overlay
- **Mermaid Diagrams**: Built-in support for Mermaid diagram rendering

### 📝 Content & Authoring
- **Markdown-based**: Write documentation in simple Markdown with frontmatter support
- **Enhanced Code Blocks**: Syntax highlighting with 50+ languages, line numbers, copy button
- **Tabs Component**: Show code examples in multiple languages/frameworks with interactive tabs
- **Copy Code Button**: One-click copy with visual feedback on all code blocks
- **Image Support**: Automatic image copying with validation and broken image detection
- **Admonitions**: Note, warning, tip, danger, and info callouts
- **Citations**: Reference external sources with automatic bibliography generation
- **Frontmatter Overrides**: Override author, created, and lastUpdated per document

### 🔍 Search & Navigation
- **Fuzzy Search**: Powered by Fuse.js with typo tolerance and configurable sensitivity
- **Full-text Search**: Search across titles, descriptions, and content with smart ranking
- **Keyboard Shortcuts**: `Ctrl/Cmd + K` to search, arrow keys to navigate
- **Recent Searches**: Remembers your recent searches with localStorage
- **Breadcrumb Navigation**: Automatic breadcrumbs showing current location
- **Auto-Generated Sidebar**: Sidebar built from folder structure automatically
- **Pagination**: Next/Previous page navigation

### 🛠️ Developer Experience
- **Modular Architecture**: Clean separation of concerns with focused modules
- **Internal Link Validation**: Automatic detection of broken links during build
- **Git Metadata**: Last updated timestamps auto-generated from Git history
- **API Documentation**: Auto-generate API docs from JSDoc comments (`npm run api-docs`)
- **Changelog Generation**: Auto-generate changelogs from git tags (`npm run changelog`)
- **Accessibility Audit**: Run accessibility checks on all pages (`npm run audit:a11y`)
- **Hot Reload**: Development server with automatic rebuilding
- **Comprehensive Test Suite**: 141 unit and integration tests with 100% pass rate
- **Static Site Generation**: Fast, optimized static HTML pages with minification

### 🚀 Deployment & Performance
- **Git-friendly**: Version control everything with GitHub tags for versioning
- **Easy Deployment**: Deploy to GitHub/GitLab Pages with ease
- **Docker Ready**: Containerized deployment support
- **Asset Optimization**: HTML/CSS/JS minification with 7-27% size reduction
- **Cache Busting**: Asset fingerprinting with 1-year cache headers
- **Performance**: Critical CSS extraction and script defer/async optimization

### ♿ Accessibility
- **WCAG 2.1 AA Compliance**: 100/100 score across all pages
- **Semantic HTML**: Proper landmarks, heading hierarchy, and form labels
- **Screen Reader Friendly**: Alt text, ARIA labels, and proper document structure
- **Keyboard Navigation**: Full keyboard support throughout the site
- **Color Contrast**: 4.5:1 contrast ratio for text (WCAG AAA compliant)
- **Mobile Accessible**: Responsive design with touch-friendly targets

## Requirements

- **Node.js**: >= 22.0.0 (LTS recommended)
- **npm**: >= 10.0.0

If using NVM, you can install and use the correct version:
```bash
nvm install 22
nvm use
```

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Serve built site locally
npm run serve

# Optional: Generate API documentation from JSDoc
npm run api-docs

# Optional: Generate changelog from git tags
npm run changelog

# Optional: Run accessibility audit (WCAG 2.1 AA)
npm run audit:a11y
```

## Project Structure

```
doc-system/
├── docs/                  # Your markdown documentation files
│   ├── intro.md
│   ├── installation.md
│   └── guides/            # Feature guides and documentation
│       ├── accessibility.md
│       ├── api-reference.md
│       ├── citations-example.md
│       ├── configuration.md
│       ├── deployment.md
│       └── optimization.md
├── theme/                 # Site styling and client scripts
│   ├── styles.css         # Main styles with CSS variables
│   ├── search.js          # Fuzzy search with Fuse.js
│   ├── dark-mode.js       # Theme switching
│   ├── toc.js             # Table of contents scroll spy
│   ├── copy-code.js       # Code block copy button
│   ├── line-numbers.js    # Code block line numbers
│   ├── tabs.js            # Tab component functionality
│   ├── feedback.js        # User feedback widget
│   └── lightbox.js        # Image lightbox
├── scripts/               # Build and development scripts
│   ├── build.js           # Main build orchestrator with optimization
│   ├── dev.js             # Development server with hot reload
│   ├── serve.js           # Production server
│   ├── api-docs.js        # API documentation generator
│   ├── audit-accessibility.js  # WCAG 2.1 AA compliance auditor
│   ├── changelog.js       # Changelog generator from git tags
│   └── lib/               # Modular build components
│       ├── git-metadata.js        # Git date/author extraction
│       ├── link-validator.js      # Internal link checking
│       ├── image-processor.js     # Image extraction/copying
│       ├── markdown-processor.js  # Marked config, extensions, TOC
│       ├── navigation-builder.js  # Sidebar, breadcrumbs, pagination
│       ├── page-generator.js      # HTML template generation
│       ├── accessibility-auditor.js   # WCAG compliance checks
│       ├── api-generator.js       # JSDoc to API docs converter
│       ├── changelog-generator.js # Git tag changelog builder
│       ├── citation-processor.js  # Citation and bibliography handler
│       ├── minifier.js            # HTML/CSS/JS minification
│       └── version-builder.js     # Multi-version documentation
├── tests/                 # Test suite (141 tests)
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── config.json            # Site configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Configuration

Edit `config.json` to customize your site:

```json
{
  "title": "Documentation Site",
  "description": "A modern documentation system",
  "baseUrl": "/",
  "docsDir": "docs",
  "outputDir": "build",
  "search": {
    "maxResults": 10,
    "fuzzyThreshold": 0.3,
    "minMatchLength": 2
  },
  "navbar": {
    "title": "Docs",
    "links": [
      { "label": "Documentation", "to": "/docs/intro" },
      { "label": "GitHub", "href": "https://github.com/your-repo" }
    ]
  },
  "footer": {
    "copyright": "Built with Doc System"
  }
}
```

### Search Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `maxResults` | 10 | Maximum number of search results to display |
| `fuzzyThreshold` | 0.3 | Match sensitivity (0 = exact only, 1 = match anything) |
| `minMatchLength` | 2 | Minimum characters before search activates |

**Note:** The sidebar is automatically generated from your folder structure in the `docs/` directory:
- Root-level markdown files appear under "Getting Started"
- Subdirectories become separate categories (e.g., `docs/guides/` → "Guides" category)
- Files are listed alphabetically within each category
- Titles come from the `title:` field in each file's frontmatter

## Advanced Features

### 🔬 API Documentation Generation

Auto-generate API reference documentation from JSDoc comments:

```bash
npm run api-docs
```

Add JSDoc comments to your source code:
```javascript
/**
 * Fetch user data from the API
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} User data object
 * @throws {Error} If user not found
 */
export function getUser(userId) { ... }
```

### 📚 Multi-Version Documentation

Support documentation for multiple versions of your project:

```json
{
  "versions": {
    "current": "2.0",
    "available": ["2.0", "1.5", "1.0"]
  }
}
```

Users can switch between versions using the version selector dropdown.

### 📖 Citations & Bibliography

Add citations to your documentation:

```markdown
According to Smith et al. [citation:smith_2020], this approach is effective.

---
bibliography:
  smith_2020:
    authors: ["John Smith", "Jane Doe"]
    year: 2020
    title: "Effective Documentation"
    publication: "Technical Review"
    url: "https://example.com"
```

### 📝 Automatic Changelog

Generate changelogs from git tags and conventional commits:

```bash
npm run changelog
```

Uses commit messages like:
- `feat: Add new feature`
- `fix: Bug fix`
- `docs: Documentation update`
- `breaking: Major breaking change`

### ♿ Accessibility Auditing

Run WCAG 2.1 AA compliance audit:

```bash
npm run audit:a11y
```

Checks for:
- Heading hierarchy and structure
- Image alt text
- Form labels
- Link text descriptiveness
- Semantic HTML landmarks
- Color contrast
- And more!

## Creating Documentation

1. Add Markdown files to the `docs/` folder
2. Include frontmatter in each file:

```markdown
---
title: Page Title
description: Page description
author: Your Name           # Optional: override author
created: 2024-01-01       # Optional: override creation date
lastUpdated: 2024-06-07   # Optional: override last update date
---

# Page Title

Your content here...
```

3. The sidebar updates automatically based on folder structure
4. Use citations with `[citation:key]` syntax for bibliography

## Deployment

### GitHub Pages (Automated)

This project includes automated CI/CD workflows:

**Setup Steps:**
1. Go to your repository **Settings** → **Pages**
2. Under "Build and deployment", select **Source**: `GitHub Actions`
3. Push to `master` branch - deployment happens automatically!

**What happens:**
- ✅ Tests run on every push and PR
- ✅ Build verification on commits
- ✅ Automatic deployment to GitHub Pages on master
- ✅ Build reports and statistics

The included workflows (`.github/workflows/`):
- `ci.yml` - Runs tests, builds, security audits
- `deploy.yml` - Deploys to GitHub Pages
- `smart-tag.yml` - Automatic version tagging

### GitLab Pages

Create `.gitlab-ci.yml`:

```yaml
image: node:22

pages:
  script:
    - npm install
    - npm run build
    - mv build public
  artifacts:
    paths:
      - public
  only:
    - main
```

## Development

```bash
# Development mode with hot reload
npm run dev

# Build static site
npm run build

# Preview production build
npm run serve
```

The development server will:
- Build your site
- Start a local server at http://localhost:3000
- Watch for changes and rebuild automatically

## Customization

### Custom Branding

Add your logo and favicon to the configuration:

```json
{
  "branding": {
    "favicon": "theme/favicon.ico",
    "logo": "theme/logo.svg",
    "logoAlt": "Your Company Logo"
  }
}
```

The logo will appear in the navbar and can be styled via CSS variables.

### Styling

Edit `theme/styles.css` to customize the appearance. CSS variables are defined at the top:

```css
:root {
  --primary-color: #2563eb;        /* Links, buttons, highlights */
  --text-color: #1f2937;           /* Main text color */
  --bg-color: #ffffff;             /* Page background */
  --sidebar-bg: #f9fafb;           /* Sidebar background */
  --border-color: #e5e7eb;         /* Borders and dividers */
  --code-bg: #f3f4f6;              /* Code block background */
  --heading-color: #111827;        /* Heading text color */
  --link-hover: #1d4ed8;           /* Link hover state */
  --navbar-height: 60px;           /* Navbar height */
  --sidebar-width: 280px;          /* Sidebar width */
}

/* Dark mode colors */
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --text-color: #e5e7eb;
  /* ... */
}
```

### Performance Optimization

The build process automatically:
- **Minifies** HTML, CSS, and JavaScript (7-27% reduction)
- **Fingerprints** assets with content hashes for cache busting
- **Extracts** critical CSS for faster initial rendering
- **Defers** non-critical scripts for better performance

No configuration needed - optimization happens automatically during build!

### Search

The search is powered by [Fuse.js](https://fusejs.io/) for fuzzy matching with typo tolerance.

**Features:**
- Fuzzy matching (typo tolerance)
- Instant search as you type
- Keyboard shortcuts: `Ctrl/Cmd + K` to focus, `↑↓` to navigate, `Enter` to open
- Results ranked by relevance (title > description > content > slug)
- Highlighted search terms in results
- Configurable result limit and sensitivity

**Customization:**
Edit search settings in `config.json`:

```json
{
  "search": {
    "maxResults": 15,
    "fuzzyThreshold": 0.4,
    "minMatchLength": 3
  }
}
```

### Syntax Highlighting

Code blocks use Highlight.js with the GitHub Dark theme by default.

**Change the theme:**
Edit `scripts/build.js` and change the theme file:

```javascript
// Available: github, github-dark, monokai, atom-one-dark, vs2015, etc.
const highlightCssSource = path.join(
  rootDir,
  'node_modules',
  'highlight.js',
  'styles',
  'github-dark.css'  // Change this
);
```

Browse all themes: [Highlight.js Demo](https://highlightjs.org/static/demo/)

## Architecture

The build system is organized into focused modules for maintainability:

| Module | Purpose |
|--------|---------|
| `build.js` | Main orchestrator, file discovery, asset copying, minification |
| `markdown-processor.js` | Marked configuration, extensions, TOC generation, citations |
| `page-generator.js` | Generate complete HTML pages from templates |
| `git-metadata.js` | Extract creation/update dates from git history |
| `link-validator.js` | Find and validate internal markdown links |
| `image-processor.js` | Extract image references, validate, copy to output |
| `navigation-builder.js` | Generate sidebar, breadcrumbs, pagination |
| `accessibility-auditor.js` | WCAG 2.1 AA compliance checking (8+ checks) |
| `api-generator.js` | JSDoc to API documentation converter |
| `changelog-generator.js` | Git tag and conventional commit parser |
| `citation-processor.js` | Citation extraction and bibliography generation |
| `minifier.js` | HTML/CSS/JS minification (zero dependencies) |
| `version-builder.js` | Multi-version documentation support |

All build modules are designed to be:
- **Zero-dependency**: No external npm packages needed
- **Testable**: Full test coverage with 141 passing tests
- **Maintainable**: Single responsibility with clear interfaces
- **Performant**: Optimized for large documentation sites

## What Makes This Special

### ✅ Accessibility First
We built accessibility into the core. Every page is **WCAG 2.1 AA compliant** with 100/100 accessibility scores:
- Semantic HTML with proper landmarks
- Full keyboard navigation support
- Screen reader optimized
- High color contrast (WCAG AAA compliant for text)
- Proper heading hierarchy
- Form labels for all inputs
- Descriptive link text
- Alt text for images

Run `npm run audit:a11y` to verify accessibility on your documentation.

### 📦 Zero External Dependencies (Core)
The core build system uses **zero npm packages**:
- No minifiers
- No bundlers
- No HTML parsers
- All features implemented with pure Node.js and regex

This makes the system:
- Fast and lightweight
- Secure (no supply chain vulnerabilities)
- Easy to understand and modify
- Maintainable long-term

(Optional dependencies like Marked and Fuse.js are for markdown parsing and search, but the core system works without them)

### 🚀 Production Ready
- **141 test cases** with 100% pass rate
- **Git integration** for automatic versioning and metadata
- **CI/CD workflows** for GitHub/GitLab
- **Performance optimized** with 7-27% file size reduction
- **Scalable** - works with 100s of documentation pages

## Documentation

See the [guides](docs/guides/) for detailed documentation:
- [Accessibility Guide](docs/guides/accessibility.md)
- [Advanced Features](docs/guides/advanced-features.md)
- [Configuration](docs/guides/configuration.md)
- [Performance Optimization](docs/guides/optimization.md)
- [Deployment](docs/guides/deployment.md)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **Issues**: [GitHub Issues](https://github.com/haggistech/doc-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/haggistech/doc-system/discussions)
- **Documentation**: [Online Docs](https://haggistech.github.io/doc-system/)
