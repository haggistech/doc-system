---
title: Migration Guide
description: Migrate from other documentation systems to doc-system
---

# Migration Guide

This guide helps you migrate from other popular documentation systems to doc-system.

## Quick Comparison

| Feature | doc-system | Docusaurus | VuePress | MkDocs |
|---------|-----------|------------|----------|---------|
| **Language** | Node.js | Node.js | Node.js | Python |
| **Markdown** | ✅ | ✅ | ✅ | ✅ |
| **Dark Mode** | ✅ | ✅ | ✅ | ✅ |
| **Search** | Client-side | Algolia | Built-in | Built-in |
| **Build Time** | Fast | Medium | Medium | Fast |
| **Size** | ~5MB | ~200MB | ~50MB | ~10MB |
| **Learning Curve** | Easy | Medium | Easy | Easy |

## Migrating from Docusaurus

### Overview

Docusaurus and doc-system share similar philosophies but doc-system is more lightweight.

### File Structure Mapping

**Docusaurus:**
```
my-website/
├── docs/
├── blog/
├── src/
│   └── pages/
├── static/
├── docusaurus.config.js
└── sidebars.js
```

**doc-system:**
```
doc-system/
├── docs/
├── theme/
├── scripts/
└── config.json
```

### Configuration Migration

**Docusaurus (`docusaurus.config.js`):**
```javascript
module.exports = {
  title: 'My Site',
  tagline: 'The tagline of my site',
  url: 'https://mysite.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook',
  projectName: 'docusaurus',
  themeConfig: {
    navbar: {
      title: 'My Site',
      links: [
        {to: 'docs/intro', label: 'Docs', position: 'left'},
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} My Project`,
    },
  },
};
```

**doc-system (`config.json`):**
```json
{
  "title": "My Site",
  "description": "The tagline of my site",
  "baseUrl": "/",
  "navbar": {
    "title": "My Site",
    "links": [
      {
        "label": "Docs",
        "to": "/docs/intro"
      }
    ]
  },
  "footer": {
    "copyright": "Copyright © 2025 My Project"
  }
}
```

### Sidebar Migration

**Docusaurus (`sidebars.js`):**
```javascript
module.exports = {
  docs: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Guides',
      items: ['guides/configuration', 'guides/deployment'],
    },
  ],
};
```

**doc-system (auto-generated from folder structure):**
- No manual sidebar configuration needed!
- Just organize your `docs/` folder:
  ```
  docs/
  ├── intro.md
  ├── installation.md
  └── guides/
      ├── configuration.md
      └── deployment.md
  ```

### Content Migration Steps

1. **Copy markdown files:**
   ```bash
   # Copy all docs
   cp -r docusaurus-site/docs/* doc-system/docs/
   ```

2. **Update frontmatter:**
   - Both use similar frontmatter
   - Remove Docusaurus-specific fields:
   ```markdown
   ---
   # Keep these:
   title: Page Title
   description: Page description

   # Remove these (Docusaurus-specific):
   id: page-id
   slug: /custom-url
   sidebar_label: Short Name
   sidebar_position: 1
   ---
   ```

3. **Update MDX to Markdown:**
   - doc-system uses pure Markdown (not MDX)
   - Convert React components to HTML/Markdown:

   **Docusaurus (MDX):**
   ```mdx
   import Tabs from '@theme/Tabs';
   import TabItem from '@theme/TabItem';

   <Tabs>
     <TabItem value="js" label="JavaScript">
       JavaScript code
     </TabItem>
   </Tabs>
   ```

   **doc-system (Markdown):**
   ```markdown
   **JavaScript:**
   ```javascript
   // JavaScript code
   ```

   **Python:**
   ```python
   # Python code
   ```
   ```

4. **Update asset paths:**
   ```markdown
   <!-- Docusaurus -->
   ![Logo](/img/logo.png)

   <!-- doc-system -->
   ![Logo](images/logo.png)
   ```

5. **Copy images:**
   ```bash
   cp -r docusaurus-site/static/img/* doc-system/docs/images/
   ```

### Features Not in doc-system

**Blog:**
- Docusaurus has built-in blog support
- For doc-system, consider adding a separate blog platform

**Versioning:**
- Docusaurus supports multiple doc versions
- Use Git branches/tags for versioning in doc-system

**i18n (Internationalization):**
- Not built-in to doc-system
- Consider separate language branches

**React Components:**
- Docusaurus uses MDX
- Use HTML directly in Markdown instead

### Deployment Migration

Both support GitHub Pages similarly:

**Docusaurus:**
```bash
GIT_USER=<username> npm run deploy
```

**doc-system:**
```bash
# Uses GitHub Actions (automated)
git push origin master
```

## Migrating from VuePress

### Overview

VuePress and doc-system are both lightweight, but doc-system has no framework dependencies.

### Configuration Migration

**VuePress (`.vuepress/config.js`):**
```javascript
module.exports = {
  title: 'My Site',
  description: 'My description',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: [
      '/',
      '/guide/',
      '/config/'
    ]
  }
}
```

**doc-system (`config.json`):**
```json
{
  "title": "My Site",
  "description": "My description",
  "navbar": {
    "title": "My Site",
    "links": [
      { "label": "Guide", "to": "/docs/guide" }
    ]
  }
}
```

### Content Migration Steps

1. **Copy markdown files:**
   ```bash
   cp -r vuepress-site/docs/* doc-system/docs/
   ```

2. **Update frontmatter:**
   ```markdown
   ---
   # Keep:
   title: Page Title
   description: Description

   # Remove (VuePress-specific):
   sidebar: auto
   sidebarDepth: 2
   ---
   ```

3. **Remove Vue components:**

   **VuePress:**
   ```markdown
   <Badge text="beta" type="warning"/>
   ```

   **doc-system:**
   ```markdown
   > **⚠️ Warning:** This feature is in beta
   ```

4. **Update custom containers:**

   **VuePress:**
   ```markdown
   ::: tip
   This is a tip
   :::
   ```

   **doc-system:**
   ```markdown
   > **💡 Tip:** This is a tip
   ```

### File Structure Changes

**VuePress:**
```
docs/
├── .vuepress/
│   ├── config.js
│   ├── public/
│   └── styles/
└── README.md
```

**doc-system:**
```
.
├── docs/
│   └── intro.md
├── theme/
│   └── styles.css
└── config.json
```

## Migrating from MkDocs

### Overview

MkDocs is Python-based, doc-system is Node.js-based.

### Prerequisites

Install Node.js:
```bash
# If coming from Python/MkDocs
nvm install 22
nvm use 22
```

### Configuration Migration

**MkDocs (`mkdocs.yml`):**
```yaml
site_name: My Docs
nav:
  - Home: index.md
  - About: about.md
  - Guides:
    - Installation: guides/installation.md
    - Configuration: guides/configuration.md
theme:
  name: material
```

**doc-system (`config.json`):**
```json
{
  "title": "My Docs",
  "navbar": {
    "title": "My Docs",
    "links": [
      { "label": "About", "to": "/docs/about" }
    ]
  }
}
```

### Content Migration Steps

1. **Copy markdown files:**
   ```bash
   cp -r mkdocs-site/docs/* doc-system/docs/
   ```

2. **Rename index.md:**
   ```bash
   mv docs/index.md docs/intro.md
   ```

3. **Update admonitions:**

   **MkDocs:**
   ```markdown
   !!! note
       This is a note

   !!! warning "Custom Title"
       This is a warning
   ```

   **doc-system:**
   ```markdown
   > **📝 Note:** This is a note

   > **⚠️ Custom Title:** This is a warning
   ```

4. **Update code blocks:**
   - Both use fenced code blocks
   - Syntax is the same:
   ```markdown
   ```python
   print("Hello")
   ```
   ```

### Deployment Changes

**MkDocs:**
```bash
mkdocs gh-deploy
```

**doc-system:**
```bash
# Setup GitHub Actions (one time)
# Then just push:
git push origin master
```

## Migrating from GitBook

### Overview

GitBook is a commercial platform, doc-system is open-source and self-hosted.

### File Structure

**GitBook:**
```
.
├── README.md
├── SUMMARY.md
└── chapters/
    ├── chapter1.md
    └── chapter2.md
```

**doc-system:**
```
.
├── docs/
│   ├── intro.md (was README.md)
│   └── chapters/
│       ├── chapter1.md
│       └── chapter2.md
├── theme/
└── config.json
```

### Migration Steps

1. **Export from GitBook:**
   - Go to Settings → Export → GitHub
   - Or manually copy markdown files

2. **Restructure files:**
   ```bash
   mkdir -p doc-system/docs
   cp README.md doc-system/docs/intro.md
   cp -r chapters/ doc-system/docs/chapters/
   ```

3. **Convert SUMMARY.md:**
   - GitBook uses `SUMMARY.md` for navigation
   - doc-system auto-generates from folder structure
   - No manual conversion needed!

4. **Update internal links:**

   **GitBook:**
   ```markdown
   [Link](chapter1.md)
   ```

   **doc-system:**
   ```markdown
   [Link](chapters/chapter1)
   ```

## Migrating from Read the Docs / Sphinx

### Overview

Sphinx uses reStructuredText (rST), doc-system uses Markdown.

### Convert rST to Markdown

Use `pandoc` to convert:

```bash
# Install pandoc
# Ubuntu/Debian:
sudo apt-get install pandoc

# Mac:
brew install pandoc

# Convert all .rst files to .md
find docs -name "*.rst" -exec sh -c 'pandoc "${0}" -f rst -t markdown -o "${0%.rst}.md"' {} \;
```

### Manual Cleanup

After conversion, manually fix:

1. **Code blocks:**
   ```rst
   .. code-block:: python

      print("hello")
   ```

   Becomes:
   ```markdown
   ```python
   print("hello")
   ```
   ```

2. **Admonitions:**
   ```rst
   .. note::
      This is a note
   ```

   Becomes:
   ```markdown
   > **📝 Note:** This is a note
   ```

3. **Cross-references:**
   ```rst
   :ref:`installation`
   ```

   Becomes:
   ```markdown
   [Installation](installation)
   ```

## General Migration Checklist

Use this checklist for any migration:

- [ ] Install Node.js 22.x
- [ ] Clone doc-system repository
- [ ] Copy markdown files to `docs/` folder
- [ ] Copy images to `docs/images/` folder
- [ ] Update `config.json` with site info
- [ ] Update frontmatter in markdown files
- [ ] Convert proprietary syntax to standard Markdown
- [ ] Update internal links (remove `.md`, use relative paths)
- [ ] Test build: `npm run build`
- [ ] Test dev server: `npm run dev`
- [ ] Check all pages render correctly
- [ ] Check all images load
- [ ] Test search functionality
- [ ] Test dark mode
- [ ] Test mobile responsiveness
- [ ] Setup GitHub Actions for deployment
- [ ] Deploy and verify live site

## Need Help?

If you encounter issues during migration:

1. Check the [Troubleshooting Guide](troubleshooting)
2. Search [GitHub Issues](https://github.com/haggistech/doc-system/issues)
3. Create a new issue with:
   - Source system name and version
   - Error messages
   - Sample problematic content

## Migration Tools

Consider these tools to help with migration:

**Content Conversion:**
- `pandoc` - Convert between markup formats
- `remark` - Markdown processor
- `markdown-link-check` - Verify links after migration

**Automation:**
```bash
# Example: Batch convert frontmatter
find docs -name "*.md" -exec sed -i 's/sidebar_position:/# sidebar_position:/g' {} \;

# Example: Update image paths
find docs -name "*.md" -exec sed -i 's|/img/|images/|g' {} \;

# Example: Remove .md from links
find docs -name "*.md" -exec sed -i 's/\(\[.*\]\(.*\)\.md\)/\1\)/g' {} \;
```

**Validation:**
```bash
# After migration, check for issues
npm run build 2>&1 | grep -i "warning\|error"

# Test all pages load
npm run serve
# Then visit http://localhost:3000
```
