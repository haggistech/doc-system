# GitHub Actions Workflows

This directory contains automated workflows for the documentation system.

## Available Workflows

### 1. Auto Tag (`auto-tag.yml`) - SIMPLE VERSION

Automatically creates a new patch version tag on every merge to master/main.

**Behavior:**
- Triggers on push to `master` or `main` branch
- Automatically increments the patch version (e.g., v1.0.0 → v1.0.1)
- Creates and pushes the tag

**Example:**
- Current tag: `v1.2.5`
- After merge: Creates tag `v1.2.6`

### 2. Smart Auto Tag (`smart-tag.yml`) - RECOMMENDED

Intelligently creates version tags based on commit message keywords.

**Behavior:**
- Triggers on push to `master` or `main` branch
- Analyzes commit message to determine version bump type
- Creates tag and GitHub release with changelog

**Version Bump Rules:**

| Commit Message Keywords | Version Bump | Example |
|------------------------|--------------|---------|
| `[major]`, `BREAKING CHANGE`, `breaking change` | Major | v1.2.3 → v2.0.0 |
| `[minor]`, `feat:`, `feature:` | Minor | v1.2.3 → v1.3.0 |
| Default (anything else) | Patch | v1.2.3 → v1.2.4 |

**Examples:**

```bash
# Patch version bump (v1.0.0 → v1.0.1)
git commit -m "Fix typo in documentation"
git commit -m "Update deployment guide"

# Minor version bump (v1.0.0 → v1.1.0)
git commit -m "feat: Add new search feature"
git commit -m "[minor] Add breadcrumb navigation"

# Major version bump (v1.0.0 → v2.0.0)
git commit -m "[major] Remove versioning system"
git commit -m "BREAKING CHANGE: Change API structure"
```

## Usage

### Option 1: Use Only Simple Auto Tag
If you want simple automatic patch versioning:

1. Delete `smart-tag.yml`
2. Keep `auto-tag.yml`
3. Every merge will bump the patch version

### Option 2: Use Only Smart Auto Tag (Recommended)
If you want control over version bumps:

1. Delete `auto-tag.yml`
2. Keep `smart-tag.yml`
3. Use commit message keywords to control version bumps

### Option 3: Manual Tagging Only
If you prefer manual control:

1. Delete both workflow files
2. Create tags manually:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

## Initial Setup

If this is the first time setting up the repo, create an initial tag:

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

## Permissions

The workflows require the following permissions:
- `contents: write` - To create and push tags

These are automatically granted through the `GITHUB_TOKEN`.

## Customization

### Change Version Format

To use a different version format (e.g., without 'v' prefix), modify the workflows:

```yaml
# Change this line:
NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"

# To this:
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
```

### Change Trigger Branches

To trigger on different branches, modify the `on` section:

```yaml
on:
  push:
    branches:
      - main          # Only main
      - production    # Or production
      - release/*     # Or any release branch
```

### Add Pre-release Tags

To create pre-release tags (e.g., v1.0.0-beta.1), add this to the workflow:

```yaml
- name: Add pre-release suffix
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
      NEW_VERSION="${NEW_VERSION}-beta.${GITHUB_RUN_NUMBER}"
    fi
```

## Troubleshooting

### No tags are being created

1. Check workflow runs in the Actions tab
2. Verify `contents: write` permission is set
3. Ensure you're pushing to the correct branch

### Wrong version number

1. Check the latest tag: `git describe --tags --abbrev=0`
2. Manually create correct tag if needed
3. The workflow will increment from the latest tag

## Related Files

- `deploy.yml` - Deploys built site to GitHub Pages (if exists)
- `../WORKFLOWS.md` - This file
