# Accessibility Audit - Improvement Action Plan

**Current Status:** 66/100 average score, 32 critical errors

This plan prioritizes fixes to achieve WCAG 2.1 AA compliance across all pages.

---

## 🎯 Priority 1: Fix Critical Errors (Biggest Impact)

### Issue #1: Form Inputs Without Labels
**Severity:** High | **Files Affected:** 3 (migration.html, accessibility.html) | **Impact:** 17 errors

**Problem:**
```markdown
:::tabs
== Search Tab
<input type="text" placeholder="search query">
==
```

**Fix:** Add proper form labels
```html
<label for="search-input">Search query:</label>
<input type="text" id="search-input" placeholder="search query">
```

**Estimated Score Improvement:** +15-20 points

**How to Apply:**
1. Edit `docs/guides/migration.md` and `docs/guides/accessibility.md`
2. Find all `<input>` tags in code examples
3. Add `<label for="id">` elements
4. Add matching `id` attributes to inputs
5. Rebuild: `npm run build && npm run audit:a11y`

---

### Issue #2: Broken Heading Hierarchy
**Severity:** High | **File:** theming.html | **Impact:** 1 error

**Problem:**
```markdown
# Main Title
#### Subsection  ❌ Jumps from h1 to h4
```

**Fix:** Use proper heading hierarchy
```markdown
# Main Title
## Section
### Subsection
#### Details
```

**Estimated Score Improvement:** +10-15 points

**How to Apply:**
1. Edit `docs/guides/theming.md`
2. Find all h4 headings (`####`)
3. Change to h2 or h3 based on hierarchy
4. Rebuild and retest

---

### Issue #3: Missing H1 Headings
**Severity:** Medium | **Files Affected:** 3 (index.html, newfile.html, test.html) | **Impact:** 3 errors

**Problem:**
```html
<html>
  <body>
    <h2>Section Title</h2>  ❌ No h1
  </body>
</html>
```

**Fix:** Ensure every page has an h1
```markdown
# Page Title
## Section Title
```

**Estimated Score Improvement:** +5-10 points

---

### Issue #4: Missing lang Attribute
**Severity:** High | **File:** index.html | **Impact:** 1 error

**Problem:**
```html
<html>  ❌ No lang attribute
```

**Fix:** Add language attribute to html element
```html
<html lang="en">  ✅ Now accessible
```

**How to Apply:**
1. This is in `scripts/lib/page-generator.js` 
2. The 404.html and index.html need lang attribute in their templates
3. Update the HTML template to include `lang="en"`

**Estimated Score Improvement:** +3-5 points

---

### Issue #5: Missing Viewport Meta Tag
**Severity:** Medium | **File:** index.html | **Impact:** 1 error

**Problem:**
```html
<head>
  <title>...</title>  ❌ No viewport meta
</head>
```

**Fix:** Add viewport meta tag
```html
<head>
  <title>...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
```

**Estimated Score Improvement:** +2-3 points

---

### Issue #6: Invalid List Markup
**Severity:** Medium | **File:** 404.html | **Impact:** 1 error

**Problem:**
```html
<li>Item</li>  ❌ Not in ul/ol
```

**Fix:** Wrap in list element
```html
<ul>
  <li>Item</li>
</ul>
```

**Estimated Score Improvement:** +2-3 points

---

## ⚠️ Priority 2: Address Warnings (Score Improvement)

### Issue #7: Poor/Missing Alt Text
**Impact:** 359+ warnings across all files

**Pattern:** Images with vague, missing, or generic alt text

**Examples:**

❌ Bad:
```markdown
![image](screenshot.png)
![photo](diagram.png)
![picture](code.png)
```

✅ Good:
```markdown
![Screenshot showing the dashboard with user metrics](screenshot.png)
![Architecture diagram showing API flow](diagram.png)
![Code example displaying the constructor function](code.png)
```

**How to Apply:**
1. For each markdown file with images
2. Add descriptive alt text describing what the image shows
3. Include context (what the screenshot contains, what the diagram illustrates)
4. Keep under 125 characters for brevity

**Estimated Score Improvement:** +10-20 points per file

**Files to Fix:**
- `docs/guides/features.md` (32 warnings)
- `docs/guides/troubleshooting.md` (29 warnings)
- `docs/guides/advanced-features.md` (28 warnings)

---

### Issue #8: Non-Descriptive Link Text
**Impact:** 20+ warnings

**Pattern:** Links with vague text like "click here", "more", "link"

**Examples:**

❌ Bad:
```markdown
For more information [click here](page.md)
See [more](guide.md) in the documentation
[Link](api-docs.md) to the API reference
```

✅ Good:
```markdown
For more information [read the installation guide](page.md)
See [advanced configuration options](guide.md) in the documentation
[View the API reference](api-docs.md) to learn about endpoints
```

**How to Apply:**
1. Search for poor link text patterns
2. Replace with descriptive link text
3. Make the link meaningful out of context

**Estimated Score Improvement:** +5-10 points per file

---

## 📋 Quick Fix Checklist

### Critical Fixes (32 errors - Must do)
- [ ] Add form labels to migration.md examples (17 errors)
- [ ] Fix heading hierarchy in theming.md (1 error)
- [ ] Add h1 to index.html template (1 error)
- [ ] Add lang="en" to html element (1 error)
- [ ] Add viewport meta tag (1 error)
- [ ] Fix list markup in 404.html (1 error)
- [ ] Create missing pages or remove broken links (10 errors)

### Warning Fixes (359 warnings - Should do)
- [ ] Add descriptive alt text to all images
- [ ] Improve link text (avoid generic terms)
- [ ] Add missing main landmarks
- [ ] Ensure proper semantic HTML

---

## 🎯 Expected Score Improvement

### After Critical Fixes Only
- **Current:** 66/100 average
- **After fixes:** ~85-90/100 average
- **Level:** WCAG A (most pages)

### After All Fixes
- **Expected:** 95-98/100 average
- **Level:** WCAG AA (all pages)

---

## 🚀 Implementation Steps

### Step 1: Fix Critical Errors (1-2 hours)
```bash
# 1. Edit markdown files to fix form labels and headings
# 2. Edit page templates to add lang and viewport
# 3. Rebuild
npm run build && npm run audit:a11y
```

### Step 2: Fix High-Priority Warnings (1-2 hours)
```bash
# 1. Add alt text to all images in markdown
# 2. Improve link text in documentation
# 3. Rebuild and verify
npm run build && npm run audit:a11y
```

### Step 3: Final Verification
```bash
# Run full audit
npm run audit:a11y

# Check specific files
npm run audit:a11y | grep "Score:"
```

---

## 📊 Score Targets by Phase

| Phase | Target Score | Level | Status |
|-------|--------------|-------|--------|
| Current | 66/100 | Below A | 🔴 |
| After Critical Fixes | 85/100 | A | 🟡 |
| After Warnings | 95/100 | AA | 🟢 |

---

## 💡 Key Improvements Summary

| Fix | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Form labels | +15-20 pts | Medium | 🔴 High |
| Heading hierarchy | +10-15 pts | Low | 🔴 High |
| Alt text | +10-20 pts per file | Medium | 🟡 Medium |
| Link text | +5-10 pts per file | Low | 🟡 Medium |
| Missing h1 | +5-10 pts | Low | 🔴 High |
| Lang attribute | +3-5 pts | Very Low | 🔴 High |
| Viewport meta | +2-3 pts | Very Low | 🟡 Medium |
| List markup | +2-3 pts | Very Low | 🔴 High |

---

## ✅ Verification Commands

After each fix, run:

```bash
# Full audit
npm run audit:a11y

# Get summary only
npm run audit:a11y | tail -20

# Count errors
npm run audit:a11y | grep "❌" | wc -l

# See average score
npm run audit:a11y | grep "Average score"
```

---

## 📚 Resources

- **Alt Text Guide:** https://webaim.org/articles/alttext/
- **Link Text:** https://webaim.org/articles/hypertext/
- **Heading Structure:** https://webaim.org/articles/headings/
- **WCAG 2.1 AA:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Next Actions

**Immediate (Next 30 minutes):**
1. Fix form label errors in migration.md and accessibility.md
2. Fix heading hierarchy in theming.md
3. Add lang and viewport attributes to templates

**Short-term (Next 1-2 hours):**
4. Add descriptive alt text to all images
5. Improve link text in documentation

**Verification:**
6. Run `npm run audit:a11y`
7. Verify average score increased to 90+

---

**Goal:** Achieve WCAG 2.1 AA compliance (90+ average score, all pages passing)

Start with Priority 1 fixes - they're quick wins that dramatically improve the score!
