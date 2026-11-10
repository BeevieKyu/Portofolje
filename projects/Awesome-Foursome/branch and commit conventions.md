# Branching Strategy & Commit Conventions
This document describes how we structure branches, name them, and write commit messages. The goal is to keep the codebase clean, predictable, and easy to collaborate on.

## Branching Strategy

### **Main Branches**

| Branch      | Purpose                                                             |
| ----------- | ------------------------------------------------------------------- |
| `main`      | Always stable and deployable. All production-ready code lives here. |
| `feature/*` | Short‑lived branches for new work.                                  |
| `hotfix/*`  | Urgent fixes applied directly to `main`.                            |

This strategy is intentionally lightweight and supports continuous integration and fast iteration.

### **Branch Naming**

#### **Feature branches**

Kode

```
feature/<short-description>
```

Examples:

Kode

```
feature/dice-animation
feature/user-authentication
feature/improve-logging
```

#### **Hotfix branches**

Kode

```
hotfix/<issue-or-bug>
```

Examples:

Kode

```
hotfix/fix-null-pointer
hotfix/incorrect-dice-roll
```

### **Workflow**

#### **Feature Development**

1. Create a branch from `main`
    
    Kode
    
    ```
    git checkout -b feature/<name>
    ```
    
2. Commit small, frequent changes
    
3. Push and open a Pull Request (drafts encouraged)
    
4. Merge into `main` after review
    
5. Delete the branch
    

#### **Hotfixes**

1. Branch off `main`
    
2. Fix the issue
    
3. Merge back into `main`
    
4. Deploy immediately
    

## Commit Conventions

We use **Conventional Commits** to keep history readable and enable automated tooling.

### **Format**

Kode

```
<type>(optional scope): <short summary>

optional body

optional footer
```

### **Allowed Types**

|Type|Meaning|
|---|---|
|`feat`|New feature|
|`fix`|Bug fix|
|`docs`|Documentation only|
|`style`|Formatting, no logic changes|
|`refactor`|Code restructure|
|`test`|Adding or updating tests|
|`chore`|Build tools, CI, dependencies|

### **Examples**

#### Feature

Kode

```
feat(board): add dice animation trigger
```

#### Bug Fix

Kode

```
fix(auth): correct token refresh logic
```

#### Documentation

Kode

```
docs: update setup instructions in README
```

#### Refactor

Kode

```
refactor(game): simplify scoring logic
```

## Pull Request Guidelines

- PR titles follow the same format as commit messages
    
- Keep PRs small and focused
    
- Include screenshots or GIFs for UI changes
    
- Link issues when relevant
    
- Request review early
    

## Summary

This workflow ensures:

- Predictable branch flow
    
- Clean commit history
    
- Faster code reviews
    
- Compatibility with automated tools (semantic-release, changelog generators, CI triggers)