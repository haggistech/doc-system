# Documentation System

A lightweight, Docusaurus-like static site generator for creating beautiful documentation sites that can be hosted on GitHub Pages or GitLab Pages.

## Features

- **Markdown-based**: Write documentation in simple Markdown
- **Syntax Highlighting**: Beautiful code blocks with 190+ language support via Highlight.js
- **Copy Code Button**: One-click copy with visual feedback on all code blocks
- **Enhanced Search**: Instant search with keyboard navigation, smart scoring, and highlighted matches
- **Mobile Sidebar Toggle**: Hamburger menu with smooth slide-in animation for mobile devices
- **Breadcrumb Navigation**: Automatic breadcrumbs showing current location in documentation
- **Last Updated Timestamp**: Auto-generated from Git history on each page
- **Static Site Generation**: Fast, static HTML pages
- **Responsive Design**: Mobile-friendly interface with optimized touch interactions
- **Sidebar Navigation**: Automatic navigation generation
- **Versioning**: Maintain multiple documentation versions like Docusaurus
- **Git-friendly**: Version control everything
- **Easy Deployment**: Deploy to GitHub/GitLab Pages with ease

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve built site
npm run serve

# Create a new version
npm run version 1.0.0
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
  },
  "sidebar": [
    {
      "type": "category",
      "label": "Getting Started",
      "items": ["intro", "installation"]
    }
  ]
}
```

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

## Versioning

Maintain multiple versions of your documentation, just like Docusaurus:

```bash
# Create a new version (e.g., 1.0.0)
npm run version 1.0.0
```

This will:
- Copy current `docs/` to `versioned_docs/version-1.0.0/`
- Save sidebar configuration to `versioned_sidebars/`
- Update `config.json` with version information
- Add a version selector dropdown in the navbar

You can continue editing `docs/` for the next version while users can still access older versions via the version dropdown.

**Learn more**: See the [Versioning Guide](docs/guides/versioning.md) for detailed information.

## Deployment

### GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

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

## Requirements

- Node.js 16 or higher
- npm or yarn

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
