---
title: Advanced Features
description: Multi-version docs, branding, changelogs, and citations
---

# Advanced Features

This guide covers four powerful advanced features for professional documentation systems.

## 1. Multi-Version Documentation

Support multiple versions of your API or documentation side-by-side. Users on older versions can find the right docs without being forced to upgrade.

### Setup

Configure available versions in `config.json`:

```json title="config.json"
{
  "versions": {
    "current": "2.0.0",
    "available": ["1.0.0", "1.5.0", "2.0.0"]
  }
}
```

### How It Works

- Version selector appears in the navbar
- Users can switch between versions with a dropdown
- URLs include the version: `/doc-system/2.0.0/docs/...`
- Each version can have its own docs directory

### Version-Specific Docs

For different docs per version, create version-specific directories:

```
docs/                    # Main docs (current version)
docs-1.0.0/             # Version 1.0.0 specific
docs-1.5.0/             # Version 1.5.0 specific
```

The system automatically falls back to the main `docs/` directory if a version-specific one doesn't exist.

### Example Use Cases

- **API Breaking Changes** — Maintain separate endpoints per version
- **Legacy Support** — Keep old API docs accessible
- **Beta Features** — Document upcoming changes in a beta version
- **Migration Guides** — Show users how to upgrade

---

## 2. Custom Branding (Favicon & Logo)

Customize your documentation with a custom favicon and logo.

### Configuration

Add branding settings to `config.json`:

```json title="config.json"
{
  "branding": {
    "favicon": "theme/favicon.ico",
    "logo": "theme/logo.svg",
    "logoAlt": "My Company Logo"
  }
}
```

### File Requirements

- **Favicon**: `.ico`, `.png`, or `.svg` format
- **Logo**: `.svg` or `.png` (SVG recommended for scaling)
- **Size**: Logo should be ~200px wide, any height (will scale to 32px)

### Placement

Place files in the `theme/` directory:

```
theme/
├── logo.svg
├── favicon.ico
└── styles.css
```

### Example

```json title="config.json"
{
  "title": "My API Docs",
  "branding": {
    "favicon": "theme/favicon.ico",
    "logo": "theme/logo.svg",
    "logoAlt": "My Company"
  }
}
```

The logo appears in the navbar next to your site title.

---

## 3. Automatic Changelog from Git Tags

Automatically generate release notes from your git history.

### Generate Changelog

Run the changelog generator:

```bash title="Generate from git tags"
npm run changelog docs/CHANGELOG.md
```

This scans git tags and creates a changelog with:
- ✨ Features (feat commits)
- 🐛 Bug Fixes (fix commits)
- ⚠️ Breaking Changes (contains "breaking")
- 📝 Documentation (docs commits)
- And more...

### Setup Requirements

1. Use semantic git tags:

```bash
git tag v1.0.0
git tag v1.1.0
git tag v2.0.0
```

2. Use conventional commit messages:

```bash
git commit -m "feat: Add new API endpoint"
git commit -m "fix: Resolve memory leak"
git commit -m "docs: Update README"
```

### Commit Type Recognition

| Message Prefix | Category | Icon |
|---|---|---|
| `feat:` | Features | ✨ |
| `fix:` | Bug Fixes | 🐛 |
| Contains `breaking` | Breaking Changes | ⚠️ |
| `docs:` | Documentation | 📝 |
| `perf:` | Performance | ⚡ |
| `refactor:` | Refactoring | ♻️ |
| `test:` | Tests | ✅ |

### Example Output

```markdown
## [v2.0.0](v1.5.0..v2.0.0) - 2024-12-25

### ✨ Features
- Add GraphQL support (#345)
- New webhook endpoints (#342)

### 🐛 Bug Fixes
- Fix memory leak in batch operations (#338)
- Resolve race condition in cache (#335)

### ⚠️ Breaking Changes
- Removed deprecated `/api/v1/` endpoints
```

---

## 4. Citations and Bibliography

Add academic-style citations to your documentation.

### Basic Usage

Add citations to your markdown:

```markdown
According to our research [citation:smith_2020], this approach works well.

As previously noted [citation:johnson_2019], the benefits are clear.
```

### Define Bibliography

Add a bibliography to your frontmatter:

```markdown title="docs/research.md"
---
title: Research Document
bibliography:
  - author: "John Smith"
    title: "Advanced API Design"
    year: 2020
    publication: "Technical Review"
    doi: "10.1234/example"
    url: "https://example.com/paper1"
  - author: "Jane Johnson"
    title: "Microservice Architecture"
    year: 2019
    publication: "IEEE Transactions"
    volume: "42(3)"
    pages: "123-145"
---
```

### Citation Format

Each bibliography entry supports:

- **author** (string or array) — Author name(s)
- **title** (string) — Publication title
- **year** (number) — Publication year
- **publication** (string) — Journal or conference name
- **volume** (string) — Volume number
- **pages** (string) — Page numbers
- **doi** (string) — Digital Object Identifier
- **url** (string) — Link to publication

### How It Renders

- Citations appear as superscript numbers: [1]
- Clicking a citation jumps to the bibliography
- Bibliography appears at the end with full details
- Automatically formatted with proper styling

### Example

:::warning Academic Use
This feature is designed for academic papers, research documentation, and technical reports that require proper citation management.
:::

---

## Combining Features

These features work together for professional documentation:

```json title="config.json"
{
  "title": "Complete API Documentation",
  "branding": {
    "favicon": "theme/favicon.ico",
    "logo": "theme/logo.svg"
  },
  "versions": {
    "current": "2.0.0",
    "available": ["1.0.0", "2.0.0"]
  }
}
```

Then in a markdown file:

```markdown
---
title: API Reference
bibliography:
  - author: "REST Developers"
    title: "API Best Practices"
    year: 2023
---

# API Reference

Our design follows best practices [citation:rest_2023].

See [CHANGELOG](../CHANGELOG.md) for version history.
```

---

## Best Practices

### Multi-Version Docs
- Keep version numbers in alphabetical/version order
- Update docs for each major release
- Maintain backward compatibility docs for 2-3 versions

### Branding
- Use SVG logos for crisp scaling
- Keep logos under 150px width
- Use formats that support transparency

### Changelogs
- Use consistent commit message prefixes
- Create tags for each release
- Review generated changelog before publishing

### Citations
- Use consistent author formatting
- Include DOI when available
- Update bibliography with each release

---

## CLI Commands

```bash
# Generate API documentation
npm run api-docs src/ docs/api

# Generate changelog
npm run changelog docs/CHANGELOG.md

# Build documentation
npm run build

# Start development server
npm run dev
```

All features work automatically during the build process!
