# Documentation System

[![CI](https://github.com/haggistech/doc-system/actions/workflows/ci.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/ci.yml)
[![Deploy](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-141%20passing-brightgreen.svg)](https://github.com/haggistech/doc-system)
[![Built with](https://img.shields.io/badge/built%20with-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/haggistech/doc-system/pulls)

A lightweight, Docusaurus-like static site generator for creating beautiful documentation sites that can be hosted on GitHub Pages or GitLab Pages.

## Features

### 🎨 Modern UI/UX
- **Dark Mode**: Automatic theme detection with manual toggle, smooth transitions, and localStorage persistence
- **Responsive Design**: Mobile-first design that works beautifully on all devices
- **Mobile Sidebar Toggle**: Hamburger menu with smooth slide-in animation
- **Table of Contents**: Auto-generated TOC with scroll spy for easy navigation

### 📝 Content & Authoring
- **Markdown-based**: Write documentation in simple Markdown with frontmatter support
- **Enhanced Code Blocks**: Syntax highlighting with 190+ languages, code block titles, line highlighting, and toggleable line numbers
- **Tabs Component**: Show code examples in multiple languages/frameworks with interactive tabs
- **Copy Code Button**: One-click copy with visual feedback on all code blocks
- **Image Support**: Automatic image copying with validation and broken image detection
- **Admonitions**: Note, warning, tip, danger, and info callouts

### 🔍 Search & Navigation
- **Fuzzy Search**: Powered by Fuse.js with typo tolerance and configurable sensitivity
- **Full-text Search**: Search across titles, descriptions, and content with smart ranking
- **Keyboard Shortcuts**: `Ctrl/Cmd + K` to search, arrow keys to navigate
- **Recent Searches**: Remembers your recent searches with localStorage
- **Breadcrumb Navigation**: Automatic breadcrumbs showing current location
- **Auto-Generated Sidebar**: Sidebar built from folder structure automatically

### 🛠️ Developer Experience
- **Modular Architecture**: Clean separation of concerns with focused modules
- **Internal Link Validation**: Automatic detection of broken links during build
- **Git Metadata**: Last updated timestamps auto-generated from Git history
- **Hot Reload**: Development server with automatic rebuilding
- **Comprehensive Test Suite**: 141 unit and integration tests with 100% pass rate
- **Static Site Generation**: Fast, optimized static HTML pages

### 🚀 Deployment
- **Git-friendly**: Version control everything with GitHub tags for versioning
- **Easy Deployment**: Deploy to GitHub/GitLab Pages with ease
- **Docker Ready**: Containerized deployment support

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

# Start development server
npm run dev

# Build for production
npm run build

# Serve built site
npm run serve
```

## Project Structure

```
doc-system/
├── docs/                  # Your markdown documentation files
│   ├── intro.md
│   ├── installation.md
│   └── guides/
│       ├── configuration.md
│       └── deployment.md
├── theme/                 # Site styling and scripts
│   ├── styles.css
│   ├── search.js          # Fuzzy search with Fuse.js
│   ├── dark-mode.js
│   ├── toc.js
│   ├── copy-code.js
│   ├── line-numbers.js
│   └── tabs.js
├── scripts/               # Build and development scripts
│   ├── build.js           # Main build orchestrator
│   ├── dev.js             # Development server with hot reload
│   ├── serve.js           # Production server
│   └── lib/               # Modular build components
│       ├── git-metadata.js        # Git date/author extraction
│       ├── link-validator.js      # Internal link checking
│       ├── image-processor.js     # Image extraction/copying
│       ├── markdown-processor.js  # Marked config, extensions
│       ├── navigation-builder.js  # Sidebar, breadcrumbs, pagination
│       └── page-generator.js      # HTML template generation
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── config.json            # Site configuration
└── package.json
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

## Creating Documentation

1. Add Markdown files to the `docs/` folder
2. Include frontmatter in each file:

```markdown
---
title: Page Title
description: Page description
---

# Page Title

Your content here...
```

3. The sidebar updates automatically based on folder structure

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

### Styling

Edit `theme/styles.css` to customize the appearance. CSS variables are defined at the top:

```css
:root {
  --primary-color: #2563eb;
  --text-color: #1f2937;
  --bg-color: #ffffff;
  /* ... */
}
```

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
| `build.js` | Main orchestrator, file discovery, asset copying |
| `markdown-processor.js` | Marked configuration, admonitions, tabs, code blocks |
| `git-metadata.js` | Extract creation/update dates from git history |
| `link-validator.js` | Find and validate internal markdown links |
| `image-processor.js` | Extract image references, validate, copy to output |
| `navigation-builder.js` | Generate sidebar, breadcrumbs, pagination |
| `page-generator.js` | Generate complete HTML pages from templates |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
