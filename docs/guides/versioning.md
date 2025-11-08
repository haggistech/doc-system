---
title: Versioning
description: How to manage multiple versions of your documentation
---

# Versioning

The documentation system supports versioning, allowing you to maintain documentation for multiple versions of your project simultaneously, similar to Docusaurus.

## How Versioning Works

When you create a new version:

1. The current `docs/` content is copied to `versioned_docs/version-X.X.X/`
2. The current sidebar is saved to `versioned_sidebars/version-X.X.X-sidebars.json`
3. The `config.json` is updated with the new version information
4. You can continue working on `docs/` for the next version

## Creating a New Version

To create a new version of your documentation:

```bash
npm run version 1.0.0
```

Replace `1.0.0` with your desired version number (must follow semver format: `major.minor.patch`).

### What Happens

```
✓ Version 1.0.0 created successfully!
✓ Docs copied to: versioned_docs/version-1.0.0
✓ Sidebar saved to: versioned_sidebars/version-1.0.0-sidebars.json
✓ Config updated
```

## Version Configuration

Versions are configured in `config.json`:

```json
{
  "versions": {
    "current": "2.0.0",
    "latest": "2.0.0",
    "available": ["2.0.0", "1.0.0"]
  },
  "versionsDir": "versioned_docs"
}
```

- **current**: The version being developed (from `docs/`)
- **latest**: The latest stable version
- **available**: Array of all available versions (newest first)

## Directory Structure

After creating versions, your project structure will look like:

```
doc-system/
├── docs/                              # Current/next version
│   ├── intro.md
│   └── ...
├── versioned_docs/
│   ├── version-1.0.0/                # Version 1.0.0
│   │   ├── intro.md
│   │   └── ...
│   └── version-2.0.0/                # Version 2.0.0
│       ├── intro.md
│       └── ...
├── versioned_sidebars/
│   ├── version-1.0.0-sidebars.json
│   └── version-2.0.0-sidebars.json
└── config.json
```

## Building Versioned Documentation

The build process automatically builds all versions:

```bash
npm run build
```

Output:

```
Building documentation site...
Building current version...
✓ Built 4 pages for current
Building version 2.0.0...
✓ Built 4 pages for 2.0.0
Building version 1.0.0...
✓ Built 4 pages for 1.0.0
✓ Build complete!
```

## Version Selector

A version dropdown appears in the navbar, allowing users to switch between versions:

- Shows the current version (e.g., "v2.0.0")
- Lists all available versions
- Marks the latest version with "(latest)"
- Highlights the active version

## Workflow Example

### Initial Release (v1.0.0)

1. Write documentation in `docs/`
2. Create version 1.0.0:
   ```bash
   npm run version 1.0.0
   ```
3. Build and deploy

### Working on v2.0.0

1. Continue editing `docs/` with new features for v2.0.0
2. Users can still view v1.0.0 docs via the version selector
3. When v2.0.0 is ready:
   ```bash
   npm run version 2.0.0
   ```
4. Build and deploy

## Best Practices

### When to Create Versions

- Before major releases
- When breaking changes are introduced
- When significant features are added
- Following your project's release cycle

### Version Naming

Use semantic versioning (semver):
- `1.0.0` - Major version
- `1.1.0` - Minor version (new features, no breaking changes)
- `1.1.1` - Patch version (bug fixes)

### Maintaining Old Versions

- Keep versioned docs in Git for deployment
- Only update old versions for critical fixes
- Focus development on the current version
- Consider deprecating very old versions

## Updating Versioned Documentation

To update an already versioned documentation:

1. Edit files in `versioned_docs/version-X.X.X/`
2. Rebuild the site: `npm run build`
3. Deploy the changes

**Note**: Changes to `docs/` do NOT affect versioned documentation.

## Git Strategy

By default, versioned documentation is tracked in Git. This is recommended because:

- Ensures all versions are deployed together
- Provides history of documentation changes
- Simplifies CI/CD workflows

If you prefer not to track versions in Git, uncomment these lines in `.gitignore`:

```
versioned_docs/
versioned_sidebars/
```

## URL Structure

Versioned documentation uses clean URLs:

- Current version: `/docs/intro.html`
- Version 2.0.0: `/2.0.0/docs/intro.html`
- Version 1.0.0: `/1.0.0/docs/intro.html`

## Troubleshooting

### Version Already Exists

```
Error: Version 1.0.0 already exists
```

Choose a different version number or remove the existing version from:
- `versioned_docs/version-X.X.X/`
- `versioned_sidebars/version-X.X.X-sidebars.json`
- `config.json` (from `versions.available` array)

### Sidebar Not Found

If a version's sidebar is missing, the build will use the default sidebar from `config.json` and show a warning.

### Version Format Error

```
Error: Version must be in semver format (e.g., 1.0.0)
```

Ensure your version follows the format: `major.minor.patch` (e.g., `1.0.0`, `2.1.3`)
