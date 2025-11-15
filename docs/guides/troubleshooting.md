---
title: Troubleshooting
description: Common issues and solutions for the documentation system
---

# Troubleshooting

This guide covers common issues you might encounter and how to solve them.

## Installation Issues

### Node.js Version Mismatch

**Problem:** Error messages about incompatible Node.js version or features not working.

**Solution:**
```bash
# Check your current Node.js version
node --version

# Should show v22.x.x or higher
# If not, install the correct version:
nvm install 22
nvm use 22

# Verify the version
node --version
```

**Alternative (without NVM):**
Download Node.js 22.x directly from [nodejs.org](https://nodejs.org/)

### npm install Fails

**Problem:** `npm install` fails with permission errors or network issues.

**Solutions:**

**Permission errors on Linux/Mac:**
```bash
# Never use sudo with npm
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Then retry
npm install
```

**Network/proxy issues:**
```bash
# Clear npm cache
npm cache clean --force

# Retry installation
npm install

# If behind a proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**Lock file conflicts:**
```bash
# Remove lock file and node_modules
rm package-lock.json
rm -rf node_modules

# Reinstall
npm install
```

## Build Issues

### Build Fails with "Cannot find module"

**Problem:** Build script fails with module not found errors.

**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# Clear any cached builds
rm -rf build/

# Try building again
npm run build
```

### Images Not Copying to Build

**Problem:** Images referenced in markdown don't appear in the built site.

**Causes & Solutions:**

1. **Image path is incorrect:**
   ```markdown
   <!-- ❌ Wrong - absolute path -->
   ![Logo](/images/logo.png)

   <!-- ✅ Correct - relative path -->
   ![Logo](images/logo.png)
   ```

2. **Image is external URL:**
   - External images (http://, https://) are not copied
   - They're referenced directly in the HTML

3. **Image doesn't exist:**
   - Check the build output for broken image warnings
   - Verify the file exists in your `docs/` folder

### Broken Internal Links

**Problem:** Links between documentation pages don't work.

**Solution:**
```markdown
<!-- ❌ Wrong - includes .md extension -->
[Configuration](configuration.md)

<!-- ❌ Wrong - absolute path -->
[Configuration](/docs/configuration)

<!-- ✅ Correct - relative path without extension -->
[Configuration](configuration)

<!-- ✅ Correct - with subfolder -->
[Deployment](guides/deployment)
```

The build system will warn you about broken links:
```
⚠️  Warning: Found broken internal links:
   - docs/intro.md links to "nonexistent" (target not found)
```

### Syntax Highlighting Not Working

**Problem:** Code blocks show as plain text without colors.

**Solution:**

1. **Specify the language:**
   ````markdown
   <!-- ❌ Wrong - no language specified -->
   ```
   const x = 10;
   ```

   <!-- ✅ Correct - language specified -->
   ```javascript
   const x = 10;
   ```
   ````

2. **Check if language is supported:**
   - Highlight.js supports 190+ languages
   - See: [Supported Languages](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)
   - Use common aliases: `js` (JavaScript), `py` (Python), `sh` (Shell)

3. **Verify highlight.js is loaded:**
   - Check the browser console for errors
   - Rebuild the site: `npm run build`

## Development Server Issues

### Port 3000 Already in Use

**Problem:** Dev server fails to start because port is already taken.

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port (edit scripts/dev.js)
# Change: const PORT = 3000;
# To:     const PORT = 3001;
```

### Hot Reload Not Working

**Problem:** Changes to markdown files don't trigger rebuild.

**Solution:**

1. **Restart the dev server:**
   ```bash
   # Stop with Ctrl+C
   # Restart
   npm run dev
   ```

2. **Check file watcher limits (Linux):**
   ```bash
   # Increase inotify watches
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Clear build cache:**
   ```bash
   rm -rf build/
   npm run dev
   ```

### Changes Not Showing in Browser

**Problem:** Browser shows old content even after rebuild.

**Solution:**
```bash
# Hard refresh the browser
# Chrome/Firefox: Ctrl+Shift+R (Windows/Linux)
# Chrome/Firefox: Cmd+Shift+R (Mac)

# Or clear browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete

# Or open in incognito/private mode
```

## Deployment Issues

### GitHub Pages Shows 404

**Problem:** GitHub Pages is enabled but shows "404 - Page not found".

**Solutions:**

1. **Check baseUrl in config.json:**
   ```json
   {
     "baseUrl": "/doc-system/"
   }
   ```
   - Must match your repository name
   - Must include leading and trailing slashes

2. **Verify GitHub Pages source:**
   - Go to repository **Settings** → **Pages**
   - Source should be: **GitHub Actions**

3. **Check workflow ran successfully:**
   - Go to **Actions** tab
   - Look for successful deployment (green checkmark)
   - Click to see logs if failed

4. **Wait a few minutes:**
   - GitHub Pages can take 1-5 minutes to update

### GitHub Actions Deployment Fails

**Problem:** Deploy workflow fails in GitHub Actions.

**Solutions:**

1. **Check Pages permissions:**
   - Repository **Settings** → **Actions** → **General**
   - Workflow permissions: **Read and write permissions**

2. **Verify Node version:**
   - Workflow uses Node 22.x
   - Check `.github/workflows/deploy.yml`

3. **Check build logs:**
   ```bash
   # Test build locally first
   npm run build

   # Look for errors in output
   ```

4. **Check for missing files:**
   ```bash
   # After build, verify output
   ls -la build/

   # Should contain index.html at minimum
   ```

### GitLab Pages Not Deploying

**Problem:** GitLab Pages job succeeds but site doesn't update.

**Solutions:**

1. **Check baseUrl:**
   ```json
   {
     "baseUrl": "/project-name/"
   }
   ```

2. **Verify artifacts:**
   - Go to **CI/CD** → **Pipelines** → Click latest
   - Check "pages" job has `public/` artifact
   - Download and inspect the artifact

3. **Check .gitlab-ci.yml:**
   ```yaml
   pages:
     script:
       - npm install
       - npm run build
       - mv build public  # Must create 'public' directory
     artifacts:
       paths:
         - public  # Must be named 'public'
   ```

## Search Issues

### Search Not Working

**Problem:** Search box doesn't show results.

**Solutions:**

1. **Check browser console for errors:**
   - Press F12 to open DevTools
   - Look for JavaScript errors

2. **Verify search.js is loaded:**
   - Check `build/theme/search.js` exists
   - Check `<script src="theme/search.js">` in HTML

3. **Rebuild the site:**
   ```bash
   rm -rf build/
   npm run build
   ```

4. **Check search index:**
   - Search index is built from page titles and descriptions
   - Ensure your markdown has frontmatter:
     ```markdown
     ---
     title: Page Title
     description: Page description
     ---
     ```

### Search Results Are Outdated

**Problem:** Search shows old content or missing pages.

**Solution:**
```bash
# The search index is built at build time
# Rebuild to update it
npm run build

# Then refresh your browser
```

## Dark Mode Issues

### Dark Mode Toggle Not Working

**Problem:** Clicking dark mode button doesn't change theme.

**Solutions:**

1. **Check browser console for errors:**
   - Look for JavaScript errors

2. **Clear localStorage:**
   ```javascript
   // In browser console:
   localStorage.clear()
   // Then refresh page
   ```

3. **Verify dark mode CSS is loaded:**
   - Inspect element with DevTools
   - Check if `data-theme="dark"` appears on `<html>` tag
   - Verify CSS variables are defined

### Dark Mode Not Persisting

**Problem:** Dark mode resets when page reloads.

**Solution:**
- Check if localStorage is enabled in your browser
- Some browsers in private/incognito mode disable localStorage
- Check browser console for localStorage errors

## Performance Issues

### Build is Very Slow

**Problem:** Build takes a long time to complete.

**Solutions:**

1. **Large number of pages:**
   - This is expected with 100+ pages
   - Consider pagination or splitting into multiple sites

2. **Large images:**
   ```bash
   # Optimize images before adding to docs
   # Use tools like imagemagick:
   mogrify -resize 1200x -quality 85 docs/images/*.png
   ```

3. **Check for infinite loops:**
   - Look at console output during build
   - Stop with Ctrl+C if hung

### Site Loads Slowly

**Problem:** Built site is slow to load in browser.

**Solutions:**

1. **Optimize images:**
   - Keep images under 500KB
   - Use appropriate formats (PNG for graphics, JPG for photos)
   - Consider WebP for better compression

2. **Reduce dependencies:**
   - The system is already lightweight
   - Avoid adding large external libraries

3. **Use a CDN:**
   - GitHub/GitLab Pages have built-in CDN
   - For custom hosting, use Cloudflare or similar

## Testing Issues

### Tests Fail to Run

**Problem:** `npm test` fails or hangs.

**Solution:**
```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
rm -rf node_modules
npm install

# Run tests again
npm test
```

### Specific Test Failures

**Problem:** One or more tests fail.

**Solution:**
```bash
# Run tests in watch mode for debugging
npm run test:watch

# Run specific test file
npx vitest run tests/unit/markdown.test.js

# Check test output for details
npm test -- --reporter=verbose
```

## Still Having Issues?

If you're still experiencing problems:

1. **Check GitHub Issues:**
   - [github.com/haggistech/doc-system/issues](https://github.com/haggistech/doc-system/issues)
   - Search for similar problems

2. **Create a New Issue:**
   - Include error messages
   - Include your Node.js version (`node --version`)
   - Include steps to reproduce
   - Include relevant config/code snippets

3. **Common Debug Steps:**
   ```bash
   # Start fresh
   rm -rf node_modules build package-lock.json
   npm install
   npm run build

   # Check versions
   node --version
   npm --version

   # Run with verbose logging
   npm run build 2>&1 | tee build.log
   ```
