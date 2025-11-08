# Setting Up GitHub Actions Workflows

The workflow file has been created locally but needs to be added to GitHub manually due to authentication restrictions.

## Workflow File Location

The smart auto-tagging workflow is located at:
`.github/workflows/smart-tag.yml`

## How to Add the Workflow to GitHub

### Method 1: Via GitHub Web Interface (Easiest)

1. Go to https://github.com/haggistech/doc-system
2. Click on the `.github` folder (or create it if it doesn't exist)
3. Click on the `workflows` folder (or create it if it doesn't exist)
4. Click "Add file" → "Create new file"
5. Name the file `smart-tag.yml`
6. Copy the entire content from `.github/workflows/smart-tag.yml` (see below)
7. Commit the file to the `master` branch

### Method 2: Via Command Line (Requires Token Update)

If you prefer to push from command line:

1. Create a new Personal Access Token (Classic) at: https://github.com/settings/tokens
2. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
3. Use the new token for authentication:
   ```bash
   git remote set-url origin https://YOUR_NEW_TOKEN@github.com/haggistech/doc-system.git
   git push origin master
   git push origin v1.0.0
   ```

## Workflow File Content

Copy this entire content into `smart-tag.yml`:

```yaml
name: Smart Auto Tag on Merge

on:
  push:
    branches:
      - master
      - main

jobs:
  smart-tag:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Get latest tag
        id: get_latest_tag
        run: |
          # Get the latest tag, or use v0.0.0 if no tags exist
          LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
          echo "latest_tag=$LATEST_TAG" >> $GITHUB_OUTPUT
          echo "Latest tag: $LATEST_TAG"

      - name: Determine version bump type
        id: bump_type
        run: |
          COMMIT_MSG=$(git log -1 --pretty=%B)
          echo "Commit message: $COMMIT_MSG"

          # Check commit message for version bump keywords
          if echo "$COMMIT_MSG" | grep -qiE '\[major\]|breaking change|BREAKING CHANGE'; then
            echo "bump_type=major" >> $GITHUB_OUTPUT
            echo "Detected MAJOR version bump"
          elif echo "$COMMIT_MSG" | grep -qiE '\[minor\]|feat:|feature:'; then
            echo "bump_type=minor" >> $GITHUB_OUTPUT
            echo "Detected MINOR version bump"
          else
            echo "bump_type=patch" >> $GITHUB_OUTPUT
            echo "Detected PATCH version bump"
          fi

      - name: Increment version
        id: increment_version
        run: |
          LATEST_TAG="${{ steps.get_latest_tag.outputs.latest_tag }}"
          BUMP_TYPE="${{ steps.bump_type.outputs.bump_type }}"

          # Remove 'v' prefix if present
          VERSION=${LATEST_TAG#v}

          # Split version into major.minor.patch
          IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

          # Increment based on bump type
          case $BUMP_TYPE in
            major)
              MAJOR=$((MAJOR + 1))
              MINOR=0
              PATCH=0
              ;;
            minor)
              MINOR=$((MINOR + 1))
              PATCH=0
              ;;
            patch)
              PATCH=$((PATCH + 1))
              ;;
          esac

          # Create new version
          NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"
          echo "new_version=$NEW_VERSION" >> $GITHUB_OUTPUT
          echo "New version: $NEW_VERSION (bump type: $BUMP_TYPE)"

      - name: Create and push tag
        run: |
          NEW_VERSION="${{ steps.increment_version.outputs.new_version }}"

          # Configure git
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          # Create annotated tag with commit message
          COMMIT_MSG=$(git log -1 --pretty=%B)
          git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION" -m "$COMMIT_MSG"

          # Push the tag
          git push origin "$NEW_VERSION"

          echo "✓ Created and pushed tag: $NEW_VERSION"

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.increment_version.outputs.new_version }}
          release_name: Release ${{ steps.increment_version.outputs.new_version }}
          body: |
            ## Changes
            ${{ github.event.head_commit.message }}

            **Full Changelog**: https://github.com/${{ github.repository }}/compare/${{ steps.get_latest_tag.outputs.latest_tag }}...${{ steps.increment_version.outputs.new_version }}
          draft: false
          prerelease: false
```

## Creating the Initial Tag

After the workflow is added, create the initial tag:

```bash
git tag -a v1.0.0 -m "Initial release v1.0.0"
git push origin v1.0.0
```

## How It Works

Once set up, the workflow will automatically:

1. **Trigger** on every push to `master` or `main` branch
2. **Analyze** the commit message for version bump keywords:
   - `[major]` or `BREAKING CHANGE` → Major version bump (v1.0.0 → v2.0.0)
   - `[minor]` or `feat:` → Minor version bump (v1.0.0 → v1.1.0)
   - Everything else → Patch version bump (v1.0.0 → v1.0.1)
3. **Create** a new version tag
4. **Push** the tag to GitHub
5. **Create** a GitHub Release with changelog

## Example Commit Messages

```bash
# Patch version (v1.0.0 → v1.0.1)
git commit -m "Fix typo in documentation"

# Minor version (v1.0.0 → v1.1.0)
git commit -m "feat: Add new search feature"
git commit -m "[minor] Add breadcrumb navigation"

# Major version (v1.0.0 → v2.0.0)
git commit -m "[major] Remove versioning system"
git commit -m "BREAKING CHANGE: Change API structure"
```

## Verification

After adding the workflow:

1. Check the Actions tab: https://github.com/haggistech/doc-system/actions
2. Make a test commit and push to master
3. Watch the workflow run and create a new tag
4. Check Releases: https://github.com/haggistech/doc-system/releases

## Troubleshooting

If the workflow doesn't run:
- Verify the file is in `.github/workflows/smart-tag.yml`
- Check that Actions are enabled in repository settings
- Review the workflow syntax in the Actions tab

For more information, see [.github/WORKFLOWS.md](.github/WORKFLOWS.md)
