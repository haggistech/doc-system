---
title: Features
description: Overview of key features in the documentation system
author: Documentation Team
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

### Language Labels

Every code block displays its programming language in the header, making it easy to identify the syntax at a glance.

**Features:**
- **Auto-Detection**: Language automatically extracted from code fence syntax
- **Clean Display**: Shows in uppercase (e.g., "JAVASCRIPT", "PYTHON", "BASH")
- **Header Design**: Integrated into code block header with subtle styling
- **190+ Languages**: Supports all Highlight.js languages

**Example:**

````markdown
```javascript
function hello() {
  console.log('Hello!');
}
```
````

This displays "JAVASCRIPT" in the code block header.

### Copy Code Button

Every code block includes a copy button that appears when you hover over it (or is always visible on touch devices).

**Features:**
- **One-Click Copy**: Click to copy code to clipboard
- **Visual Feedback**: Button shows "Copied!" confirmation with checkmark
- **Smart Appearance**: Appears on hover (desktop) or always visible (mobile)
- **Positioned in Header**: Placed in the top-right corner of each code block
- **Fallback Support**: Works on older browsers without Clipboard API
- **Accessible**: Includes proper ARIA labels for screen readers

The copy button automatically handles:
- Stripping HTML tags and syntax highlighting
- Preserving original formatting and whitespace
- Cross-browser compatibility
- Touch device optimization

## Fuzzy Search

A powerful client-side search powered by [Fuse.js](https://fusejs.io/) with fuzzy matching and typo tolerance.

### Search Features

- **Fuzzy Matching**: Typo-tolerant search that finds results even with spelling mistakes
- **Instant Results**: Search as you type with configurable minimum query length
- **Smart Scoring**: Results ranked by relevance using weighted fields
  - Title matches (40% weight) - highest priority
  - Description matches (30% weight)
  - Content matches (20% weight) - full-text search
  - Slug/path matches (10% weight)
- **Keyboard Navigation**:
  - `↑` / `↓` - Navigate through results
  - `Enter` - Open selected result
  - `Escape` - Close search
  - `Ctrl/Cmd + K` - Focus search bar
- **Highlighted Matches**: Search terms are highlighted in results
- **Content Previews**: See snippets from matching content
- **Recent Searches**: Remembers your recent searches (stored in localStorage)
- **Configurable Results**: Adjustable maximum results (default: 10)

### How Search Works

The search uses Fuse.js to perform fuzzy matching across:
1. **Document Titles** (40% weight)
2. **Document Descriptions** (30% weight)
3. **Document Content** (20% weight) - full text of the page
4. **Document Slugs** (10% weight)

Fuzzy matching allows finding results even with typos. For example, searching "configuraton" will still find "configuration".

### Search Configuration

Configure search behavior in `config.json`:

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
| `maxResults` | 10 | Maximum results to display |
| `fuzzyThreshold` | 0.3 | Match sensitivity (0 = exact, 1 = match anything) |
| `minMatchLength` | 2 | Minimum characters before searching |

### Search Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search bar |
| `↑` `↓` | Navigate results |
| `Enter` | Open selected result |
| `Escape` | Close search |

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

### Page Metadata Table

Each page displays a metadata table at the top showing authorship and date information.

**Features:**
- **Author**: Can be specified in frontmatter with `author: Name`
- **Created Date**: Automatically extracted from Git (first commit)
- **Created By**: Author of the first commit (from Git)
- **Last Updated**: Date of most recent modification (from Git)
- **Last Updated By**: Author of most recent commit (from Git)
- **Smart Display**: Only shows rows with available data
- **Clean Design**: Bordered table with clear labels and values

**Example:**

```markdown
---
title: My Page
author: John Doe
---

# Content here...
```

This will display a table like:

| | |
|---|---|
| **Author** | John Doe |
| **Created** | November 8, 2025 by John Doe |
| **Last Updated** | November 8, 2025 by John Doe |

**Git Integration:**
- Uses `git log` to extract creation and update information
- Gracefully handles non-Git repositories (only shows author if specified)
- Automatically updates when you commit changes

**Note**: For best results, initialize your repository with Git. Without Git, only the frontmatter `author` field will be displayed.

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
| Git Integration | ✅ | Metadata from commits |

### Admonitions/Callouts

Special formatted blocks to highlight important information, similar to Docusaurus.

**Available Types:**

:::note
This is a note admonition with the default "Note" title.
Use it for general information.
:::

:::tip Custom Tip Title
This is a tip admonition with a custom title.
Use it for helpful suggestions.
:::

:::info
This is an info admonition.
Use it for informational content.
:::

:::warning
This is a warning admonition.
Use it to warn users about potential issues.
:::

:::danger
This is a danger admonition.
Use it for critical warnings.
:::

:::caution
This is a caution admonition.
Use it for situations requiring careful attention.
:::

**Syntax:**

````markdown
:::note Optional Custom Title
Your content here. You can use **markdown** inside admonitions.

- Bullet points
- Code blocks
- And more!
:::
````

**Features:**
- **6 Types**: note, tip, info, warning, danger, caution
- **Custom Titles**: Override the default title
- **Markdown Support**: Full markdown rendering inside admonitions
- **Icons**: Each type has a distinctive emoji icon
- **Color-Coded**: Different colors for easy visual identification
- **Responsive**: Works perfectly on all devices

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
