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

## Search Configuration

Configure the fuzzy search behavior:

```json
{
  "search": {
    "maxResults": 10,
    "fuzzyThreshold": 0.3,
    "minMatchLength": 2
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `maxResults` | 10 | Maximum number of search results to display |
| `fuzzyThreshold` | 0.3 | Match sensitivity (0 = exact match only, 1 = match anything) |
| `minMatchLength` | 2 | Minimum characters before search activates |

**Threshold Guide:**
- `0.0` - Only exact matches
- `0.3` - Recommended default, allows minor typos
- `0.5` - More lenient, catches more typos
- `0.7` - Very lenient, may show less relevant results

## Footer

```json
{
  "footer": {
    "copyright": "Copyright © 2025 Your Project"
  }
}
```

## Full Example

Here's a complete `config.json` with all options:

```json
{
  "title": "My Documentation",
  "description": "Documentation for my awesome project",
  "baseUrl": "/my-project/",
  "docsDir": "docs",
  "outputDir": "build",
  "search": {
    "maxResults": 10,
    "fuzzyThreshold": 0.3,
    "minMatchLength": 2
  },
  "navbar": {
    "title": "My Docs",
    "links": [
      { "label": "Docs", "to": "/docs/intro" },
      { "label": "GitHub", "href": "https://github.com/user/repo" }
    ]
  },
  "footer": {
    "copyright": "Copyright © 2025 My Project"
  }
}
```

## Tips

- Keep sidebar items in logical order
- Use descriptive category labels
- Match sidebar items to actual file paths (without `.md`)
- Adjust `fuzzyThreshold` based on your documentation size
- Use a higher `maxResults` for larger documentation sites
