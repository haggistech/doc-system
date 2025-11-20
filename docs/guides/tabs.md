---
title: Tabs Component
description: How to use tabs to show code examples in multiple languages
---

# Tabs Component

The documentation system includes a tabs component that allows you to show the same content in multiple languages or frameworks. This is perfect for API documentation, code examples, and multi-platform guides.

## Basic Syntax

Use `:::tabs` to create a tabbed interface. Each tab is defined with `== Tab Name`:

```markdown
:::tabs
== JavaScript
```javascript
console.log('Hello World');
```

== Python
```python
print('Hello World')
```

== Ruby
```ruby
puts 'Hello World'
```
:::
```

**Result:**

:::tabs
== JavaScript
```javascript
console.log('Hello World');
```

== Python
```python
print('Hello World')
```

== Ruby
```ruby
puts 'Hello World'
```
:::

## How It Works

1. **Start** with `:::tabs` on its own line
2. **Define tabs** using `== Tab Name` (two equals signs followed by a space and the tab name)
3. **Add content** for each tab (can include code blocks, text, lists, etc.)
4. **End** with `:::` on its own line

## Code Examples in Multiple Languages

Perfect for showing the same functionality across different programming languages:

:::tabs
== JavaScript
```javascript
// Fetch user data from API
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

const user = await getUser(123);
console.log(user.name);
```

== Python
```python
# Fetch user data from API
import requests

def get_user(id):
    response = requests.get(f'/api/users/{id}')
    return response.json()

user = get_user(123)
print(user['name'])
```

== Go
```go
// Fetch user data from API
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func getUser(id int) (map[string]interface{}, error) {
    resp, err := http.Get(fmt.Sprintf("/api/users/%d", id))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var user map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&user)
    return user, nil
}

func main() {
    user, _ := getUser(123)
    fmt.Println(user["name"])
}
```

== Rust
```rust
// Fetch user data from API
use serde_json::Value;

async fn get_user(id: u32) -> Result<Value, reqwest::Error> {
    let url = format!("/api/users/{}", id);
    let response = reqwest::get(&url).await?;
    response.json::<Value>().await
}

#[tokio::main]
async fn main() {
    let user = get_user(123).await.unwrap();
    println!("{}", user["name"]);
}
```
:::

## Framework-Specific Examples

Show the same component in different frameworks:

:::tabs
== React
```jsx title="Button.jsx"
import React from 'react';

function Button({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-primary"
    >
      {children}
    </button>
  );
}

export default Button;
```

== Vue
```vue title="Button.vue"
<template>
  <button
    @click="onClick"
    class="btn btn-primary"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    onClick: Function
  }
}
</script>
```

== Svelte
```svelte title="Button.svelte"
<script>
  export let onClick;
</script>

<button
  on:click={onClick}
  class="btn btn-primary"
>
  <slot></slot>
</button>
```

== Angular
```typescript title="button.component.ts"
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      (click)="onClick.emit()"
      class="btn btn-primary"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Output() onClick = new EventEmitter<void>();
}
```
:::

## Installation Instructions

Show installation steps for different package managers:

:::tabs
== npm
```bash
npm install my-package
```

== yarn
```bash
yarn add my-package
```

== pnpm
```bash
pnpm add my-package
```

== bun
```bash
bun add my-package
```
:::

## Configuration Examples

Different configuration formats:

:::tabs
== JSON
```json title="config.json"
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

== YAML
```yaml title="config.yaml"
name: my-app
version: 1.0.0
scripts:
  dev: vite
  build: vite build
dependencies:
  react: ^18.2.0
```

== TOML
```toml title="config.toml"
name = "my-app"
version = "1.0.0"

[scripts]
dev = "vite"
build = "vite build"

[dependencies]
react = "^18.2.0"
```
:::

## Platform-Specific Instructions

:::tabs
== macOS
```bash
# Install using Homebrew
brew install my-tool

# Verify installation
my-tool --version
```

## Linux
```bash
# Install using apt (Debian/Ubuntu)
sudo apt update
sudo apt install my-tool

# Verify installation
my-tool --version
```

## Windows
```powershell
# Install using Chocolatey
choco install my-tool

# Verify installation
my-tool --version
```
:::

## Mixed Content Types

Tabs can contain any markdown content, not just code blocks:

:::tabs
== Overview
This is the **overview** tab with regular markdown content.

You can include:
- Lists
- **Bold text**
- *Italic text*
- [Links](https://example.com)

And even paragraphs of text explaining concepts.

== Code Example
```javascript
// Here's the code implementation
function example() {
  return 'This tab has code';
}
```

== API Reference
### `myFunction(param)`

**Parameters:**
- `param` (string): Description of the parameter

**Returns:** Description of return value

**Example:**
```javascript
const result = myFunction('hello');
```
:::

## REST API Methods

:::tabs
== GET
```bash
# Get a resource
curl -X GET https://api.example.com/users/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
```

== POST
```bash
# Create a resource
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com"
  }'
```

**Response:**
```json
{
  "id": 124,
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

== PUT
```bash
# Update a resource
curl -X PUT https://api.example.com/users/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Updated",
    "email": "john.new@example.com"
  }'
```

== DELETE
```bash
# Delete a resource
curl -X DELETE https://api.example.com/users/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```
:::

## Database Queries

:::tabs
== SQL
```sql
-- Select users with recent activity
SELECT u.id, u.name, u.email, MAX(a.created_at) as last_activity
FROM users u
JOIN activities a ON u.id = a.user_id
WHERE a.created_at > NOW() - INTERVAL 30 DAY
GROUP BY u.id, u.name, u.email
ORDER BY last_activity DESC;
```

== MongoDB
```javascript
// Select users with recent activity
db.users.aggregate([
  {
    $lookup: {
      from: "activities",
      localField: "_id",
      foreignField: "user_id",
      as: "activities"
    }
  },
  {
    $match: {
      "activities.created_at": {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      last_activity: { $max: "$activities.created_at" }
    }
  },
  {
    $sort: { last_activity: -1 }
  }
]);
```

== PostgreSQL
```sql
-- Select users with recent activity
SELECT u.id, u.name, u.email, MAX(a.created_at) as last_activity
FROM users u
JOIN activities a ON u.id = a.user_id
WHERE a.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
ORDER BY last_activity DESC;
```
:::

## Combining with Enhanced Code Blocks

You can use code block features (titles, line highlighting) inside tabs:

:::tabs
== Before
```javascript title="old-code.js" {2,4}
function processData(data) {
  // Old inefficient approach
  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(transform(data[i]));
  }
  return results;
}
```

== After
```javascript title="new-code.js" {2-3}
function processData(data) {
  // New efficient approach using map
  return data.map(item => transform(item));
}
```
:::

## Best Practices

1. **Use meaningful tab names** - Tab names should clearly indicate what's in each tab
2. **Keep tabs consistent** - Use the same tab order across similar examples
3. **Don't overload tabs** - 2-6 tabs is ideal; more than that becomes hard to navigate
4. **Consider the first tab** - The first tab is shown by default, so put the most popular/relevant option first
5. **Test on mobile** - Tabs are horizontally scrollable on mobile devices

## Tips

- **Tab names** can include spaces and special characters: `== Node.js (v20+)`
- **Content** can be any valid markdown including headings, lists, code blocks, etc.
- **Nesting** tabs inside tabs is not recommended and may not work correctly
- **Empty tabs** are not recommended; each tab should have meaningful content

## Syntax Reference

```markdown
:::tabs
== First Tab Name
Content for first tab goes here.
Can be multiple lines.

== Second Tab Name
Content for second tab.

== Third Tab Name
More content here.
:::
```

**Rules:**
- Must start with `:::tabs` on its own line
- Each tab starts with `== Tab Name` (two equals signs, space, then the name)
- Content follows each tab declaration until the next `==` or `:::`
- Must end with `:::` on its own line

## Browser Support

The tabs component works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

Features used:
- CSS Flexbox for layout
- CSS animations for smooth transitions
- JavaScript ES6+ for interactivity
- Touch scrolling for mobile tab navigation
