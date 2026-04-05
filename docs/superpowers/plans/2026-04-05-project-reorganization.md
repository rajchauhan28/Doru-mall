# Project Reorganization & Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modularize the DoruMart application by separating HTML, CSS, and JS, while securing Supabase credentials.

**Architecture:** We will transition from a single-file application to a modular structure where `index.html` links to external `style.css` and `app.js` files. Credentials will be isolated in a git-ignored configuration file.

**Tech Stack:** HTML/JS, Supabase SDK, Git.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `css/` (directory)
- Create: `js/` (directory)

- [ ] **Step 1: Create directories**
Run: `mkdir css js`

- [ ] **Step 2: Commit**
```bash
git add css js
git commit -m "chore: scaffold project structure"
```

### Task 2: Extract CSS

**Files:**
- Create: `css/style.css`
- Modify: `index.html`

- [ ] **Step 1: Copy CSS content**
Extract everything inside the `<style>` tags in `index.html` and write it to `css/style.css`.

- [ ] **Step 2: Link CSS in `index.html`**
Replace the `<style>` block in `index.html` with:
```html
<link rel="stylesheet" href="css/style.css">
```

- [ ] **Step 3: Commit**
```bash
git add css/style.css index.html
git commit -m "refactor: extract styles to external CSS"
```

### Task 3: Secure Supabase Configuration

**Files:**
- Create: `js/supabase-config.js`
- Create: `js/supabase-config.example.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create `js/supabase-config.js`**
Write the actual credentials to this file.

```javascript
const SUPABASE_URL = 'https://wtcqfvypjjaynyggphzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Y3FmdnlwampheW55Z2dwaHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDY1NTIsImV4cCI6MjA5MDk4MjU1Mn0.miub1_bIM77HPonhjY7FvI_0cXYnaDuCT9ru-QUG0Bc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 2: Create `js/supabase-config.example.js`**
Write placeholder credentials to this file.

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 3: Update `.gitignore`**
Append `js/supabase-config.js` to the `.gitignore` file.

- [ ] **Step 4: Commit**
```bash
git add js/supabase-config.example.js .gitignore
git commit -m "feat: implement secure credential management"
```

### Task 4: Extract Application Logic

**Files:**
- Create: `js/app.js`
- Modify: `index.html`

- [ ] **Step 1: Copy JS content**
Extract everything inside the `<script>` tags in `index.html` (EXCEPT the Supabase client initialization) and write it to `js/app.js`.

- [ ] **Step 2: Link JS in `index.html`**
Replace the `<script>` block in `index.html` with:
```html
<script src="js/supabase-config.js"></script>
<script src="js/app.js"></script>
```

- [ ] **Step 3: Commit**
```bash
git add js/app.js index.html
git commit -m "refactor: extract application logic to external JS"
```

### Task 5: Final Review & Push

- [ ] **Step 1: Verify application works**
Open `index.html` in a browser and ensure all features are functional.

- [ ] **Step 2: Final Push**
```bash
git push origin main
```
