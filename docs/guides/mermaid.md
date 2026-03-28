---
title: Mermaid Diagrams
description: Visualise architecture, flows, and relationships with Mermaid diagrams
---

# Mermaid Diagrams

Mermaid lets you write diagrams as code inside fenced code blocks. Use ` ```mermaid ` to render any supported diagram type.

## Flowchart

```mermaid
flowchart TD
    A([User visits docs]) --> B{Logged in?}
    B -->|Yes| C[Show full content]
    B -->|No| D[Show public content]
    C --> E[Track analytics]
    D --> F[Show login prompt]
    E --> G([Done])
    F --> G
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant DB

    Browser->>Server: GET /docs/intro
    Server->>DB: Query page metadata
    DB-->>Server: Return metadata
    Server-->>Browser: Return HTML
    Browser->>Server: GET /search-index.json
    Server-->>Browser: Return search index
    Note over Browser: Fuse.js initialised
```

## Entity Relationship Diagram

```mermaid
erDiagram
    DOCUMENT {
        string slug PK
        string title
        string description
        date created
        date lastUpdated
    }
    AUTHOR {
        string name PK
        string email
    }
    CATEGORY {
        string name PK
        string path
    }

    DOCUMENT }o--|| AUTHOR : "written by"
    DOCUMENT }o--|| CATEGORY : "belongs to"
```

## Git Graph

```mermaid
gitGraph
    commit id: "Initial release v1.0.0"
    branch feature/search
    checkout feature/search
    commit id: "Add Fuse.js integration"
    commit id: "Add keyboard navigation"
    checkout main
    merge feature/search id: "feat: Fuzzy search"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "Add mermaid renderer"
    checkout main
    merge feature/mermaid id: "feat: Mermaid diagrams"
    commit id: "Release v1.2.0" tag: "v1.2.0"
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Searching : user types
    Searching --> Results : matches found
    Searching --> Empty : no matches
    Results --> Idle : Escape key
    Empty --> Idle : Escape key
    Results --> Navigate : arrow keys
    Navigate --> Selected : Enter key
    Selected --> [*]
```

## Pie Chart

```mermaid
pie title Doc pages by category
    "Guides" : 8
    "Reference" : 3
    "Tutorials" : 2
    "Other" : 1
```

## Syntax

All diagrams use a fenced code block with `mermaid` as the language:

~~~
```mermaid
flowchart LR
    A --> B --> C
```
~~~

See the [Mermaid documentation](https://mermaid.js.org/intro/) for the full syntax reference.
