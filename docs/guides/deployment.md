---
title: Deployment
description: How to deploy your documentation to GitHub Pages or GitLab Pages
---

# Deployment

Deploy your documentation site to GitHub Pages or GitLab Pages.

## GitHub Pages

### Option 1: GitHub Actions (Recommended)

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

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

### Option 2: Manual Deployment

```bash
# Build the site
npm run build

# Deploy to gh-pages branch
npx gh-pages -d build
```

### Configuration for GitHub Pages

If your repository is at `github.com/username/repo`, update `config.json`:

```json
{
  "baseUrl": "/repo/"
}
```

## GitLab Pages

Create `.gitlab-ci.yml`:

```yaml
image: node:22

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

### Configuration for GitLab Pages

```json
{
  "baseUrl": "/project-name/"
}
```

## Custom Domain

### GitHub Pages

1. Add a `CNAME` file to your `build` directory with your domain
2. Configure DNS to point to GitHub Pages
3. Enable custom domain in repository settings

### GitLab Pages

1. Configure DNS to point to GitLab Pages
2. Add domain in GitLab Pages settings

## Build Optimization

Before deploying:

1. Review all documentation for broken links
2. Test the build locally: `npm run build && npm run serve`
3. Verify responsive design on mobile devices
4. Test search functionality

## Troubleshooting

**Pages not loading?**
- Check `baseUrl` in `config.json`
- Verify GitHub/GitLab Pages is enabled
- Check build output for errors

**Broken links?**
- Ensure sidebar items match file paths
- Use correct `baseUrl` in configuration
