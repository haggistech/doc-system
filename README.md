# Documentation System

[![CI](https://github.com/haggistech/doc-system/actions/workflows/ci.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/ci.yml)
[![Deploy](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/haggistech/doc-system/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-90%20passing-brightgreen.svg)](https://github.com/haggistech/doc-system)
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
- **Syntax Highlighting**: Beautiful code blocks with 190+ language support via Highlight.js
- **Copy Code Button**: One-click copy with visual feedback on all code blocks
- **Image Support**: Automatic image copying with validation and broken image detection
- **Admonitions**: Note, warning, tip, danger, and info callouts

### 🔍 Search & Navigation
- **Enhanced Search**: Full-text search with content previews and recent searches
- **Keyboard Shortcuts**: `Ctrl/Cmd + K` to search, arrow keys to navigate
- **Breadcrumb Navigation**: Automatic breadcrumbs showing current location
- **Auto-Generated Sidebar**: Sidebar built from folder structure automatically

### 🛠️ Developer Experience
- **Internal Link Validation**: Automatic detection of broken links during build
- **Git Metadata**: Last updated timestamps auto-generated from Git history
- **Hot Reload**: Development server with automatic rebuilding
- **Comprehensive Test Suite**: 90 unit and integration tests with 100% pass rate
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
├── docs/              # Your markdown documentation files
│   ├── intro.md
│   ├── installation.md
│   └── guides/
│       ├── configuration.md
│       └── deployment.md
├── theme/             # Site styling and scripts
│   ├── styles.css
│   └── search.js
├── scripts/           # Build and development scripts
│   ├── build.js       # Static site generator
│   ├── dev.js         # Development server with hot reload
│   └── serve.js       # Production server
├── config.json        # Site configuration
└── package.json
```

## Configuration

Edit `config.json` to customize your site:

```json
{
  "title": "Documentation Site",
  "description": "A modern documentation system",
  "baseUrl": "/",
  "navbar": {
    "title": "Docs",
    "links": [...]
  }
}
```

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

3. Update the sidebar in `config.json`

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
image: node:18

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

The enhanced search is powered by client-side JavaScript with smart scoring and keyboard navigation:

**Features:**
- Instant search as you type
- Keyboard shortcuts: `Ctrl/Cmd + K` to focus, `↑↓` to navigate, `Enter` to open
- Results ranked by relevance (title > description > path)
- Highlighted search terms in results
- Maximum 8 top results

**Customization:**
Edit `theme/search.js` to modify search behavior, scoring, or result limit.

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
