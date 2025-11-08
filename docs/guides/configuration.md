---
title: Configuration
description: How to configure your documentation site
---

# Configuration

The `config.json` file controls all aspects of your documentation site.

## Basic Settings

```json
{
  "title": "Documentation Site",
  "description": "A modern documentation system",
  "baseUrl": "/",
  "docsDir": "docs",
  "outputDir": "build"
}
```

- **title**: Your site's title
- **description**: Site description for SEO
- **baseUrl**: Base URL (use `/repo-name/` for GitHub Pages)
- **docsDir**: Directory containing markdown files
- **outputDir**: Build output directory

## Navbar Configuration

```json
{
  "navbar": {
    "title": "Docs",
    "links": [
      {
        "label": "Documentation",
        "to": "/docs/intro"
      },
      {
        "label": "GitHub",
        "href": "https://github.com/yourusername/yourrepo"
      }
    ]
  }
}
```

## Sidebar Configuration

```json
{
  "sidebar": [
    {
      "type": "category",
      "label": "Getting Started",
      "items": ["intro", "installation"]
    },
    {
      "type": "category",
      "label": "Guides",
      "items": ["guides/configuration", "guides/deployment"]
    }
  ]
}
```

The sidebar structure determines the navigation menu and page order.

## Footer

```json
{
  "footer": {
    "copyright": "Copyright © 2025 Your Project"
  }
}
```

## Tips

- Keep sidebar items in logical order
- Use descriptive category labels
- Match sidebar items to actual file paths (without `.md`)
