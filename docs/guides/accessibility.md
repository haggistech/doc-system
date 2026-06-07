---
title: Accessibility & WCAG 2.1 Compliance
description: Ensure your documentation is accessible to everyone
---

# Accessibility & WCAG 2.1 Compliance

This guide covers the built-in accessibility auditing and how to ensure your documentation meets WCAG 2.1 AA standards.

## What is WCAG 2.1 AA?

**WCAG** = Web Content Accessibility Guidelines  
**2.1** = Latest version (published 2018)  
**AA** = Intermediate compliance level (good accessibility)

WCAG 2.1 AA is the **industry standard** for web accessibility and covers:
- Visual accessibility (color contrast, size, text)
- Audio/video (captions, transcripts)
- Motor accessibility (keyboard navigation, large targets)
- Cognitive accessibility (clear language, simple navigation)

## Automatic Accessibility Audit

The documentation system includes an **automatic accessibility audit** that checks for:

✅ Proper heading hierarchy (h1 → h2 → h3)  
✅ Image alt text (descriptive and meaningful)  
✅ Form labels (all inputs have labels)  
✅ Link text (descriptive, not "click here")  
✅ Semantic HTML (proper landmarks and structure)  
✅ Color contrast (4.5:1 ratio for text)  
✅ Language declaration (lang attribute)  
✅ Mobile viewport (responsive design)  

## Running the Audit

### From Command Line

```bash
npm run audit:a11y
```

This scans all built HTML files and reports:
- Files that pass/fail
- Accessibility score (0-100)
- WCAG compliance level
- Specific issues to fix

### Example Output

```
🔍 Running Accessibility Audit...

Found 15 HTML file(s)

✅ docs/guides/optimization.html
   Score: 95/100 (WCAG AA)
   Issues: 0 errors, 1 warning

❌ docs/guides/features.html
   Score: 78/100 (WCAG A)
   Issues: 2 errors, 3 warnings

ACCESSIBILITY AUDIT SUMMARY
==================================================
Files audited: 15
Total issues: 12
Total errors: 2
Average score: 89/100
Pages passing: 14/15
```

## Common Accessibility Issues

### 1. Missing Heading Hierarchy

**Problem:** Jumping from h1 directly to h3

```markdown
# Main Title
### Subsection  ❌ Should be ## or level 2
```

**Fix:**
```markdown
# Main Title
## Section
### Subsection ✅ Proper hierarchy
```

### 2. Missing Image Alt Text

**Problem:** Images without descriptions

```markdown
![](image.png)  ❌ No alt text
```

**Fix:**
```markdown
![A screenshot showing the dashboard](image.png)  ✅ Descriptive alt text
```

### 3. Poor Link Text

**Problem:** Non-descriptive link text

```markdown
[Click here](https://example.com)  ❌ "Click here" is vague
[More info](page.html)             ❌ "More info" is vague
```

**Fix:**
```markdown
[Learn about API design](https://example.com)  ✅ Descriptive
[View the installation guide](page.html)        ✅ Clear purpose
```

### 4. Missing Form Labels

**Problem:** Form inputs without labels

```html
<input type="text" placeholder="Name">  ❌ Placeholder is not enough
```

**Fix:**
```html
<label for="name">Name:</label>
<input type="text" id="name" placeholder="John">  ✅ Has label
```

### 5. Missing Main Landmark

**Problem:** No `<main>` element

```html
<body>
  <nav>...</nav>
  <article>...</article>  ❌ Should be wrapped in <main>
</body>
```

**Fix:**
```html
<body>
  <nav>...</nav>
  <main>
    <article>...</article>  ✅ Wrapped in <main>
  </main>
</body>
```

## Accessibility Score Interpretation

| Score | Level | Status |
|-------|-------|--------|
| 90-100 | AA | ✅ Excellent |
| 70-89 | A | ⚠️ Good, but improve |
| Below 70 | Below A | ❌ Needs work |

## Best Practices

### Content Creation

1. **Use Semantic Headings**
   - Start with h1, use h2/h3 for subsections
   - Don't skip levels (h1 → h3)

2. **Write Descriptive Alt Text**
   - Describe the image purpose, not just "image"
   - Include relevant text in the image
   - Keep it under 125 characters

3. **Use Clear Link Text**
   - Avoid "click here", "link", "more"
   - Describe the destination or action
   - Make sense out of context

4. **Provide Form Labels**
   - Every input needs a label
   - Use `<label for="id">` not just placeholder
   - Include required field indicators

### Design & Layout

1. **Color Contrast**
   - Text: 4.5:1 ratio (dark on light)
   - Large text: 3:1 ratio
   - Don't rely on color alone

2. **Responsive Design**
   - Mobile friendly (viewport meta tag)
   - Readable at all sizes
   - Touch targets (44px minimum)

3. **Keyboard Navigation**
   - All features accessible via keyboard
   - Visible focus indicators
   - Logical tab order

4. **Skip Links**
   - Allow jumping to main content
   - Skip navigation on every page

## Screen Reader Friendly

The documentation system is optimized for screen readers:

✅ **Proper Structure**
- Semantic HTML (nav, main, article, aside)
- Heading hierarchy
- Lists and landmarks

✅ **ARIA Attributes**
- aria-label for unlabeled elements
- aria-current for active navigation
- role attributes where needed

✅ **Alternative Text**
- Image alt text
- Button labels
- Icon descriptions

✅ **Form Accessibility**
- Associated labels
- Error messages
- Required field indicators

## Testing with Screen Readers

### Free Screen Readers

**Windows:**
- NVDA (free, open source)
- JAWS (commercial)

**Mac:**
- VoiceOver (built-in)

**Mobile:**
- TalkBack (Android)
- VoiceOver (iOS)

### Testing Steps

1. Enable screen reader
2. Navigate with keyboard only (no mouse)
3. Listen for announcements
4. Check all forms and buttons
5. Verify headings make sense

## Keyboard Navigation Testing

Press these keys to navigate:

| Key | Action |
|-----|--------|
| Tab | Move forward |
| Shift+Tab | Move backward |
| Enter | Activate button/link |
| Space | Toggle checkbox/button |
| Arrows | Navigation menus |

All interactive elements must be reachable.

## Tools & Resources

### Automated Testing
- WebAIM Contrast Checker
- WAVE Accessibility Tool
- Lighthouse (in Chrome DevTools)
- Axe DevTools

### Manual Testing
- Keyboard-only navigation
- Screen reader testing
- Zoom to 200% and test layout
- Turn off colors, use grayscale

### Learning Resources
- [WebAIM.org](https://webaim.org/) — Best practices
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) — Official guidelines
- [The A11Y Project](https://www.a11yproject.com/) — Community resources

## Compliance Checklist

- ◻️ Run `npm run audit:a11y` and review results
- ◻️ Fix all errors (zero tolerance)
- ◻️ Address warnings (improve compliance)
- ◻️ Test with keyboard only
- ◻️ Test with screen reader (optional)
- ◻️ Test color contrast with WebAIM
- ◻️ Verify at 200% zoom
- ◻️ Check mobile responsiveness

## Documentation Content Tips

✅ **Write Clear Content**
- Use simple language
- Short paragraphs
- Clear headings
- Bulleted lists

✅ **Provide Examples**
- Code samples for developers
- Screenshots for visual features
- Both text and images

✅ **Use Consistent Structure**
- Same format across pages
- Consistent navigation
- Clear information hierarchy

✅ **Make Text Scannable**
- Headings
- Bold key terms
- Lists instead of paragraphs

## Current Audit Results

Your documentation system has been audited for accessibility. Run the audit to see current status:

```bash
npm run audit:a11y
```

## More Help

- **WCAG Questions:** Check [WebAIM](https://webaim.org/)
- **Specific Issue:** Run audit and check the "Suggestion" column
- **Screen Reader Help:** Visit [The A11Y Project](https://www.a11yproject.com/)

---

**Remember:** Accessibility is not an afterthought—it's a fundamental requirement for good web design that benefits everyone.
