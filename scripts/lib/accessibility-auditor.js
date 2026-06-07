/**
 * WCAG 2.1 AA Accessibility Audit
 * Checks for common accessibility issues
 */

/**
 * Audit result
 * @typedef {Object} AuditResult
 * @property {string} rule - Rule name
 * @property {string} level - 'error' | 'warning' | 'info'
 * @property {string} message - Description
 * @property {number} line - Approximate line number
 * @property {string} element - HTML element
 * @property {string} suggestion - How to fix
 */

/**
 * Parse HTML and extract text content
 * @param {string} html - HTML content
 * @returns {string} Text content
 */
function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check for proper heading hierarchy
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkHeadingHierarchy(html) {
  const issues = [];
  const headings = [...html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi)];

  let lastLevel = 0;
  for (const match of headings) {
    const level = parseInt(match[1]);
    const text = match[2].trim();

    if (level > lastLevel + 1 && lastLevel !== 0) {
      issues.push({
        rule: 'heading-hierarchy',
        level: 'error',
        message: `Heading hierarchy broken: jumped from H${lastLevel} to H${level}`,
        element: `<h${level}>${text}</h${level}>`,
        suggestion: `Use H${lastLevel + 1} instead of H${level}`
      });
    }

    if (text.length === 0) {
      issues.push({
        rule: 'empty-heading',
        level: 'error',
        message: `H${level} is empty`,
        element: `<h${level}></h${level}>`,
        suggestion: 'Add descriptive text to heading'
      });
    }

    lastLevel = level;
  }

  if (headings.length === 0) {
    issues.push({
      rule: 'missing-h1',
      level: 'error',
      message: 'Page has no h1 heading',
      element: 'body',
      suggestion: 'Add one H1 heading at the top of the page'
    });
  }

  const h1s = headings.filter(m => m[1] === '1');
  if (h1s.length > 1) {
    issues.push({
      rule: 'multiple-h1',
      level: 'warning',
      message: `Page has ${h1s.length} H1 headings (should have 1)`,
      element: 'body',
      suggestion: 'Keep only one H1 per page'
    });
  }

  return issues;
}

/**
 * Check for images without alt text
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkImages(html) {
  const issues = [];
  const images = [...html.matchAll(/<img[^>]+>/gi)];

  for (const img of images) {
    const src = img[0].match(/src=["']([^"']+)["']/i)?.[1] || '';
    const alt = img[0].match(/alt=["']([^"']+)["']/i)?.[1];

    if (!alt) {
      issues.push({
        rule: 'missing-alt-text',
        level: 'error',
        message: `Image missing alt text: ${src}`,
        element: img[0],
        suggestion: `Add alt="${src.split('/').pop().split('.')[0]}" describing the image`
      });
    } else if (alt.length < 3) {
      issues.push({
        rule: 'poor-alt-text',
        level: 'warning',
        message: `Image alt text too short: "${alt}"`,
        element: img[0],
        suggestion: 'Provide a descriptive alt text (at least 3 characters)'
      });
    }

    // Check for decorative images
    if (alt === 'image' || alt === 'photo' || alt === 'picture') {
      issues.push({
        rule: 'vague-alt-text',
        level: 'warning',
        message: `Image has vague alt text: "${alt}"`,
        element: img[0],
        suggestion: 'Use descriptive alt text instead of generic terms'
      });
    }
  }

  return issues;
}

/**
 * Check for form labels
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkFormLabels(html) {
  const issues = [];
  const inputs = [...html.matchAll(/<input[^>]+>/gi)];
  const textareas = [...html.matchAll(/<textarea[^>]*>/gi)];
  const selects = [...html.matchAll(/<select[^>]*>/gi)];

  const allFormElements = [...inputs, ...textareas, ...selects];

  for (const element of allFormElements) {
    const id = element[0].match(/id=["']([^"']+)["']/i)?.[1];
    const name = element[0].match(/name=["']([^"']+)["']/i)?.[1] || '';
    const ariaLabel = element[0].match(/aria-label=["']([^"']+)["']/i)?.[1];
    const placeholder = element[0].match(/placeholder=["']([^"']+)["']/i)?.[1];

    // Check if form element has associated label
    if (id && !html.includes(`<label for="${id}"`)) {
      if (!ariaLabel && !placeholder) {
        issues.push({
          rule: 'form-missing-label',
          level: 'error',
          message: `Form input missing label: ${name}`,
          element: element[0].substring(0, 50),
          suggestion: `Add <label for="${id}">Label text</label> or aria-label attribute`
        });
      }
    }

    if (!id && !ariaLabel && !placeholder) {
      issues.push({
        rule: 'form-no-label',
        level: 'error',
        message: `Form input has no accessible label`,
        element: element[0].substring(0, 50),
        suggestion: 'Add id + label, aria-label, or placeholder attribute'
      });
    }
  }

  return issues;
}

/**
 * Check for link text quality
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkLinkText(html) {
  const issues = [];
  const links = [...html.matchAll(/<a[^>]*href=["']([^"']*?)["'][^>]*>([^<]+)<\/a>/gi)];

  const poorLinkText = ['click here', 'click', 'link', 'more', 'read more', 'view', 'go'];

  for (const link of links) {
    const href = link[1];
    const text = link[2].trim().toLowerCase();

    if (poorLinkText.includes(text)) {
      issues.push({
        rule: 'poor-link-text',
        level: 'warning',
        message: `Link has non-descriptive text: "${link[2]}"`,
        element: link[0].substring(0, 60),
        suggestion: `Use descriptive link text like "Learn about JavaScript"`
      });
    }

    if (text.length < 3 && text !== '»' && text !== '→' && text !== '#') {
      issues.push({
        rule: 'short-link-text',
        level: 'warning',
        message: `Link text too short: "${link[2]}"`,
        element: link[0].substring(0, 60),
        suggestion: 'Use more descriptive link text'
      });
    }
  }

  return issues;
}

/**
 * Check for semantic HTML
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkSemanticHTML(html) {
  const issues = [];

  // Check for main landmark
  if (!/<main[^>]*>/i.test(html)) {
    issues.push({
      rule: 'missing-main',
      level: 'warning',
      message: 'Page missing <main> landmark',
      element: 'body',
      suggestion: 'Wrap main content in <main></main>'
    });
  }

  // Check for nav landmark
  if (!/<nav[^>]*>/i.test(html)) {
    issues.push({
      rule: 'missing-nav',
      level: 'info',
      message: 'Page missing <nav> landmark',
      element: 'body',
      suggestion: 'Wrap navigation in <nav></nav>'
    });
  }

  // Check for article landmark
  if (/<article[^>]*>/i.test(html)) {
    if (!/<header[^>]*>/i.test(html)) {
      issues.push({
        rule: 'article-missing-header',
        level: 'info',
        message: 'Article missing <header>',
        element: '<article>',
        suggestion: 'Include <header> with heading inside <article>'
      });
    }
  }

  // Check for lists
  const lists = html.match(/<li[\s>]/gi) || [];
  if (lists.length > 0) {
    if (!/<ul[^>]*>|<ol[^>]*>/gi.test(html)) {
      issues.push({
        rule: 'invalid-list',
        level: 'error',
        message: '<li> elements found without <ul> or <ol>',
        element: '<li>',
        suggestion: 'Wrap <li> elements in <ul> or <ol>'
      });
    }
  }

  return issues;
}

/**
 * Check for color contrast
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkColorContrast(html) {
  const issues = [];

  // Check for inline styles with potential contrast issues
  const inlineStyles = [...html.matchAll(/style=["']([^"']+)["']/gi)];

  for (const style of inlineStyles) {
    const styleText = style[1];
    const hasColor = /color\s*:\s*/i.test(styleText);
    const hasBg = /background|bg/i.test(styleText);

    if (hasColor && hasBg) {
      issues.push({
        rule: 'potential-contrast-issue',
        level: 'warning',
        message: 'Inline styles may have contrast issues',
        element: `style="${styleText.substring(0, 40)}"`,
        suggestion: 'Verify text has 4.5:1 contrast ratio for AA compliance'
      });
    }
  }

  return issues;
}

/**
 * Check for language attribute
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkLanguage(html) {
  const issues = [];

  if (!/<html[^>]*lang=/i.test(html)) {
    issues.push({
      rule: 'missing-lang',
      level: 'error',
      message: '<html> element missing lang attribute',
      element: '<html>',
      suggestion: 'Add lang="en" (or appropriate language code)'
    });
  }

  return issues;
}

/**
 * Check for viewport meta tag
 * @param {string} html - HTML content
 * @returns {Array<AuditResult>}
 */
export function checkViewport(html) {
  const issues = [];

  if (!/<meta[^>]*viewport/i.test(html)) {
    issues.push({
      rule: 'missing-viewport',
      level: 'error',
      message: 'Missing viewport meta tag',
      element: '<head>',
      suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  }

  return issues;
}

/**
 * Run complete accessibility audit
 * @param {string} html - HTML content
 * @returns {Object} Audit results with statistics
 */
export function auditAccessibility(html) {
  const allIssues = [
    ...checkLanguage(html),
    ...checkViewport(html),
    ...checkHeadingHierarchy(html),
    ...checkImages(html),
    ...checkFormLabels(html),
    ...checkLinkText(html),
    ...checkSemanticHTML(html),
    ...checkColorContrast(html)
  ];

  const errors = allIssues.filter(i => i.level === 'error');
  const warnings = allIssues.filter(i => i.level === 'warning');
  const infos = allIssues.filter(i => i.level === 'info');

  // Calculate compliance score (0-100)
  const maxIssues = 50;
  const complianceScore = Math.max(0, 100 - ((allIssues.length / maxIssues) * 100));

  return {
    issues: allIssues,
    stats: {
      total: allIssues.length,
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
      score: Math.round(complianceScore)
    },
    wcagLevel: complianceScore >= 90 ? 'AA' : complianceScore >= 70 ? 'A' : 'Below A',
    passed: allIssues.filter(i => i.level === 'error').length === 0
  };
}

/**
 * Generate accessibility report HTML
 * @param {Object} auditResult - Result from auditAccessibility()
 * @returns {string} HTML report
 */
export function generateAccessibilityReport(auditResult) {
  const { issues, stats, wcagLevel, passed } = auditResult;

  let html = `
<section class="accessibility-report">
  <h2>Accessibility Audit Report</h2>

  <div class="audit-summary">
    <div class="score-badge">
      <div class="score">${stats.score}</div>
      <div class="level">WCAG ${wcagLevel}</div>
    </div>
    <div class="stats">
      <p><strong>${passed ? '✅ PASSED' : '❌ FAILED'}</strong> accessibility requirements</p>
      <ul>
        <li>${stats.errors} errors (must fix)</li>
        <li>${stats.warnings} warnings (should fix)</li>
        <li>${stats.infos} info items</li>
      </ul>
    </div>
  </div>

  <div class="issues-list">
`;

  // Group by level
  const levels = ['error', 'warning', 'info'];
  const icons = { error: '❌', warning: '⚠️', info: 'ℹ️' };

  for (const level of levels) {
    const levelIssues = issues.filter(i => i.level === level);
    if (levelIssues.length === 0) continue;

    html += `<div class="issues-group">
      <h3>${icons[level]} ${level.charAt(0).toUpperCase() + level.slice(1)}s (${levelIssues.length})</h3>
      <ul>`;

    for (const issue of levelIssues) {
      html += `<li>
        <div class="issue-title"><strong>${issue.rule}</strong></div>
        <div class="issue-message">${issue.message}</div>
        <div class="issue-suggestion"><em>Suggestion:</em> ${issue.suggestion}</div>
      </li>`;
    }

    html += `</ul></div>`;
  }

  html += `
  </div>
</section>`;

  return html;
}
