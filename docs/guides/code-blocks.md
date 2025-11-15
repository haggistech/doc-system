---
title: Enhanced Code Blocks
description: How to use code block titles, line highlighting, and line numbers
---

# Enhanced Code Blocks

The documentation system supports enhanced code blocks with titles, line highlighting, and toggleable line numbers.

## Basic Code Block

Standard code block with language syntax highlighting:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

## Code Block with Title

Add a title to show the filename or description:

```javascript title="greet.js"
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

**Syntax:**
````markdown
```javascript title="greet.js"
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

## Line Highlighting

Highlight specific lines to draw attention:

```javascript {2,4-6}
function calculateTotal(items) {
  let total = 0;  // highlighted
  for (const item of items) {
    total += item.price;      // highlighted
    total += item.tax || 0;   // highlighted
    total -= item.discount || 0;  // highlighted
  }
  return total;
}
```

**Syntax:**
````markdown
```javascript {2,4-6}
function calculateTotal(items) {
  let total = 0;  // Line 2 - highlighted
  for (const item of items) {
    total += item.price;      // Line 4 - highlighted
    total += item.tax || 0;   // Line 5 - highlighted
    total -= item.discount || 0;  // Line 6 - highlighted
  }
  return total;
}
```
````

**Syntax options:**
- `{1}` - Highlight line 1
- `{1,3,5}` - Highlight lines 1, 3, and 5
- `{1-5}` - Highlight lines 1 through 5
- `{1,3-5,7}` - Combine single lines and ranges

## Title + Line Highlighting

Combine both features:

```typescript title="config.ts" {3,5-7}
interface Config {
  title: string;
  description: string;  // highlighted
  baseUrl: string;
  navbar: {             // highlighted
    title: string;      // highlighted
    links: Link[];      // highlighted
  };
}
```

**Syntax:**
````markdown
```typescript title="config.ts" {3,5-7}
interface Config {
  title: string;
  description: string;  // Line 3 - highlighted
  baseUrl: string;
  navbar: {             // Lines 5-7 highlighted
    title: string;
    links: Link[];
  };
}
```
````

## Line Numbers Toggle

All code blocks have a line numbers toggle button in the top-right corner. Click it to show/hide line numbers on all code blocks.

The preference is saved in localStorage and persists across page reloads.

## Examples by Language

### JavaScript/TypeScript

```javascript title="auth.js" {5,7-9}
const express = require('express');
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;  // highlighted
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {  // highlighted
  return await bcrypt.compare(password, hash);   // highlighted
}                                                 // highlighted

module.exports = { hashPassword, verifyPassword };
```

### Python

```python title="calculator.py" {2,4-6}
def calculate(a, b, operation):
    """Perform arithmetic operations"""  # highlighted

    if operation == 'add':          # highlighted
        return a + b                # highlighted
    elif operation == 'subtract':   # highlighted
        return a - b
    elif operation == 'multiply':
        return a * b
    elif operation == 'divide':
        return a / b if b != 0 else None
```

### Bash

```bash title="deploy.sh" {3-5}
#!/bin/bash

npm run build          # highlighted
npm test               # highlighted
npm run deploy         # highlighted

echo "Deployment complete!"
```

### JSON

```json title="package.json" {3-5}
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  }
}
```

### YAML

```yaml title=".github/workflows/ci.yml" {5-7}
name: CI

on: [push, pull_request]

jobs:           # highlighted
  test:         # highlighted
    runs-on: ubuntu-latest  # highlighted
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

### CSS

```css title="styles.css" {2,4-6}
.button {
  padding: 0.5rem 1rem;    /* highlighted */
  border-radius: 4px;
  background: #2563eb;     /* highlighted */
  color: white;            /* highlighted */
  border: none;            /* highlighted */
  cursor: pointer;
}
```

### HTML

```html title="index.html" {5-7}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>          <!-- highlighted -->
  <link rel="stylesheet" href="styles.css">  <!-- highlighted -->
  <script src="app.js"></script>  <!-- highlighted -->
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

### SQL

```sql title="schema.sql" {1-3}
CREATE TABLE users (             -- highlighted
  id SERIAL PRIMARY KEY,         -- highlighted
  username VARCHAR(50) NOT NULL, -- highlighted
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_username ON users(username);
```

## Diff-style Highlighting

You can use line highlighting to show additions and removals:

```javascript title="refactor.js" {1,6}
// Old approach
function fetchData() {                    // Remove (highlighted in blue)
  return fetch('/api/data').then(r => r.json());
}

// New approach
async function fetchData() {              // Add (highlighted in blue)
  const response = await fetch('/api/data');
  return response.json();
}
```

## Complex Example

```typescript title="api/users.ts" {8-10,15-17,22}
import { Router } from 'express';
import { hashPassword, verifyPassword } from '../utils/auth';
import { db } from '../database';

const router = Router();

// Create new user
router.post('/users', async (req, res) => {     // highlighted
  const { username, password } = req.body;       // highlighted
  const hashedPassword = await hashPassword(password);  // highlighted

  const user = await db.users.create({
    username,
    password: hashedPassword
  });                                             // highlighted

  res.status(201).json({ id: user.id, username: user.username });  // highlighted
});                                               // highlighted

// Login
router.post('/login', async (req, res) => {      // highlighted
  const { username, password } = req.body;
  const user = await db.users.findOne({ username });

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: generateToken(user) });
});

export default router;
```

## Tips

1. **Use titles for file context** - Help readers understand which file the code belongs to
2. **Highlight important lines** - Draw attention to the key parts of the code
3. **Combine features** - Use both title and highlighting for maximum clarity
4. **Toggle line numbers** - Click the line number button to show/hide numbers
5. **Line number preference persists** - Your choice is saved and applies to all pages

## Syntax Reference

| Feature | Syntax | Example |
|---------|--------|---------|
| Basic code block | \`\`\`language | \`\`\`javascript |
| With title | \`\`\`language title="file" | \`\`\`js title="app.js" |
| Highlight single line | \`\`\`language {line} | \`\`\`python {5} |
| Highlight multiple lines | \`\`\`language {1,3,5} | \`\`\`js {1,3,5} |
| Highlight range | \`\`\`language {start-end} | \`\`\`ts {2-6} |
| Combined | \`\`\`language {1,3-5,7} | \`\`\`bash {1,3-5,7} |
| Title + highlighting | \`\`\`lang title="file" {lines} | \`\`\`js title="a.js" {2,4} |

## Browser Support

All enhanced code block features work in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

Line numbers and highlighting use modern CSS features (CSS custom properties, ::before pseudo-elements) supported by all modern browsers.
