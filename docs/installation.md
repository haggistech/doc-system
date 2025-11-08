---
title: Installation
description: How to install and set up the documentation system
---

# Installation

This guide will help you set up your documentation system.

## Prerequisites

- Node.js 16 or higher
- npm or yarn

## Installation Steps

1. **Clone or download this repository**

   ```bash
   git clone <your-repo-url>
   cd doc-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure your site**

   Edit `config.json` to customize your site:
   - Change the title and description
   - Update navbar links
   - Configure the sidebar structure
   - Set your GitHub/GitLab repository URL

## Project Structure

```
doc-system/
├── docs/              # Your markdown documentation files
├── theme/             # CSS and JavaScript for the site
│   ├── styles.css
│   └── search.js
├── scripts/           # Build and development scripts
│   ├── build.js
│   ├── dev.js
│   └── serve.js
├── config.json        # Site configuration
└── package.json
```

## Creating Documentation

Add your documentation as Markdown files in the `docs/` folder. Each file should have frontmatter:

```markdown
---
title: Page Title
description: Page description
---

# Page Title

Your content here...
```

## Next Steps

Learn about [Configuration](guides/configuration) to customize your site.
