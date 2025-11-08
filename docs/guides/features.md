---
title: Features
description: Overview of key features in the documentation system
---

# Features

This documentation system comes with powerful features to help you create beautiful, functional documentation.

## Syntax Highlighting

Code blocks are automatically highlighted using Highlight.js, supporting all major programming languages.

### Usage

Simply use fenced code blocks with language identifiers:

````markdown
```javascript
function hello() {
  console.log('Hello, world!');
}
```

```python
def hello():
    print("Hello, world!")
```

```bash
npm install
npm run build
```
````

### Supported Languages

Highlight.js supports 190+ languages including:
- JavaScript, TypeScript, Node.js
- Python, Ruby, PHP, Java, C++, C#, Go, Rust
- HTML, CSS, SCSS, JSON, YAML, XML
- Bash, Shell, PowerShell
- SQL, GraphQL
- And many more...

### Theme

The default theme is GitHub Dark, which provides excellent contrast and readability. You can change the theme by modifying the build script to use a different Highlight.js theme.

### Copy Code Button

Every code block includes a copy button that appears when you hover over it (or is always visible on touch devices).

**Features:**
- **One-Click Copy**: Click to copy code to clipboard
- **Visual Feedback**: Button shows "Copied!" confirmation with checkmark
- **Smart Appearance**: Appears on hover (desktop) or always visible (mobile)
- **Fallback Support**: Works on older browsers without Clipboard API
- **Accessible**: Includes proper ARIA labels for screen readers

The copy button automatically handles:
- Stripping HTML tags and syntax highlighting
- Preserving original formatting and whitespace
- Cross-browser compatibility
- Touch device optimization

## Enhanced Search

A powerful client-side search with an intuitive UI built into the navbar.

### Search Features

- **Instant Results**: Search as you type
- **Smart Scoring**: Results ranked by relevance
  - Title matches get highest priority
  - Description matches get medium priority
  - Path matches get lower priority
- **Keyboard Navigation**:
  - `↑` / `↓` - Navigate through results
  - `Enter` - Open selected result
  - `Escape` - Close search
  - `Ctrl/Cmd + K` - Focus search bar
- **Highlighted Matches**: Search terms are highlighted in results
- **Result Preview**: See title, description, and file path
- **Maximum 8 Results**: Top results to avoid overwhelming

### How Search Works

The search performs a client-side fuzzy search across:
1. **Document Titles** (highest weight)
2. **Document Descriptions** (medium weight)
3. **Document Paths** (lowest weight)

Results are scored and sorted by relevance, with exact matches and title-start matches receiving bonus points.

### Search Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search bar |
| `↑` `↓` | Navigate results |
| `Enter` | Open selected result |
| `Escape` | Close search |

## Versioning

Maintain multiple versions of your documentation simultaneously, similar to Docusaurus.

### Key Benefits

- Keep old documentation accessible
- Work on next version while current is live
- Version selector dropdown in navbar
- Separate directories for each version
- Clean URL structure (`/2.0.0/docs/page.html`)

See the [Versioning Guide](versioning) for detailed information.

## Navigation Features

### Breadcrumb Navigation

Every page displays breadcrumb navigation showing the current location in the documentation hierarchy.

**Features:**
- **Visual Hierarchy**: Shows Home > Category > Page path
- **Clickable Links**: Navigate back to parent pages
- **Automatic Generation**: Built from sidebar structure
- **Accessible**: Proper ARIA labels for screen readers

The breadcrumbs help users understand where they are in the documentation and provide quick navigation to parent sections.

### Mobile Sidebar Toggle

On mobile devices and tablets, the sidebar is hidden by default with a hamburger menu toggle button.

**Features:**
- **Hamburger Menu**: Three-line icon in the top-left corner
- **Smooth Animation**: Sidebar slides in from the left
- **Backdrop Overlay**: Dark overlay when sidebar is open
- **Auto-Close**: Closes when clicking outside or selecting a link
- **Animated Icon**: Transforms to X when open

**Breakpoints:**
- Desktop (>996px): Sidebar always visible
- Tablet/Mobile (≤996px): Sidebar toggled with hamburger menu

### Last Updated Timestamp

Each page shows when it was last modified, automatically extracted from Git history.

**Features:**
- **Git Integration**: Uses `git log` to find last commit date
- **Formatted Date**: Displays as "Last updated: Month Day, Year"
- **Automatic**: No manual updates needed
- **Graceful Fallback**: Hidden if not in a Git repository

The timestamp appears below the article content, helping users know if documentation is current.

**Note**: Requires the repository to be initialized with Git. If not using Git, the timestamp won't appear.

## Markdown Support

Full support for GitHub Flavored Markdown:

### Text Formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `Inline code`

### Lists

Ordered lists:
1. First item
2. Second item
3. Third item

Unordered lists:
- Item one
- Item two
- Item three

### Links and Images

```markdown
[Link text](https://example.com)
![Alt text](image.png)
```

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Search | ✅ | Enhanced UI |
| Syntax | ✅ | 190+ languages |
| Versions | ✅ | Like Docusaurus |

### Blockquotes

> This is a blockquote
> It can span multiple lines

### Code Blocks

With syntax highlighting (see above)

## Responsive Design

The documentation system is fully responsive:

- **Desktop**: Full sidebar, search bar in navbar
- **Tablet**: Collapsible sidebar, optimized search
- **Mobile**: Touch-friendly, full-width search, optimized typography

All features work seamlessly across devices.

## Performance

- **Static HTML**: Fast page loads
- **No Runtime Dependencies**: Pure HTML/CSS/JS
- **Client-side Search**: No server required
- **Minimal JavaScript**: Small bundle size
- **Optimized CSS**: Clean, efficient styles

## SEO-Friendly

- Semantic HTML structure
- Meta descriptions from frontmatter
- Clean URLs
- Static pages for search engine crawling
- Proper heading hierarchy

## Git-Friendly

- All content in version control
- Markdown source files
- No database required
- Easy collaboration
- Simple deployment via Git push

## Customization

Easily customize your documentation:

### Colors and Styling

Edit `theme/styles.css`:

```css
:root {
  --primary-color: #2563eb;
  --text-color: #1f2937;
  --bg-color: #ffffff;
  /* ... more variables */
}
```

### Navigation

Configure in `config.json`:

```json
{
  "navbar": {
    "title": "Your Docs",
    "links": [...]
  },
  "sidebar": [...]
}
```

### Syntax Theme

Change the Highlight.js theme in `scripts/build.js`:

```javascript
// Change 'github-dark.css' to any Highlight.js theme
const highlightCssSource = path.join(
  rootDir,
  'node_modules',
  'highlight.js',
  'styles',
  'github-dark.css'
);
```

Available themes: `github`, `github-dark`, `monokai`, `atom-one-dark`, `vs2015`, and many more.

## Deployment

Deploy to:
- **GitHub Pages** (free for public repos)
- **GitLab Pages** (free for all repos)
- **Netlify** (free tier available)
- **Vercel** (free tier available)
- Any static hosting service

See the [Deployment Guide](deployment) for detailed instructions.
