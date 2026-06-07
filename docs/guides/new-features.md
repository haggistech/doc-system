---
title: New Features Added
description: Overview of recently added documentation features
---

# New Features Added

This documentation system now includes four powerful new features to enhance the documentation experience.

## External Link Icons

All links that open in a new tab automatically display a small external link icon (🔗), helping users understand that they're leaving the documentation site.

**How it works:**
- Any link with `target="_blank"` automatically gets a small SVG icon appended
- The icon is styled with the same color as the link for visual consistency
- Hover over any external link to see the icon

**Example:**
Visit [Highlight.js documentation](https://highlightjs.org/docs/) to learn more about syntax highlighting.

## Feedback Widget

Each page now includes a "Was this page helpful?" widget at the bottom. This allows readers to provide quick feedback.

**Features:**
- Simple thumbs-up/thumbs-down interface
- Feedback is saved to localStorage (persists across sessions)
- Visual confirmation message after submission
- No server calls required (can be extended to send feedback to a server)

**Example:**
Look at the bottom of this page to see the feedback widget in action.

## API Reference Auto-Generation

Automatically generate API documentation from JSDoc comments in your source code.

### Getting Started

Add JSDoc comments to your code:

```javascript title="example.js"
/**
 * Calculate the sum of two numbers
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The sum of a and b
 * @example
 * const result = add(5, 3);
 * console.log(result); // 8
 */
export function add(a, b) {
  return a + b;
}
```

### Generate Documentation

Run the API docs generator:

```bash title="Generate API docs" {1}
npm run api-docs src docs/api
```

This scans your source files and generates markdown documentation with:
- Function/class descriptions
- Parameter tables with types
- Return value documentation
- Code examples
- Deprecation warnings

### Supported JSDoc Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` | Document function parameters | `@param {string} name - User name` |
| `@returns` | Document return value | `@returns {boolean} Success status` |
| `@example` | Include usage examples | `@example const x = foo()` |
| `@deprecated` | Mark as deprecated | `@deprecated Use newFunction instead` |

## Syntax Highlighting

The system supports syntax highlighting for **all languages** supported by Highlight.js, including:

**Programming Languages:**
- JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, Ruby, PHP, and many more

**Markup & Templates:**
- HTML, XML, CSS, Sass, Less
- JSON, YAML, TOML
- Markdown

**Databases:**
- SQL, PostgreSQL, MySQL, MongoDB

**Other:**
- Bash, PowerShell, Docker, Docker Compose
- GraphQL, Protobuf, and more

### Using Language-Specific Highlighting

Just specify the language in your code block:

:::tabs
== JavaScript
```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

== Python
```python
greeting = "Hello, World!"
print(greeting)
```

== Go
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

== Rust
```rust
fn main() {
    println!("Hello, World!");
}
```
:::

## Feature Integration

These features work together seamlessly:

- **Breadcrumbs + Pagination** — Navigate hierarchically through documentation
- **Search + External Links** — Find and explore related resources
- **Feedback + API Docs** — Get user feedback on API documentation quality
- **TOC + Syntax Highlighting** — Navigate through code examples easily

## What's Next?

These new features provide a solid foundation for comprehensive documentation. Consider:

- Extending the feedback widget to send data to analytics
- Auto-generating API docs as part of your CI/CD pipeline
- Using custom JSDoc tags for specialized documentation needs
- Creating API reference sections for each major version

---

**Have feedback about these features?** Use the feedback widget below to let us know!
