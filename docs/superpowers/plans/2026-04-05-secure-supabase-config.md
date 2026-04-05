# Secure Supabase Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolate Supabase credentials and protect them from Git by extracting them to a separate file and updating `.gitignore`.

**Architecture:** Moving hardcoded Supabase initialization logic from `index.html` to a dedicated `js/supabase-config.js` file. A `js/supabase-config.example.js` is provided as a template for other developers.

**Tech Stack:** JavaScript, Supabase JS SDK.

---

### Task 1: Create Supabase Config Files

**Files:**
- Create: `js/supabase-config.js`
- Create: `js/supabase-config.example.js`

- [ ] **Step 1: Create `js/supabase-config.js` with real credentials**

```javascript
// --- Supabase Config ---
const SUPABASE_URL = 'https://wtcqfvypjjaynyggphzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Y3FmdnlwampheW55Z2dwaHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDY1NTIsImV4cCI6MjA5MDk4MjU1Mn0.miub1_bIM77HPonhjY7FvI_0cXYnaDuCT9ru-QUG0Bc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 2: Create `js/supabase-config.example.js` with placeholders**

```javascript
// --- Supabase Config Example ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### Task 2: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `js/supabase-config.js` to `.gitignore`**

Run: `echo "js/supabase-config.js" >> .gitignore`

- [ ] **Step 2: Verify `.gitignore` content**

Run: `cat .gitignore`
Expected: Should contain `js/supabase-config.js`.

---

### Task 3: Update index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove hardcoded config and import script**

Replace lines 341-344:
```javascript
// --- Supabase Config ---
const SUPABASE_URL = 'https://wtcqfvypjjaynyggphzd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Y3FmdnlwampheW55Z2dwaHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDY1NTIsImV4cCI6MjA5MDk4MjU1Mn0.miub1_bIM77HPonhjY7FvI_0cXYnaDuCT9ru-QUG0Bc';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

With:
```javascript
// Supabase initialization logic moved to js/supabase-config.js
```

And add the script tag in the `<head>` after the Supabase SDK script.

- [ ] **Step 2: Verify `index.html` structure**

Check that `<script src="js/supabase-config.js"></script>` is present and the old variables are gone.

---

### Task 4: Finalize and Commit

- [ ] **Step 1: Check git status to ensure `js/supabase-config.js` is ignored**

Run: `git status`
Expected: `js/supabase-config.js` should NOT be listed as an untracked file.

- [ ] **Step 2: Add and commit allowed files**

Run: `git add js/supabase-config.example.js .gitignore index.html`
Run: `git commit -m "feat: implement secure credential management"`

- [ ] **Step 3: Verify commit**

Run: `git log -1`
Expected: Commit message "feat: implement secure credential management".
Run: `git ls-files js/supabase-config.js`
Expected: Should return nothing (not tracked).
